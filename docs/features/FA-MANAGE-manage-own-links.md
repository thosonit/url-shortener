# FA-MANAGE — Manage own links

## Purpose
Let an authenticated user act on the links they own: edit the destination, disable/enable,
or delete. This is the owner-side counterpart to the admin actions in [[FC-LINKS]].

## Summary
- Edit the destination URL of an owned link (code stays the same).
- Disable / re-enable an owned link.
- Delete an owned link (hard delete).
- Acts only on links the caller owns; the history surface ([[FA-HISTORY]]) is where they appear.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA-MANAGE.1 | Edit destination URL | Update `links.original_url`. Same validation as [[FA-SHORTEN]] (FA-SHORTEN.1): `http`/`https` only, non-self-referential. The `code` is unchanged — existing short URLs keep working. |
| FA-MANAGE.2 | Disable / enable | Flip the owned link's `status` (`active \| disabled`). Disabled → redirect returns `404` (same status-only mechanism as FC-LINKS.2). |
| FA-MANAGE.3 | Delete | Hard-delete the `links` row. The redirect then returns `404`; the `code` is never reused (it is `base62(id)` and `id` is a monotonic identity). `click_count` is discarded with the row. |

## Ownership & scope
- Auth required. A user may act **only** on links where `links.user_id` matches their session.
- Links not owned by the caller (another user's, or still-anonymous) return `404` — the same as a
  non-existent id, so existence is never disclosed.
- Anonymous links cannot be managed this way; they auto-expire ([[FA-EXPIRY]]). Once claimed at
  sign-in ([[FA-SIGNIN]]) they become owned and manageable.

## Acceptance criteria
- Editing the destination updates `original_url` and keeps the same `code`; invalid URLs are
  rejected with `VALIDATION_ERROR` (FA-MANAGE.1).
- Disabling an owned link makes the redirect return `404`; re-enabling restores `302` (FA-MANAGE.2).
- Deleting an owned link removes it permanently; the redirect returns `404` and the code is not
  reissued (FA-MANAGE.3).
- Acting on a link the caller does not own returns `404`, not `403` (no existence leak).

## Related API
- `PATCH /api/me/links/:id` → edit destination and/or disable/enable *(auth, owner only)*
- `DELETE /api/me/links/:id` → delete *(auth, owner only)*

## Related
- Owner-side mirror of [[FC-LINKS]]; reflected in redirect ([[FA-REDIRECT]]).
- Links surfaced by [[FA-HISTORY]]; ownership from [[FA-SIGNIN]]; TTL from [[FA-EXPIRY]].
