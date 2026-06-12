# F107 — User suspension and role assignment

## Purpose
Allow admins to suspend abusive users and manage roles.

## Summary
- Suspend or unsuspend user accounts.
- Assign `admin` and `super_admin` roles.
- Prevent suspended users from accessing protected routes.

## Acceptance criteria
- Suspended users lose access to protected resources.
- Role changes are reflected immediately.
- Only super-admins can assign high privilege roles.
