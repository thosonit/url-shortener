# Technical Details

## Short link creation flow

1. Validate the submitted URL.
2. Reject URLs that do not use `http` or `https`.
3. Reject self-referential links that point back to the service domain.
4. Insert a new `links` record.
5. Generate `code` from `base62(id)`.
6. Store the `code` or compute it at read time.

## Code generation options

### Stored code
- Insert link row first.
- Compute `code = base62(id)` after insert.
- Update the row with the new code.

### Computed code on read
- Store only `id`.
- Convert `id` to `base62` when generating short URLs or resolving redirects.
- Simpler storage, but may require extra read-time conversion.

## Authentication & identity

- Sign-in uses Auth.js with the Google provider.
- Provider identity is stored in the `accounts` table, not on `users` — one row per linked
  OAuth identity, keyed by `(provider, provider_account_id)`. This keeps a second provider an
  additive change later.
- Upsert on callback: find `accounts(provider='google', provider_account_id=:sub)` → its
  `users` row; if absent, create both (user + account) and link them.
- `users` holds app concerns only: `role`, `status`, 2FA fields, profile mirror (`email`,
  `display_name`, `image_url`).
- Admin sessions require a passed 2FA challenge and use a shorter session TTL than regular users.

## Anonymous session / link claim

- Issue an `anon_session_id` in a signed cookie for anonymous visitors.
- Store `anon_session_id` on anonymous `links`.
- When the visitor signs in with Google:
  - assign `user_id`
  - clear `expires_at`
  - keep `anon_session_id` for audit/history if needed

Example claim update:
```sql
UPDATE links
SET user_id = :userId, expires_at = NULL
WHERE anon_session_id = :anonId AND user_id IS NULL;
```

## Expiry handling

- Anonymous links expire after 30 days.
- Expired redirects return `410 Gone` and show a friendly message.
- Authenticated links are permanent by default.

## Click tracking

- Increment `click_count` on successful redirect.
- Track clicks in a single counter for MVP.
- Future enhancements may add per-click details for analytics.

## Rate limiting

- Apply limits to `POST /api/links` for anonymous users.
- Use an IP-based sliding window or token bucket.
- Block excessive creation attempts before insert.

## CMS permissions

- Enforce permissions server-side for all `/admin` endpoints.
- Use role presets rather than scattered role checks.
- Require audit logging for every mutating admin action.
