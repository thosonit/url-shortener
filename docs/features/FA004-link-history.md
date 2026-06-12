# FA004 — Link history

## Purpose
Give authenticated users a view of the links they own.

## Summary
- List the signed-in user's links with key metadata and status.
- Read-only history surface; lifecycle actions live elsewhere.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA004.1 | List own links | Show `code`, `original_url`, `click_count`, `created_at`, and status (active/expired). Auth required. |

## Acceptance criteria
- Authenticated users see only their own links (FA004.1).
- Each row shows current status, including expired vs active per [[FA005]].
- Anonymous users have no history (links auto-expire instead).

## Related API
- `GET /api/me/links` → history *(auth required)*

## Related
- Ownership is established by [[FA003]]; status reflects [[FA005]].
