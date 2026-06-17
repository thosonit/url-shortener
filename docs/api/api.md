# API Reference

Two surfaces:
- **App** (`/api/*`, `/:code`) — anonymous or authenticated user.
- **Admin** (`/api/admin/*`) — `admin` or `super_admin` role.

---

## Conventions

**Format.** JSON over HTTPS (`application/json`). `GET /:code` is the only non-JSON route.

**Response envelope.**
```json
{ "success": true,  "data": {},   "error": null }
{ "success": false, "data": null, "error": { "code": "STRING_CODE", "message": "..." } }
```
List endpoints include `"meta": { "page": 1, "limit": 20, "total": 137 }`.

**Pagination.** `?page` (1-based), `?limit` (default 20, max 100).

**Auth.**
- _Anonymous_ — server issues a JWT on first request; ties anonymous links to the client.
- _User_ — JWT with `role: user`. Required by `/api/links/*`.
- _Admin_ — JWT with `role: admin | super_admin`. Required by `/api/admin/*`.
- _Super admin_ — email + password login at `POST /api/auth/login`.

**Error codes.** `VALIDATION_ERROR` 400 · `UNAUTHENTICATED` 401 · `FORBIDDEN` 403 · `NOT_FOUND` 404 · `GONE` 410 · `INTERNAL` 500.

---

## Endpoints

### Public

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/:code` | — | Resolve & redirect |

### Auth

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/login` | — | Email + password login (admin/super_admin) |
| `GET` | `/api/auth/google` | — | Begin Google OAuth |
| `GET` | `/api/auth/google/callback` | — | OAuth callback + anon-link claim |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `POST` | `/api/auth/logout` | user | Invalidate refresh token |

### Links (user)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/links` | anon / user | Create a short link |
| `GET` | `/api/links` | user | List own links |
| `PATCH` | `/api/links/:id` | user (owner) | Edit destination or status |
| `DELETE` | `/api/links/:id` | user (owner) | Delete own link |

### Admin

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/admin/stats` | admin | KPI snapshot |
| `GET` | `/api/admin/links` | admin | Search / filter all links |
| `GET` | `/api/admin/links/:id` | admin | Link detail |
| `PATCH` | `/api/admin/links/:id` | admin | Disable / enable / force-expire |
| `GET` | `/api/admin/users` | admin | List / search users |
| `GET` | `/api/admin/users/:id` | admin | User detail |
| `GET` | `/api/admin/users/:id/links` | admin | Links owned by user |
| `PATCH` | `/api/admin/users/:id` | admin | Suspend / unsuspend |
| `PATCH` | `/api/admin/users/:id/role` | super_admin | Assign role |
