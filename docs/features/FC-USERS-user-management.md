# FC-USERS — User management

## Purpose
Let admins oversee user accounts and curb abusive owners.

## Summary
- List users and inspect the links they own.
- Suspend or reinstate accounts.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC-USERS.1 | User list | Browse/search `users` by email. |
| FC-USERS.2 | Suspend / unsuspend | Flip `users.status` (`active \| suspended`). |
| FC-USERS.3 | View user links | Inspect the links owned by a given user. |

## What suspend does (and does not) do
- **Does:** reject the user's session — a suspended user cannot create new links or claim
  anonymous ones. Their privileged (signed-in) actions are blocked until reinstated.
- **Does not:** take down their existing links. Redirect resolution checks only the link's own
  `status` + expiry, not the owner — so already-created links keep resolving. To pull a
  suspended user's links offline, an admin disables them individually via [[FC-LINKS]].

> `linkCount` is shown on **user detail** ([[FC-USERS]].3 view), not on the user list, to avoid a
> per-row `COUNT` across the whole list.

## Acceptance criteria
- Admins can browse/search users by email (FC-USERS.1).
- Suspending an account blocks new link creation and other signed-in actions; unsuspend restores
  them (FC-USERS.2). Existing links are unaffected — disable them separately via [[FC-LINKS]] if needed.
- Admins can view a user's links (FC-USERS.3).

## Related
- Role assignment is a separate concern handled in [[FC-RBAC]]. Links shown here come from [[FA-SHORTEN]].
