# Implementation Plan — URL Shortener

> From docs-only scaffold → working application.
> Stack (per [README](../../README.md#tech-stack)): **Next.js (App Router, TS) · Prisma · PostgreSQL · Auth.js**.
> Feature IDs reference [`docs/features.md`](../features.md). Endpoints reference [`docs/api/`](../api/api.md) (index + [`openapi.yaml`](../api/openapi.yaml)). Schema references [`docs/database.md`](../database.md).

## Requirements restatement

Build a URL shortener with three surfaces:

1. **App / Web** — public UI to create short links (QR + copy), follow redirects, sign in with Google, view history, set expiry. (`FA-SHORTEN`–`FA-EXPIRY`)
2. **REST API** — programmatic link create / redirect / history / auth. (`docs/api/`)
3. **CMS** — RBAC-governed admin dashboard for links and users. (`FC-DASH`–`FC-LINKS`, `FC-USERS`)

The two operations everything builds on: **shorten** (long URL → `base62(id)` code) and **redirect** (code → original URL, 302 active / 410 expired / 404 missing-disabled).

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
│   ├── auth/                 # Auth.js config + session helpers
│   ├── rbac/                 # role presets + permission guard
│   └── validation/           # zod schemas (URL, body parsing)
├── components/               # feature-organized UI (per web/coding-style)
└── prisma/                   # schema.prisma + migrations + seed
```

Repository pattern for data access; consistent API response envelope (`{ success, data, error, meta }`, per [`api.md`](../api/api.md)); server-side permission checks on every `/admin` route.

---

## Phase 0 — Scaffold & tooling

**Goal:** runnable empty app + quality gates.

- [ ] `create-next-app` (App Router, TypeScript, ESLint).
- [ ] Add Prettier, stylelint, strict `tsconfig`.
- [ ] `docker-compose.yml` for local PostgreSQL.
- [ ] `.env.example` (DATABASE_URL, AUTH_SECRET, GOOGLE_ID/SECRET, SHORT_DOMAIN). Never commit real `.env`.
- [ ] Vitest + Playwright config; CI workflow (lint, typecheck, test, build).
- [ ] **Update CLAUDE.md** "State" section with the real build/test/lint commands once chosen.

**Depends on:** none (stack chosen — see [README](../../README.md#tech-stack)). **Complexity:** LOW.

## Phase 1 — Data layer

**Goal:** schema + migrations + repositories matching `docs/database.md`.

- [ ] `prisma/schema.prisma` models: `User`, `Account`, `Session` (Auth.js), `Link`.
- [ ] Enums: `UserRole`, `UserStatus`, `LinkStatus`.
- [ ] Indexes: `Link.code` (unique), `Link.(user_id, created_at)`, `Link.anon_session_id`,
  `Link.expires_at`; `Account.(provider, provider_account_id)` (unique).
- [ ] `Link.id` is `bigint` autoincrement (base62 source); other ids are cuid.
- [ ] Initial migration + Prisma client singleton.
- [ ] Repositories (findById, findByCode, create, update, list).
- [ ] Seed script (super_admin user, sample links).

**Depends on:** Phase 0. **Complexity:** LOW–MEDIUM.

## Phase 2 — Core: create + redirect (FA-SHORTEN, FA-REDIRECT)

**Goal:** the two operations end to end. This is the MVP spine.

- [ ] `lib/shortcode` base62 encode/decode (+ unit tests).
- [ ] `lib/validation` zod URL schema: http/https only, reject self-referential to `SHORT_DOMAIN`.
- [ ] `POST /api/links`: validate → insert → `code = base62(id)` → return `{ code, shortUrl, expiresAt }`.
- [ ] `GET /[code]`: lookup → **302** active · **410** expired · **404** missing/disabled.
  On success: atomic `click_count += 1`.
- [ ] Create-link UI: input, result with short URL, **copy** action, **QR code** (FA-SHORTEN.x).
- [ ] Expired (410) friendly page; 404 page for missing/disabled.

**Depends on:** Phase 1. **Complexity:** MEDIUM. **This phase alone is a usable product.**

## Phase 3 — Auth & history (FA-SIGNIN, FA-HISTORY)

- [ ] Auth.js with Google provider; identity via `accounts(provider, provider_account_id)` → `User` upsert.
- [ ] Override adapter `linkAccount` (strip provider token fields: `access_token`, `refresh_token`,
  `id_token`, `expires_at`, `token_type`, `scope`, `session_state`) and `createUser`/`updateUser`
  (strip `name`, `image`, `emailVerified`) — sign-in only; `accounts`/`users` don't store them.
- [ ] `GET /api/auth/signin/google` + `GET /api/auth/callback/google` (session + anon-link claim).
- [ ] `GET /api/me/links` (auth-gated): original URL, code, clicks, expiry status, created date.
- [ ] History UI page.

**Depends on:** Phases 1–2. **Complexity:** MEDIUM.

## Phase 4 — Expiration & anonymous claim (FA-EXPIRY)

- [ ] Anonymous: `expires_at = created_at + 30d`; authenticated: nullable (permanent); custom future date for authed.
- [ ] Signed `anon_session_id` cookie set for anonymous creators.
- [ ] Claim-on-sign-in: `UPDATE links SET user_id, expires_at=NULL WHERE anon_session_id=? AND user_id IS NULL`.
- [ ] Enforce 30d cap on anonymous `expiresAt` input.

**Depends on:** Phase 3. **Complexity:** MEDIUM.

## Phase 5 — CMS foundation & RBAC (FC-DASH, FC-RBAC)

- [ ] `lib/rbac`: role presets (`user | admin | super_admin`) + `requirePermission` server guard,
  per the role × permission matrix in [`features/FC-RBAC`](../features/FC-RBAC-admin-rbac.md).
- [ ] `/admin` layout gated server-side; redirect unauthorized.
- [ ] Dashboard (FC-DASH): KPI cards (total links, links today).
- [ ] `POST /admin/users/:id/role` role assignment (super_admin only); reject self-demotion and
  removal of the last super-admin (FC-RBAC).
- [ ] Shorter admin session TTL applied app-side (FC-RBAC.3).
- [ ] Seed the first `super_admin` via migration/seed (bootstrap).

**Depends on:** Phases 1, 3. **Complexity:** MEDIUM–HIGH.

## Phase 6 — CMS link management (FC-LINKS)

- [ ] `GET /admin/links` — search/filter (incl. owner email) + metadata + clicks.
- [ ] `POST /admin/links/:id/disable` (+ enable, force-expire) — status-only.
- [ ] Disabled-link behavior on redirect (`404`); force-expire returns `410`.

**Depends on:** Phase 5. **Complexity:** MEDIUM–HIGH.

## Phase 7 — User management (FC-USERS)

- [ ] User list, suspend/reactivate, view a user's links.
- [ ] Suspend rejects the user's session (no new link creation/claim); existing links untouched.

**Depends on:** Phases 5–6. **Complexity:** MEDIUM.

## Phase 8 — Hardening & deploy

- [ ] Security headers + CSP (per web/security rules); CSRF on state-changing forms.
- [ ] Coverage ≥ 80% (unit + integration + E2E critical flows: create→redirect, sign-in→claim, admin disable).
- [ ] Lighthouse / CWV pass on public pages.
- [ ] Production env config; deploy target (Vercel + managed Postgres or container).
- [ ] `security-reviewer` + `code-reviewer` pass.

**Depends on:** all. **Complexity:** MEDIUM.

---

## Dependency graph

```
P0 → P1 → P2 ──┬─→ P3 → P4
               └─→ P5 → P6 → P7
                              ↘ P8 (gates release)
```

**MVP cut line:** P0–P2 (shorten + redirect). **Public product:** + P3–P4. **Full system:** + P5–P8.

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| `base62(id)` exposes sequential IDs / enumeration | MEDIUM | Acceptable for MVP; consider salted/hashids if guessability matters |
| Concurrent `click_count` increments | MEDIUM | Atomic DB increment, not read-modify-write |
| Anon-claim cookie forgery | MEDIUM | Signed cookie; validate before claim UPDATE |
| Open-redirect / SSRF via stored URL | MEDIUM | http/https only, reject self-referential |
| RBAC bypass on `/admin` | HIGH | Server-side guard on every route + handler, never client-only |

## Decisions

Resolved:

- **Code strategy:** store the `code` (`UPDATE code = base62(id)` post-insert) for indexed lookups.
- **Redirect status:** `302` for active (uncached → click counting works); `410` expired;
  `404` for missing/disabled (a takedown shouldn't confirm the code existed).

Still open:

- Monorepo now (for later RN/Expo app) vs single Next.js app. Recommend single app now, extract later (YAGNI).
- Deploy target.

## Test strategy (per testing rules)

- **Unit:** base62, URL validation, RBAC presets.
- **Integration:** API route handlers against test DB.
- **E2E (Playwright):** create→copy→redirect, expired→410, sign-in→claim, admin disable.
- TDD: write failing test first per feature; target ≥ 80% coverage.
