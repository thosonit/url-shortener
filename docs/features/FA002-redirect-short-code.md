# FA002 — Redirect short code

## Purpose
Resolve a short code and send the visitor to the original destination.

## Summary
- Accept a short code from the path.
- Look up the matching link record.
- Branch on state: active → redirect, expired → 410, missing → 404.
- Count the click on a successful redirect only.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA002.1 | Click count | Increment `click_count` only on a successful redirect. |
| FA002.2 | Expired page | Expired link → `410 Gone` with a friendly "Link expired" page. |
| FA002.3 | Not-found | Unknown code → `404 Not Found`. |

## Acceptance criteria
- Active codes redirect to the correct destination.
- `click_count` increments only on successful redirects (FA002.1).
- Expired codes return a friendly 410 page (FA002.2).
- Unknown codes return 404 (FA002.3).

## Related API
- `GET /:code` → **302** redirect if active / **410** if expired / **404** if not found or disabled

## Notes
- Active redirects use **`302`** (not `301`): a cached permanent redirect would bypass the server and break click counting (FA002.1).
- Disabled ([[FC003]]) links return **`404`** — a takedown should not confirm the code existed.

## Related
- Expiry is determined by [[FA005]]. Disabled links short-circuit to `404` here (see [[FC003]]).
