# Database Model

## Users

Columns:
- `id` — primary key
- `google_sub` — unique Google subject identifier
- `email`
- `display_name`
- `role` — `user | admin | super_admin`
- `status` — `active | suspended`
- `created_at`

## Links

Columns:
- `id` — auto-increment primary key
- `code` — base62(id), unique, indexed
- `original_url`
- `user_id` — foreign key to `users`, nullable for anonymous links
- `anon_session_id` — nullable, used for claim-on-sign-in
- `expires_at` — nullable, set for anonymous TTL
- `click_count` — default 0
- `status` — `active | disabled`
- `disabled_reason`
- `disabled_by`
- `created_at`

## Blocklist

Columns:
- `id`
- `domain`
- `reason`
- `added_by`
- `created_at`

## Reports

Columns:
- `id`
- `link_id`
- `reporter`
- `reason`
- `status` — `open | resolved`
- `resolved_by`
- `resolution_note`
- `created_at`

## Audit logs

Columns:
- `id`
- `actor_id`
- `action`
- `target_type`
- `target_id`
- `metadata` — JSONB
- `created_at`

## Notes

- `code` may be stored after creation or computed on the fly from `id`.
- `expires_at` is set to `created_at + 30 days` for anonymous links and `NULL` for user-owned links unless a custom expiry feature is added later.
- `anon_session_id` should be signed and tied to a browser session for claiming anonymous links.
