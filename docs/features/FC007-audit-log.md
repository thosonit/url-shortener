# FC007 — Audit log

## Purpose
Record every admin and system change for accountability.

## Summary
- Log each mutating action as an immutable event.
- Provide a read-only view in the CMS.

## Sub-features
| ID | Sub-feature | Detail |
|----|-------------|--------|
| FC007.1 | Record mutating actions | Write `audit_logs(actor_id, action, target_type, target_id, metadata jsonb, created_at)` for every mutating action. |
| FC007.2 | Read-only view | Immutable audit view — no edit, no delete. |

## Acceptance criteria
- Every mutating admin/system action generates an audit event (FC007.1).
- Audit records cannot be edited or deleted (FC007.2).
- Logs are reviewable in the CMS.

## Related
- Captures actions from [[FC002]], [[FC003]], [[FC004]], [[FC005]], [[FC006]].
