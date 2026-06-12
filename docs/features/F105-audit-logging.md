# F105 — Audit logging for mutating actions

## Purpose
Record every admin and system change for accountability.

## Summary
- Log every mutating action as an immutable event.
- Capture actor, action, target, and metadata.
- Display logs in a read-only admin audit view.

## Acceptance criteria
- Mutating admin actions generate audit events.
- Audit records are not editable or deletable.
- Audit logs can be reviewed in the CMS.
