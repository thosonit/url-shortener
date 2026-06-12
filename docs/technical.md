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
  - clear `expires_at` (unconditionally — a custom anonymous expiry is discarded on claim, by design)
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

## Owner link management

Authenticated users manage their own links (FA-MANAGE), mirroring the admin actions in
[`features/FC-LINKS`](features/FC-LINKS-link-management.md) but scoped to ownership.

- **Ownership gate.** Every action filters on `links.user_id = :sessionUserId`. A row that does
  not match — another user's link, or a still-anonymous one — is treated as not found and returns
  `404`, never `403`, so the endpoint never confirms a link the caller doesn't own exists.
- **Edit destination (FA-MANAGE.1).** Re-run the FA-SHORTEN validation (`http`/`https` only,
  non-self-referential) on the new URL, then `UPDATE original_url`. The `code` is immutable, so
  existing short URLs keep resolving to the new destination.
- **Disable / enable (FA-MANAGE.2).** Flip `status` between `active` and `disabled`. This is the
  same status-only mechanism as the admin path, so a disabled link returns `404` at redirect —
  user-disable and admin-disable are indistinguishable to the public, and no separate state is added.
- **Delete (FA-MANAGE.3).** Hard `DELETE` the row. The redirect then returns `404`, and because
  `code = base62(id)` over a monotonic identity, the freed code is never reissued. `click_count`
  is discarded with the row (no soft-delete/audit copy — see [`database.md`](database.md)).

## User suspension

- Suspending a user (`users.status = 'suspended'`) rejects their session: they cannot create
  new links or claim anonymous ones.
- Suspension does **not** take down their existing links. Redirect resolution checks only the
  link's own `status` + expiry, not the owner — so prior links keep resolving. To pull them
  offline, an admin disables the links individually (see [`features/FC-LINKS`](features/FC-LINKS-link-management.md)).

## CMS permissions

- Enforce permissions server-side for all `/admin` endpoints.
- Use role presets rather than scattered role checks. The canonical role × permission matrix
  lives in [`features/FC-RBAC`](features/FC-RBAC-admin-rbac.md).
