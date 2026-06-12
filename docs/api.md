# API Reference

## Public endpoints

### `POST /api/links`
Create a new short link.

Request body (`expiresAt` optional):
```json
{ "url": "https://example.com", "expiresAt": "2026-07-01T00:00:00Z" }
```
When `expiresAt` is omitted, the default TTL applies. Anonymous requests are capped at ≤ 30 days; authenticated requests may set any future date or omit it for a permanent link.

Response:
```json
{ "code": "a1B2c", "shortUrl": "https://short.example/a1B2c", "expiresAt": "2026-07-12T12:00:00Z" }
```

Notes:
- Rate-limited for anonymous creation
- Validates http/https scheme only
- Rejects self-referential URLs to the service domain

### `GET /:code`
Redirect or expired response.

Behavior:
- `301` redirect to the original URL when active
- `410 Gone` with a "Link expired" page when expired
- `404 Not Found` if the code does not exist
- Increments `click_count` on successful redirect

### `GET /api/me/links`
Returns authenticated user link history.

Requires auth. Response includes:
- original URL
- short code
- click count
- expiration status
- created date

### `POST /api/auth/google`
Starts Google sign-in and callback handling.

Behavior:
- establishes user session
- triggers anonymous link claim for `anon_session_id`
- associates links with the authenticated user

## CMS / admin endpoints

These are part of the admin surface and should require strict server-side permission checks.

### `GET /admin/links`
List links with filtering and metadata.

### `POST /admin/links/:id/disable`
Disable a link.

### `POST /admin/reports/:id/resolve`
Resolve a report with an action and note.

### `POST /admin/blocklist`
Add a blocked domain.

### `POST /admin/users/:id/role`
Assign or change user role.
