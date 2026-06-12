// URL Shortener — database schema (DBML)
// Derived from docs/features.md. Stack: PostgreSQL + Prisma + Auth.js.
// Redis holds ephemeral state only (rate-limit counters, cache) — not modeled here.
//
// Minimal in-scope schema: FA001–FA006, FC001–FC003, FC006, FC007.
// Render at https://dbdiagram.io or with `@dbml/cli`.

Project url_shortener {
  database_type: 'PostgreSQL'
  Note: 'Short code is base62(links.id); links.id is a monotonic bigint identity.'
}

//============================================================
// Enums
//============================================================

Enum user_role {
  user
  admin
  super_admin
}

Enum user_status {
  active
  suspended
}

Enum link_status {
  active
  disabled
}

Enum actor_type {
  user
  system
}

//============================================================
// Identity & auth
//============================================================

// Application user + role/permission anchor (FA003, FC002, FC006).
// Provider identity lives in `accounts`, never here (multi-provider ready).
Table users {
  id                  text [pk, note: 'cuid (Auth.js)']
  email               citext [unique, not null, note: 'case-insensitive']
  email_verified      timestamptz [note: 'Auth.js field']
  display_name        text
  image_url           text
  role                user_role [not null, default: 'user', note: 'FC002.1']
  status              user_status [not null, default: 'active', note: 'FC006.2; who/why/when in audit_logs']
  created_at          timestamptz [not null, default: `now()`]
  updated_at          timestamptz [not null, default: `now()`]

  Indexes {
    role [note: 'admin filtering']
  }
}

// Auth.js adapter — one row per linked OAuth identity (FA003).
// (provider, provider_account_id) replaces the old google_sub.
Table accounts {
  id                  text [pk]
  user_id             text [not null, ref: > users.id, note: 'cascade delete']
  type                text [not null]
  provider            text [not null, note: 'e.g. google']
  provider_account_id text [not null, note: 'OAuth subject (sub)']
  refresh_token       text
  access_token        text
  expires_at          integer
  token_type          text
  scope               text
  id_token            text
  session_state       text

  Indexes {
    (provider, provider_account_id) [unique]
    user_id
  }
}

// Auth.js adapter. Admin sessions get a shorter `expires`, applied app-side (FC002.3 hardening).
Table sessions {
  id            text [pk]
  session_token text [unique, not null]
  user_id       text [not null, ref: > users.id, note: 'cascade delete']
  expires       timestamptz [not null]
}

//============================================================
// Core link domain
//============================================================

// Source of truth for the short code and every redirect (FA001, FA002, FA004, FA005, FC003).
// Insert row -> UPDATE code = base62(id) in the same transaction.
// Resolved state is derived, never stored: active iff
//   status='active' AND (expires_at IS NULL OR expires_at > now()).
Table links {
  id              bigint [pk, increment, note: 'identity; base62 source (FA001.2)']
  code            text [unique, not null, note: 'base62(id), stored on insert']
  original_url    text [not null, note: 'validated http(s), non-self-referential (FA001.1)']
  user_id         text [ref: > users.id, note: 'null = anonymous link']
  anon_session_id text [note: 'signed session id, for claim-on-sign-in (FA003.2)']
  expires_at      timestamptz [note: 'null = permanent; default rules in FA005']
  click_count     bigint [not null, default: 0, note: 'incremented on redirect (FA002.1)']
  status          link_status [not null, default: 'active', note: 'FC003.2']
  disabled_reason text
  disabled_by     text [ref: > users.id, note: 'admin actor (FC003.2)']
  disabled_at     timestamptz
  created_at      timestamptz [not null, default: `now()`]
  updated_at      timestamptz [not null, default: `now()`]

  Indexes {
    (user_id, created_at) [note: 'history, FA004 (desc)']
    anon_session_id [note: 'claim, FA003.2 (where not null)']
    expires_at [note: 'TTL sweeps, FA005 (where not null)']
    status [note: 'admin filter/search, FC003.1 (pair pg_trgm on code/original_url)']
  }
}

//============================================================
// Audit
//============================================================

// Immutable record of every mutating admin/system action (FC007). Append-only.
Table audit_logs {
  id          text [pk]
  actor_id    text [ref: > users.id, note: 'null = system action']
  actor_type  actor_type [not null, default: 'user']
  action      text [not null, note: 'dotted verb: link.disable, role.assign, user.suspend']
  target_type text [not null, note: 'link | user | ...']
  target_id   text [not null, note: 'stringified; links cast from bigint']
  metadata    jsonb [not null, default: `'{}'`, note: 'before/after, reason, request ip']
  created_at  timestamptz [not null, default: `now()`]

  Indexes {
    created_at [note: 'desc']
    (target_type, target_id)
    actor_id
  }
}

