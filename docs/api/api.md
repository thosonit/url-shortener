# API Reference

REST surface for the URL shortener, derived from [`features.md`](../features.md) and the data
contract in [`database.md`](../database.md). Two surfaces:

- **App / Public** (`/api/*`, `/:code`) — anonymous or user session.
- **CMS / Admin** (`/admin/*`) — admin+ permission, enforced server-side (FC002).

> **Per-endpoint contract → Swagger.** This page is the index: conventions, auth, and the
> endpoint list. Full request/response schemas, status codes, and examples live in the
> OpenAPI 3.1 spec [`openapi.yaml`](openapi.yaml) — load it into Swagger UI / Redoc, or
> render with `npx @redocly/cli preview-docs docs/api/openapi.yaml`.

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
- _Admin_ — `role ∈ {admin, super_admin}` plus a shorter session TTL (FC002.3). Required by all
  `/admin/*`. Checks are by **permission**, not role string (FC002.1).

**Rate limiting.** `POST /api/links` is throttled per IP (FA006). Responses carry
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`; over-limit → `429` with `Retry-After`.

**Errors.** Common `error.code` values: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401),
`FORBIDDEN` (403), `NOT_FOUND` (404), `GONE` (410), `RATE_LIMITED` (429), `INTERNAL` (500).

---

## Endpoint index

### App / Public

| Method | Path | Auth | Feature | Purpose |
|--------|------|------|---------|---------|
| `POST` | `/api/links` | anon / user | FA001, FA006 | Create a short link |
| `GET` | `/:code` | none | FA002, FA005, FC003 | Resolve & redirect |
| `GET` | `/api/me/links` | user | FA004 | List own link history |

### Auth & account

| Method | Path | Auth | Feature | Purpose |
|--------|------|------|---------|---------|
| `GET` | `/api/auth/signin/google` | none | FA003.1 | Begin Google OAuth |
| `GET` | `/api/auth/callback/google` | none | FA003 | OAuth callback + anon-link claim |
| `GET` | `/api/auth/session` | any | FA003 | Current session |
| `POST` | `/api/auth/signout` | user | FA003 | End session |

### CMS / Admin

| Method | Path | Permission | Feature | Purpose |
|--------|------|-----------|---------|---------|
| `GET` | `/admin/stats` | `dashboard:read` | FC001.1 | KPI snapshot |
| `GET` | `/admin/links` | `link:read` | FC003.1 | Search / filter links |
| `GET` | `/admin/links/:id` | `link:read` | FC003.4 | Link detail + clicks |
| `POST` | `/admin/links/:id/disable` | `link:disable` | FC003.2 | Disable a link |
| `POST` | `/admin/links/:id/enable` | `link:disable` | FC003.2 | Re-enable a link |
| `POST` | `/admin/links/:id/expire` | `link:expire` | FC003.3 | Force-expire now |
| `GET` | `/admin/users` | `user:read` | FC006.1 | List / search users |
| `GET` | `/admin/users/:id` | `user:read` | FC006 | User detail |
| `GET` | `/admin/users/:id/links` | `user:read` | FC006.3 | Links owned by user |
| `POST` | `/admin/users/:id/suspend` | `user:suspend` | FC006.2 | Suspend account |
| `POST` | `/admin/users/:id/unsuspend` | `user:suspend` | FC006.2 | Reinstate account |
| `POST` | `/admin/users/:id/role` | `role:assign` (super-admin) | FC002.2 | Assign role |

---

Request/response schemas, status codes, and examples for every endpoint above are defined in
[`openapi.yaml`](openapi.yaml).
