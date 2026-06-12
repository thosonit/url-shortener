# FC006 — User management

## Purpose
Let admins oversee user accounts and curb abusive owners.

## Summary
- List users and inspect the links they own.
- Suspend or reinstate accounts.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC006.1 | User list | Browse/search `users`. |
| FC006.2 | Suspend / unsuspend | Flip `users.status` (`active \| suspended`). |
| FC006.3 | View user links | Inspect the links owned by a given user. |

## Acceptance criteria
- Admins can browse users (FC006.1).
- Suspending an account blocks its privileged actions; unsuspend restores them (FC006.2).
- Admins can view a user's links (FC006.3).

## Related
- Role assignment is a separate concern handled in [[FC002]]. Links shown here come from [[FA001]].
