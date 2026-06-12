# Technical Details

## Short link creation flow

1. Validate the submitted URL.
2. Reject URLs that do not use `http` or `https`.
3. Reject self-referential links that point back to the service domain.
4. Insert a new `links` record.
5. Generate `code` from `base62(id)`.
6. Store the `code` (the decided approach — see [Code generation options](#code-generation-options)).

## Code generation options

### Stored code
- Insert link row first.
- Compute `code = base62(id)` after insert.
- Update the row with the new code.

### Computed code on read
- Store only `id`.
- Convert `id` to `base62` when generating short URLs or resolving redirects.
- Simpler storage, but may require extra read-time conversion.

**Decision: store the `code`.** A stored, uniquely-indexed `code` gives the redirect hot path a
single indexed lookup and lets the DB enforce uniqueness. Insert the row, then
`UPDATE code = base62(id)` in the same transaction (see [`database.md`](database.md)).

## Authentication & identity

- Sign-in uses Auth.js with the Google provider.
- Provider identity is stored in the `accounts` table, not on `users` — one row per linked
  OAuth identity, keyed by `(provider, provider_account_id)`. This keeps a second provider an
  additive change later.
- Upsert on callback: find `accounts(provider='google', provider_account_id=:sub)` → its
  `users` row; if absent, create both (user + account) and link them.
- `users` holds app concerns only: `email` (identity), `role`, `status`. No name/image
  profile mirror — sign-in only, never displayed.
- Admin sessions use a shorter session TTL than regular users.

## Anonymous session / link claim

- Issue an `anon_session_id` in a signed cookie for anonymous visitors.
- Store `anon_session_id` on anonymous `links`.
- When the visitor signs in with Google:
  - assign `user_id`
  - clear `expires_at`
  - keep `anon_session_id` for history if needed

Example claim update:
```sql
UPDATE links
SET user_id = :userId, expires_at = NULL
WHERE anon_session_id = :anonId AND user_id IS NULL;
```

## Redirect resolution

A code resolves to one of four outcomes:

- **Active** → `302` redirect to `original_url`. `302` (not `301`) is required so the redirect is
  not cached and every click reaches the server for counting.
- **Expired** (`expires_at < now`) → `410 Gone` with a friendly "Link expired" message.
- **Disabled** (`status='disabled'`) → `404 Not Found`. A takedown should not confirm the code
  existed, so it is indistinguishable from a never-created code.
- **Unknown** → `404 Not Found`.

## Expiry handling

- Anonymous links expire after 30 days.
- Expired redirects return `410 Gone` and show a friendly message.
- Authenticated links are permanent by default.

## Click tracking

- Increment `click_count` atomically (DB-side `+1`, never read-modify-write) on a successful redirect.
- The single `click_count` counter is the MVP for per-link totals. Time-bucketed analytics
  (daily trends, growth charts) and per-click rows (geo/referrer/device) are out of scope.

## Rate limiting

- Apply limits to `POST /api/links` for anonymous users.
- Use an IP-based sliding window or token bucket.
- Block excessive creation attempts before insert.

## CMS permissions

- Enforce permissions server-side for all `/admin` endpoints.
- Use role presets rather than scattered role checks.
