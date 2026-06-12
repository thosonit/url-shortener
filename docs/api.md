# API Reference

REST surface for the URL shortener, derived from [`features.md`](features.md) and the data
contract in [`database.md`](database.md). Two surfaces:

- **App / Public** (`/api/*`, `/:code`) — anonymous or user session.
- **CMS / Admin** (`/admin/*`) — admin+ permission, enforced server-side (FC002).

## Conventions

**Base & format.** JSON over HTTPS; request and response bodies are `application/json`.
The redirect endpoint `GET /:code` is the only non-JSON route (it returns HTTP redirects/pages).

**Response envelope.** Every JSON endpoint returns a consistent envelope:

```json
{ "success": true,  "data": { }, "error": null, "meta": { } }
{ "success": false, "data": null, "error": { "code": "STRING_CODE", "message": "Human readable" } }
```

`meta` is present on list endpoints for pagination: `{ "page": 1, "limit": 20, "total": 137 }`.

**Pagination.** List endpoints accept `?page` (1-based) and `?limit` (default 20, max 100).

**Auth.**
- _Anonymous_ — a signed `anon_session_id` cookie is issued on first visit; it ties anonymous
  links to the browser for later claim (FA003.2).
- _User session_ — Auth.js session cookie. Required by `/api/me/*`.
- _Admin_ — `role ∈ {admin, super_admin}` plus a passed 2FA challenge and a shorter session TTL
  (FC002.3). Required by all `/admin/*`. Checks are by **permission**, not role string (FC002.1).

**Rate limiting.** `POST /api/links` is throttled per IP (FA006). Responses carry
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`; over-limit → `429` with `Retry-After`.

**Errors.** Common `error.code` values: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `GONE` (410), `RATE_LIMITED` (429), `INTERNAL` (500).
Every mutating `/admin/*` call writes an `audit_logs` entry (FC007).

---

## Endpoint index

### App / Public

| Method | Path | Auth | Feature | Purpose |
|--------|------|------|---------|---------|
| `POST` | `/api/links` | anon / user | FA001, FA006 | Create a short link |
| `GET` | `/:code` | none | FA002, FA005, FC003, FC005 | Resolve & redirect |
| `POST` | `/api/reports` | anon / user | FC004.1 | Report a link |
| `GET` | `/api/me/links` | user | FA004 | List own link history |

### Auth & account

| Method | Path | Auth | Feature | Purpose |
|--------|------|------|---------|---------|
| `GET` | `/api/auth/signin/google` | none | FA003.1 | Begin Google OAuth |
| `GET` | `/api/auth/callback/google` | none | FA003 | OAuth callback + anon-link claim |
| `GET` | `/api/auth/session` | any | FA003 | Current session |
| `POST` | `/api/auth/signout` | user | FA003 | End session |
| `POST` | `/api/auth/2fa/verify` | user (challenge) | FC002.3 | Submit TOTP during sign-in |
| `POST` | `/api/me/2fa/setup` | user | FC002.3 | Begin TOTP enrollment |
| `POST` | `/api/me/2fa/enable` | user | FC002.3 | Confirm & enable 2FA |
| `POST` | `/api/me/2fa/disable` | user | FC002.3 | Disable 2FA |

### CMS / Admin

| Method | Path | Permission | Feature | Purpose |
|--------|------|-----------|---------|---------|
| `GET` | `/admin/stats` | `dashboard:read` | FC001.1 | KPI snapshot |
| `GET` | `/admin/stats/timeseries` | `dashboard:read` | FC001.2 | Growth series |
| `GET` | `/admin/links` | `link:read` | FC003.1 | Search / filter links |
| `GET` | `/admin/links/:id` | `link:read` | FC003.4 | Link detail + clicks |
| `POST` | `/admin/links/:id/disable` | `link:disable` | FC003.2 | Disable a link |
| `POST` | `/admin/links/:id/enable` | `link:disable` | FC003.2 | Re-enable a link |
| `POST` | `/admin/links/:id/expire` | `link:expire` | FC003.3 | Force-expire now |
| `GET` | `/admin/reports` | `report:read` | FC004.1 | Moderation queue |
| `POST` | `/admin/reports/:id/resolve` | `report:resolve` | FC004.2 | Resolve / dismiss |
| `GET` | `/admin/blocklist` | `blocklist:read` | FC005.1 | List blocked domains |
| `POST` | `/admin/blocklist` | `blocklist:manage` | FC005.1 | Add blocked domain |
| `DELETE` | `/admin/blocklist/:id` | `blocklist:manage` | FC005.1 | Remove blocked domain |
| `GET` | `/admin/users` | `user:read` | FC006.1 | List / search users |
| `GET` | `/admin/users/:id` | `user:read` | FC006 | User detail |
| `GET` | `/admin/users/:id/links` | `user:read` | FC006.3 | Links owned by user |
| `POST` | `/admin/users/:id/suspend` | `user:suspend` | FC006.2 | Suspend account |
| `POST` | `/admin/users/:id/unsuspend` | `user:suspend` | FC006.2 | Reinstate account |
| `POST` | `/admin/users/:id/role` | `role:assign` (super-admin) | FC002.2 | Assign role |
| `GET` | `/admin/audit` | `audit:read` | FC007.2 | Read audit log |

---

## App / Public — detail

### `POST /api/links`
Create a short link. Anonymous or authenticated. Rate-limited per IP (FA006).

**Request** (`expiresAt` optional):
```json
{ "url": "https://example.com/very/long/path", "expiresAt": "2026-07-01T00:00:00Z" }
```

**Response** `201`:
```json
{ "success": true, "data": {
    "code": "a1B2c",
    "shortUrl": "https://short.example/a1B2c",
    "originalUrl": "https://example.com/very/long/path",
    "expiresAt": "2026-07-12T12:00:00Z"
}, "error": null }
```

**Rules**
- Accepts `http`/`https` only; rejects malformed and self-referential URLs (FA001.1) → `400 VALIDATION_ERROR`.
- Destination domain checked against the blocklist (FC005.2) → `400 VALIDATION_ERROR`.
- `expiresAt` omitted → default TTL (FA005): anonymous = `now + 30d`, authenticated = permanent (`null`).
- `expiresAt` supplied → anonymous is clamped to ≤ 30 days; authenticated is any future date.
  Past / out-of-range → `400 VALIDATION_ERROR`.
- `code` is server-generated as `base62(links.id)` — never client-supplied (FA001.2).
- Over the per-IP cap → `429 RATE_LIMITED` (no record created).

### `GET /:code`
Resolve a short code and redirect. **Not enveloped** — returns HTTP semantics directly.

| Outcome | Status |
|---------|--------|
| Active link | `302` redirect to `original_url` |
| Expired (`expires_at < now`) | `410 Gone` — "Link expired" page (FA005.3) |
| Disabled (`status='disabled'`) or domain blocklisted | `404 Not Found` (FC003.2 / FC005.2) |
| Unknown code | `404 Not Found` (FA002.3) |

`302` (not `301`) is deliberate: a cached permanent redirect would bypass the server and break
per-click counting. Disabled/blocklisted links return `404` (not `410`) so a takedown does not
confirm the code ever existed. On a successful redirect only: increment `links.click_count` and
bump `link_daily_stats` (FA002.1).

### `POST /api/reports`
File a report against a link from the redirect/preview page (FC004.1). Anonymous or user.

**Request:**
```json
{ "code": "a1B2c", "reason": "Phishing page impersonating a bank" }
```

**Response** `201`:
```json
{ "success": true, "data": { "id": "rep_123", "status": "open" }, "error": null }
```
Creates a `reports` row with `source='user'`, `reporter_user_id` (if signed in) or `reporter_ip`.
Unknown `code` → `404 NOT_FOUND`.

### `GET /api/me/links`
Authenticated user's link history (FA004). Paginated.

**Response** `200`:
```json
{ "success": true, "data": [
    { "code": "a1B2c", "originalUrl": "https://example.com", "clickCount": 42,
      "status": "active", "expiresAt": null, "createdAt": "2026-06-01T10:00:00Z" }
], "error": null, "meta": { "page": 1, "limit": 20, "total": 7 } }
```
Returns only links owned by the caller. `status` reflects active/expired/disabled per FA005.
Unauthenticated → `401 UNAUTHENTICATED`.

---

## Auth & account — detail

### `GET /api/auth/signin/google` · `GET /api/auth/callback/google`
Auth.js Google OAuth flow (FA003.1). The callback upserts the user via
`accounts(provider='google', provider_account_id=sub)` → user (else create), establishes a
session, and **claims anonymous links** for the visitor's `anon_session_id` (FA003.2):

```sql
UPDATE links SET user_id = :userId, expires_at = NULL
WHERE anon_session_id = :anonId AND user_id IS NULL;
```
Claimed links become permanent and appear in `GET /api/me/links`.

### `GET /api/auth/session` · `POST /api/auth/signout`
Standard Auth.js session read and sign-out.

### 2FA (FC002.3)
Required for `admin`+ accounts; available to any user.

- `POST /api/me/2fa/setup` → `{ "secret": "BASE32", "otpauthUrl": "otpauth://totp/..." }`.
  Stores `two_factor_secret` (encrypted) as **pending**, not yet enabled.
- `POST /api/me/2fa/enable` `{ "token": "123456" }` → verifies, sets `two_factor_enabled=true`,
  returns one-time `backupCodes[]` (stored hashed). Bad token → `400 VALIDATION_ERROR`.
- `POST /api/me/2fa/disable` `{ "token": "123456" }` → clears 2FA.
- `POST /api/auth/2fa/verify` `{ "token": "123456" }` → completes a sign-in challenge for an
  account with 2FA enabled. Accepts a TOTP or a backup code (consumed once).

---

## CMS / Admin — detail

All `/admin/*` require admin+ permission (FC002), a passed 2FA challenge, and write an
`audit_logs` entry on every mutation (FC007). Forbidden permission → `403 FORBIDDEN`.

### Dashboard (FC001)
- `GET /admin/stats` → KPI snapshot: total links, links & clicks today, open reports,
  rate-limited IPs (count of open `auto_rate_limit` reports).
  ```json
  { "success": true, "data": {
      "totalLinks": 10423, "linksToday": 87, "clicksToday": 1290,
      "openReports": 5, "rateLimitedIps": 2 }, "error": null }
  ```
- `GET /admin/stats/timeseries?metric=links|clicks&range=30d` → daily series from
  `link_daily_stats` (FC001.2):
  ```json
  { "success": true, "data": [ { "day": "2026-06-10", "value": 120 } ], "error": null }
  ```

### Link management (FC003)
- `GET /admin/links?query=&status=&owner=&page=` → search by code/URL/owner/status (FC003.1).
  Each row includes `code`, `originalUrl`, `owner`, `status`, `clickCount`, `expiresAt`, `createdAt`.
- `GET /admin/links/:id` → full detail incl. `clickCount`, `disabledReason`, `disabledBy` (FC003.4).
- `POST /admin/links/:id/disable` `{ "reason": "Phishing" }` → sets `status='disabled'`,
  `disabled_reason`, `disabled_by`, `disabled_at` (FC003.2). Disabled links stop resolving (FA002).
- `POST /admin/links/:id/enable` → restores `status='active'`.
- `POST /admin/links/:id/expire` → sets `expires_at = now()` to retire immediately (FC003.3).

### Reports & moderation (FC004)
- `GET /admin/reports?status=open|resolved|dismissed&page=` → moderation queue, newest first.
  Rows include `id`, `link`, `source` (`user|auto_blocklist|auto_rate_limit`), `reason`, `status`, `createdAt`.
- `POST /admin/reports/:id/resolve` (FC004.2):
  ```json
  { "resolution": "link_disabled", "note": "Confirmed phishing; link disabled." }
  ```
  `resolution ∈ {link_disabled, dismissed}`. `link_disabled` also disables the target link
  (shared mechanics with FC003.2). Sets `status`, `resolution`, `resolution_note`,
  `resolved_by`, `resolved_at`.

### Blocklist (FC005)
- `GET /admin/blocklist?page=` → blocked domains with `reason`, `addedBy`, `matchSubdomains`, `createdAt`.
- `POST /admin/blocklist`:
  ```json
  { "domain": "malware.test", "reason": "Malware distribution", "matchSubdomains": true }
  ```
  Domain normalized (lowercased, `www.` stripped). Duplicate → `400 VALIDATION_ERROR`.
- `DELETE /admin/blocklist/:id` → remove a domain.

### User management (FC006)
- `GET /admin/users?query=&page=` → browse/search users (FC006.1).
- `GET /admin/users/:id` → user detail (role, status, link count, 2FA state).
- `GET /admin/users/:id/links?page=` → links owned by the user (FC006.3).
- `POST /admin/users/:id/suspend` `{ "reason": "Repeated abuse" }` → `status='suspended'`;
  blocks the account's privileged actions (FC006.2).
- `POST /admin/users/:id/unsuspend` → restores `status='active'`.
- `POST /admin/users/:id/role` `{ "role": "admin" }` → assign role. **Super-admin only**
  (`role:assign`, FC002.2); `role ∈ {user, admin, super_admin}`.

### Audit log (FC007)
- `GET /admin/audit?actor=&targetType=&targetId=&page=` → immutable, read-only event stream
  (FC007.2). Rows: `actorId`, `actorType`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`.
  No write/update/delete endpoints exist by design.
