# Technical Details

## Short link creation flow

1. Validate the submitted URL.
2. Reject URLs that do not use `http` or `https`.
3. Reject self-referential links that point back to the service domain.
4. Insert a new `links` record.
5. Generate `code` from `base62(id)`.
6. Store the `code` (the decided approach — see [Code generation options](#code-generation-options)).

## Code generation options

**Decision: store the `code`, generated via CTE in a single round-trip.**

```sql
WITH inserted AS (
  INSERT INTO links (...) VALUES (...) RETURNING id
)
UPDATE links SET code = base62(inserted.id)
FROM inserted WHERE links.id = inserted.id
RETURNING *;
```

A stored, uniquely-indexed `code` gives the redirect hot path a single indexed lookup and lets
the DB enforce uniqueness. The CTE approach collapses insert + update into one round-trip,
keeping link creation atomic with no extra latency.

**Custom aliases:** User-supplied codes skip base62. Validate format before insert:
alphanumeric only, 4–20 chars, reject reserved words (`api`, `admin`, `health`, etc.).
Insert directly with the provided code.

## Authentication & identity

- Sign-in uses Auth.js with the Google provider.
- Provider identity is stored in the `accounts` table, not on `users` — one row per linked
  OAuth identity, keyed by `(provider, provider_account_id)`. This keeps a second provider an
  additive change later.
- Upsert on callback: find `accounts(provider='google', provider_account_id=:sub)` → its
  `users` row; if absent, create both (user + account) and link them.
- `users` holds app concerns only: `email` (identity), `role`, `status`. No name/image
  profile mirror — sign-in only, never displayed.
- Session TTL: regular users **30 days** (Auth.js default), admin users **8 hours** to reduce
  attack window if a token is compromised. No per-action re-auth at MVP — compensate with short
  TTL and UI confirm dialogs for destructive actions.

## Anonymous session / link claim

- `anon_session_id` is always **server-generated** (UUID v4, cryptographically random). The client
  never generates or reads this value — a client-supplied ID could be used to claim another
  user's links.
- Issued as an `HttpOnly`, `Secure`, `SameSite=Lax` signed cookie.
- **Lazy issuance:** the cookie is set only when the user creates their first anonymous link, not
  on every visit. Visitors who never shorten a URL get no session.
- Store `anon_session_id` on anonymous `links`.
- Anonymous sessions are capped at **10 links per session** to limit abuse.
- When the visitor signs in with Google, all unclaimed links are claimed in a single transaction
  (all-or-nothing). No deduplication against existing links — duplicates are the user's to manage.
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

- **Active** → `302` redirect to `original_url`. `302` (not `301`, not `307`) is required so the
  redirect is not cached and every click reaches the server for counting. URL shorteners are
  GET-only so `302` and `307` behave identically; `302` is kept for broader tool compatibility.
- **Expired** (`expires_at < now`) → `410 Gone` with a friendly "Link expired" message.
- **Disabled** (`status='disabled'`) → `404 Not Found`. A takedown should not confirm the code
  existed, so it is indistinguishable from a never-created code.
- **Unknown** → `404 Not Found`.

## Expiry handling

- Anonymous links expire after 30 days.
- Expired redirects return `410 Gone` and show a friendly message.
- Authenticated links are permanent by default.

## Click tracking

- Increment `click_count` atomically (DB-side `+1`, never read-modify-write) on a successful
  redirect, synchronously on the hot path.
- Sync increment is correct and simple at MVP scale. Migrate to an async queue only when p99
  redirect latency exceeds 50ms.
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
- Suspension does **not** automatically take down their existing links. Redirect resolution checks
  only the link's own `status` + expiry, not the owner — so prior links keep resolving.
- For abuse/spam cases, the admin suspend flow exposes a **"Suspend + disable all links"** option
  that updates `users.status` and bulk-sets `links.status = 'disabled'` in one transaction.
  Standard suspension (policy/billing) leaves links live. No separate endpoint — this is a flag
  on the suspend action.

## CMS permissions

- Enforce permissions server-side for all `/admin` endpoints.
- Use role presets rather than scattered role checks. The canonical role × permission matrix
  lives in [`features/FC-RBAC`](features/FC-RBAC-admin-rbac.md).
