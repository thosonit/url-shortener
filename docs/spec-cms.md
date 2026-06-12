# Spec — CMS & Permissions (Phase 2)

> Builds on the Web/App decisions (see [spec-web-app.md](./spec-web-app.md)).

## Foundational Decisions

- **Authorization: 3 roles**, permission-driven (a role is just a preset of permissions).
- **Custom alias: active on creation**, moderated only when reported (reactive, no pending queue).
- **CMS: custom admin panel** at `/admin`, in the same codebase.

## Authorization (RBAC)

| Role | Scope | Representative permissions |
|------|-------|----------------------------|
| **User** | Own links | `link:create/read/delete` (own) |
| **Admin** | System-wide, operations + administration | `link:disable`, `alias:review`, `report:resolve`, `user:suspend`, `blocklist:edit`, `config:edit`, `audit:read` |
| **Super-admin** | Highest | everything Admin has + `role:assign` |

- A role is a permission preset — **no** scattered `if role == ...` hard-coding.
- Enforce **server-side** by permission; hiding UI controls is only a secondary layer.
- `users.role: user | admin | super_admin` (default `user`).
- Adding a role later (e.g. Moderator) = define a new preset, no logic changes.

## Custom alias: active on creation, moderated when reported

```
User requests alias "my-brand"
   → automated checks: valid format? collision? banned word?
        ✗ → reject immediately (client sees the error)
        ✓ → ACTIVE IMMEDIATELY (no queue)
   → if later reported → enters the Admin review queue
        → Admin: keep | disable (with reason) → write audit entry
```

- **No** `pending` state for aliases → less admin workload, smooth UX.
- Moderation is **reactive**, via the report flow.
- Alias folds into `links` (`alias` UNIQUE when non-null); no `alias_status` needed.

## CMS Screens (`/admin`)

1. **Dashboard** — KPIs: total links, links/clicks today, open reports, rate-limited IPs. Link/click growth charts.
2. **Links** — search/filter (code, URL, owner, status), actions `disable/enable`, force-expire, view clicks.
3. **Reports** — report queue (public report button + auto-rules). Resolve: disable link/alias or dismiss, with a reason.
4. **Blocklist** — CRUD of banned domains; blocked at both creation and redirect time.
5. **Users** — list, suspend/unsuspend, view a user's links; **assign roles** (Super-admin only).
6. **Audit log** — read-only, covering every mutating action.

## Additional Data Model

```
users   + role(user|admin|super_admin), status(active|suspended)

links   + status(active|disabled), disabled_reason, disabled_by,
          alias UNIQUE NULLABLE        -- alias folded into links, active on creation

blocklist(id, domain, reason, added_by, created_at)

reports(id, link_id, reporter, reason, status(open|resolved),
        resolved_by, resolution_note, created_at)

audit_logs(id, actor_id, action, target_type, target_id, metadata jsonb, created_at)
```

## See also

- [Feature index](./features.md)
- [CMS screens](./screens-cms.md)
- [API reference](./api.md)
- [Database model](./database.md)
- [Technical details](./technical.md)

## CMS Security (mandatory)

- `/admin` is hard-gated by permission **server-side**.
- Every mutating action → **audit log** (immutable, no edit/delete).
- 2FA required for `admin`+; admin sessions have a shorter timeout than regular users.

## Public Hooks to Add (to feed the CMS)

- A **"Report link"** button on the redirect/preview page → creates a `reports` record.
- Auto-rules that raise reports: domain on the blocklist, an IP exceeding the link-creation threshold.
