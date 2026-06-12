# FA-HISTORY — Link history

## Purpose
Give authenticated users a view of the links they own.

## Summary
- List the signed-in user's links with key metadata and status.
- Read-only listing surface; owners act on a link via [[FA-MANAGE]] (edit / disable / delete).

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FA-HISTORY.1 | List own links | Show `code`, `original_url`, `click_count`, `created_at`, and resolved status (**active / expired / disabled**). Auth required. |

## Acceptance criteria
- Authenticated users see only their own links (FA-HISTORY.1).
- Each row shows resolved status: `active`, `expired` (per [[FA-EXPIRY]]), or `disabled` (set by the owner via [[FA-MANAGE]] or an admin via [[FC-LINKS]]). The owner sees the true state even though the public redirect returns `404` for disabled links.
- Anonymous users have no history (links auto-expire instead).

## Related API
- `GET /api/me/links` → history *(auth required)*

## Related
- Ownership is established by [[FA-SIGNIN]]; status reflects [[FA-EXPIRY]]; owner actions in [[FA-MANAGE]].
