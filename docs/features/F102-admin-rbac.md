# F102 — Role-based permissions and admin RBAC

## Purpose
Enforce admin permissions consistently across the CMS.

## Summary
- Define roles as permission presets.
- Use server-side enforcement for admin routes.
- Allow role assignment by super-admins.
- Keep UI controls only as a convenience layer.

## Acceptance criteria
- Admin routes require the correct permissions.
- Role assignments update permissions for users.
- UI does not grant access that the server denies.
