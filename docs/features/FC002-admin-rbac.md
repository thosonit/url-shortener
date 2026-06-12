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

## Role × permission matrix
Permissions are the unit of authorization; roles are presets that grant them. The CMS checks
permissions, never role strings.

| Permission | `user` | `admin` | `super_admin` |
|------------|:------:|:-------:|:-------------:|
| `dashboard:read` | – | ✅ | ✅ |
| `link:read`      | – | ✅ | ✅ |
| `link:disable`   | – | ✅ | ✅ |
| `link:expire`    | – | ✅ | ✅ |
| `user:read`      | – | ✅ | ✅ |
| `user:suspend`   | – | ✅ | ✅ |
| `role:assign`    | – | –  | ✅ |

`admin` = everything except assigning roles; `super_admin` = full set; `user` holds no CMS
permission. Adding a future role means defining a new column here — no handler changes.

## Bootstrap & guards
- The **first** `super_admin` is created out-of-band (DB seed / migration), since `role:assign`
  itself requires an existing super-admin.
- `role:assign` must reject **self-demotion** and removal of the **last** remaining `super_admin`,
  so the system can never be left with no one able to assign roles.

## Acceptance criteria
- `/admin` routes require the correct permission, enforced server-side (FC002.1).
- Role assignment updates effective permissions; only super-admins can assign (FC002.2).
- Admin accounts use shorter session timeouts (FC002.3).
- Adding a future role = define a new preset (a new matrix column), no logic changes.
- A super-admin cannot demote themselves or remove the last super-admin.

## Related
- Gates every other CMS feature.
