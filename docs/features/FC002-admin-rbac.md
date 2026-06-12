# FC002 — RBAC / permissions

## Purpose
Enforce admin authorization consistently and server-side across the CMS.

## Summary
- Model roles as permission presets (User / Admin / Super-admin).
- Enforce by permission on the server; UI hiding is a secondary layer only.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC002.1 | Permission presets | `users.role: user \| admin \| super_admin` (default `user`); each role is a preset of permissions, no scattered `if role == ...`. |
| FC002.2 | Role assignment | Super-admins assign roles (`role:assign`). |
| FC002.3 | Admin session hardening | Admin sessions time out faster than regular users. |

## Acceptance criteria
- `/admin` routes require the correct permission, enforced server-side (FC002.1).
- Role assignment updates effective permissions; only super-admins can assign (FC002.2).
- Admin accounts use shorter session timeouts (FC002.3).
- Adding a future role = define a new preset, no logic changes.

## Related
- Gates every other CMS feature.
