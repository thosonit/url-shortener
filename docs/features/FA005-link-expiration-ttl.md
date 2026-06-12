# FA005 — Link expiration / TTL

## Purpose
Define and enforce link lifetime: anonymous links expire, user-owned links persist.

## Summary
- Set `expires_at` at creation based on ownership.
- Enforce expiry at redirect time and reflect it in any list view.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA005.1 | Anonymous TTL | Anonymous link → default `expires_at = created_at + 30 days`. |
| FA005.2 | User-owned permanent | User-owned link → default `expires_at = NULL` (permanent). |
| FA005.3 | Enforcement | Expiry checked during redirect ([[FA002]]) and shown as status in history ([[FA004]]). |
| FA005.4 | Custom expiration date | User picks a custom `expires_at` at creation. **Anonymous: capped at ≤ 30 days** from now (cannot exceed the default). **Authenticated: free choice, or permanent (no expiry).** |

## Acceptance criteria
- Anonymous links default to expiring 30 days after creation (FA005.1).
- User-owned links default to permanent unless explicitly disabled later (FA005.2).
- Expired links return `410 Gone` at redirect and read as "expired" in lists (FA005.3).
- A user may set a custom expiry; anonymous choices are clamped to ≤ 30 days, authenticated choices are unbounded or permanent (FA005.4).
- A custom date in the past or beyond the allowed cap is rejected with a clear error (FA005.4).

## Related
- Claim in [[FA003]] flips an anonymous link's TTL to permanent — `expires_at` is cleared
  unconditionally, so a custom anonymous expiry is discarded on claim (by design). Admins can
  force-expire via [[FC003]].
