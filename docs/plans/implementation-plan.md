# Implementation Plan — URL Shortener

> From docs-only scaffold → working application.
> Stack (per [README](../../README.md#tech-stack)): **Next.js (App Router, TS) · Prisma · PostgreSQL · Redis · Auth.js**.
> Feature IDs reference [`docs/features.md`](../features.md). Endpoints reference [`docs/api.md`](../api.md). Schema references [`docs/database.md`](../database.md).

## Requirements restatement

Build a URL shortener with three surfaces:

1. **App / Web** — public UI to create short links (QR + copy), follow redirects, sign in with Google, view history, set expiry. (`FA001`–`FA006`)
2. **REST API** — programmatic link create / redirect / history / auth. (`docs/api.md`)
3. **CMS** — RBAC-governed admin dashboard for links, reports, blocklist, users, audit. (`FC001`–`FC007`)

The two operations everything builds on: **shorten** (long URL → `base62(id)` code) and **redirect** (code → original URL, 302 active / 410 expired / 404 missing-disabled-blocklisted).

## Architecture overview

```
apps/web (Next.js App Router)
├── app/                      # routes: public UI, [code] redirect, /admin CMS
│   ├── (public)/             # create link, history
│   ├── [code]/               # redirect handler (route segment)
│   ├── admin/                # CMS (RBAC-gated layout)
│   └── api/                  # Route Handlers (links, me, auth, admin)
├── lib/
│   ├── db/                   # Prisma client singleton
│   ├── shortcode/            # base62 encode/decode
│   ├── ratelimit/            # Redis sliding window
│   ├── auth/                 # Auth.js config + session helpers
│   ├── rbac/                 # role presets + permission guard
│   └── validation/           # zod schemas (URL, body parsing)
├── components/               # feature-organized UI (per web/coding-style)
└── prisma/                   # schema.prisma + migrations + seed
```

Repository pattern for data access; consistent API response envelope (`{ success, data, error, meta }`, per [`api.md`](../api.md)); server-side permission checks on every `/admin` route; audit log on every admin mutation.

---

## Phase 0 — Scaffold & tooling

**Goal:** runnable empty app + quality gates.

- [ ] `create-next-app` (App Router, TypeScript, ESLint).
- [ ] Add Prettier, stylelint, strict `tsconfig`.
- [ ] `docker-compose.yml` for local PostgreSQL + Redis.
- [ ] `.env.example` (DATABASE_URL, REDIS_URL, AUTH_SECRET, GOOGLE_ID/SECRET, SHORT_DOMAIN). Never commit real `.env`.
- [ ] Vitest + Playwright config; CI workflow (lint, typecheck, test, build).
- [ ] **Update CLAUDE.md** "State" section with the real build/test/lint commands once chosen.

**Depends on:** none (stack chosen — see [README](../../README.md#tech-stack)). **Complexity:** LOW.

## Phase 1 — Data layer

**Goal:** schema + migrations + repositories matching `docs/database.md`.

- [ ] `prisma/schema.prisma` models: `User`, `Account`, `Session`, `VerificationToken` (Auth.js),
  `TwoFactorBackupCode`, `Link`, `BlocklistDomain`, `Report`, `AuditLog`, `LinkDailyStats`.
- [ ] Enums: `UserRole`, `UserStatus`, `LinkStatus`, `ReportSource`, `ReportStatus`,
  `ReportResolution`, `ActorType`.
- [ ] Indexes: `Link.code` (unique), `Link.(user_id, created_at)`, `Link.anon_session_id`,
  `Link.expires_at`, `Link.domain`; `Account.(provider, provider_account_id)` (unique);
  `Report.(status, created_at)`; `AuditLog.created_at`.
- [ ] `Link.id` is `bigint` autoincrement (base62 source); other ids are cuid.
- [ ] Initial migration + Prisma client singleton.
- [ ] Repositories (findById, findByCode, create, update, list).
- [ ] Seed script (super_admin user, sample links).

**Depends on:** Phase 0. **Complexity:** LOW–MEDIUM.

## Phase 2 — Core: create + redirect (FA001, FA002)

**Goal:** the two operations end to end. This is the MVP spine.

- [ ] `lib/shortcode` base62 encode/decode (+ unit tests).
- [ ] `lib/validation` zod URL schema: http/https only, reject self-referential to `SHORT_DOMAIN`.
- [ ] `POST /api/links`: validate → insert → `code = base62(id)` → return `{ code, shortUrl, expiresAt }`.
- [ ] `GET /[code]`: lookup → **302** active · **410** expired · **404** missing/disabled/blocklisted.
  On success: atomic `click_count += 1` **and** upsert the day's `LinkDailyStats` row (same transaction).
- [ ] Create-link UI: input, result with short URL, **copy** action, **QR code** (FA001.x).
- [ ] Expired (410) friendly page; 404 page for missing/disabled.

**Depends on:** Phase 1. **Complexity:** MEDIUM. **This phase alone is a usable product.**

## Phase 3 — Auth & history (FA003, FA004)

- [ ] Auth.js with Google provider; identity via `accounts(provider, provider_account_id)` → `User` upsert.
- [ ] `GET /api/auth/signin/google` + `GET /api/auth/callback/google` (session + anon-link claim).
- [ ] `GET /api/me/links` (auth-gated): original URL, code, clicks, expiry status, created date.
- [ ] History UI page.

**Depends on:** Phases 1–2. **Complexity:** MEDIUM.

## Phase 4 — Expiration & anonymous claim (FA005)

- [ ] Anonymous: `expires_at = created_at + 30d`; authenticated: nullable (permanent); custom future date for authed.
- [ ] Signed `anon_session_id` cookie set for anonymous creators.
- [ ] Claim-on-sign-in: `UPDATE links SET user_id, expires_at=NULL WHERE anon_session_id=? AND user_id IS NULL`.
- [ ] Enforce 30d cap on anonymous `expiresAt` input.

**Depends on:** Phase 3. **Complexity:** MEDIUM.

## Phase 5 — Rate limiting (FA006)

- [ ] `lib/ratelimit` Redis sliding window (or token bucket), per-IP.
- [ ] Apply to anonymous `POST /api/links` before insert; return `429`.
- [ ] Configurable cap via env.

**Depends on:** Phases 0, 2. **Complexity:** LOW–MEDIUM.

## Phase 6 — CMS foundation & RBAC (FC001, FC002)

- [ ] `lib/rbac`: role presets (`user | admin | super_admin`) + `requirePermission` server guard.
- [ ] `/admin` layout gated server-side; redirect unauthorized.
- [ ] Dashboard (FC001): KPI cards (total links, clicks, users) + growth chart from `LinkDailyStats`.
  The "open reports" and "rate-limited IPs" KPIs light up once `Report` lands in Phase 7.
- [ ] `POST /admin/users/:id/role` role assignment (super_admin only).
- [ ] 2FA scaffolding for admin sign-in (FC002.x — may defer enforcement).

**Depends on:** Phases 1, 3. **Complexity:** MEDIUM–HIGH.

## Phase 7 — CMS link / reports / blocklist (FC003, FC004, FC005)

- [ ] `GET /admin/links` — search/filter + metadata + clicks.
- [ ] `POST /admin/links/:id/disable` (+ enable, force-expire) with `disabled_reason`/`disabled_by`.
- [ ] Public report flow + `POST /admin/reports/:id/resolve` (action + note).
- [ ] `POST /admin/blocklist` domain CRUD; **enforce blocklist at create time** (Phase 2 hook).
- [ ] Disabled-link behavior on redirect.

**Depends on:** Phase 6. **Complexity:** MEDIUM–HIGH.

## Phase 8 — User management & audit log (FC006, FC007)

- [ ] User list, suspend/reactivate, view a user's links.
- [ ] `AuditLog` write helper; record **every** admin mutation (actor, action, target, metadata JSONB).
- [ ] Read-only audit log viewer.

**Depends on:** Phases 6–7. **Complexity:** MEDIUM.

## Phase 9 — Hardening & deploy

- [ ] Security headers + CSP (per web/security rules); CSRF on state-changing forms.
- [ ] Coverage ≥ 80% (unit + integration + E2E critical flows: create→redirect, sign-in→claim, admin disable).
- [ ] Lighthouse / CWV pass on public pages.
- [ ] Production env config; deploy target (Vercel + managed Postgres/Redis or container).
- [ ] `security-reviewer` + `code-reviewer` pass.

**Depends on:** all. **Complexity:** MEDIUM.

---

## Dependency graph

```
P0 → P1 → P2 ──┬─→ P3 → P4
               ├─→ P5
               └─→ P6 → P7 → P8
                              ↘ P9 (gates release)
```

**MVP cut line:** P0–P2 (shorten + redirect). **Public product:** + P3–P5. **Full system:** + P6–P9.

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| `base62(id)` exposes sequential IDs / enumeration | MEDIUM | Acceptable for MVP; consider salted/hashids if guessability matters |
| Concurrent `click_count` increments | MEDIUM | Atomic DB increment, not read-modify-write |
| Anon-claim cookie forgery | MEDIUM | Signed cookie; validate before claim UPDATE |
| Rate-limit fail-open if Redis down | MEDIUM | Decide fail-open vs fail-closed; alert on Redis loss |
| Open-redirect / SSRF via stored URL | MEDIUM | http/https only, reject self-referential, enforce blocklist |
| RBAC bypass on `/admin` | HIGH | Server-side guard on every route + handler, never client-only |
| Missing audit entries | MEDIUM | Centralized mutation helper that always logs |

## Decisions

Resolved:

- **Code strategy:** store the `code` (`UPDATE code = base62(id)` post-insert) for indexed lookups.
- **Redirect status:** `302` for active (uncached → click counting works); `410` expired;
  `404` for missing/disabled/blocklisted (a takedown shouldn't confirm the code existed).

Still open:

- Monorepo now (for later RN/Expo app) vs single Next.js app. Recommend single app now, extract later (YAGNI).
- Deploy target.

## Test strategy (per testing rules)

- **Unit:** base62, URL validation, rate-limit window, RBAC presets.
- **Integration:** API route handlers against test DB.
- **E2E (Playwright):** create→copy→redirect, expired→410, sign-in→claim, admin disable→audit.
- TDD: write failing test first per feature; target ≥ 80% coverage.
