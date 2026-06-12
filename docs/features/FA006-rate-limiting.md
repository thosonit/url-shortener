# FA006 — Rate limiting

## Purpose
Curb anonymous link-creation spam with a minimal per-IP throttle.

## Summary
- Cap the number of link-creation requests per IP per minute.
- Reject over-limit requests with a clear, retryable error.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA006.1 | Per-IP creation cap | Limit `POST /api/links` per IP per minute; over-limit → `429 Too Many Requests`. |

## Acceptance criteria
- A spammy IP is throttled on link creation (FA006.1).
- Throttled requests return a clear error and do not create records.
- Normal usage is unaffected by the cap.

## Related API
- Applies to `POST /api/links` (see [[FA001]]).

## Notes
- Throttling lives entirely in Redis; over-limit requests are rejected with `429` and nothing is persisted.
