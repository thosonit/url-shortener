// URL Shortener — database schema (DBML)
// Derived from docs/features.md. Stack: PostgreSQL + Prisma + Auth.js.
//
// Minimal in-scope schema: FA001–FA005, FC001–FC003, FC006.
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

//============================================================
// Identity & auth
//============================================================

// Application user + role/permission anchor (FA003, FC002, FC006).
// Provider identity lives in `accounts`, never here (multi-provider ready).
// Trimmed to fields the app reads: no name/image/email_verified profile mirror
// (sign-in only — never displayed; `email` is the identity shown in CMS).
// Requires overriding the adapter's `createUser`/`updateUser` to strip
// `name`/`image`/`emailVerified` before insert, else Prisma rejects them.
Table users {
  id          text [pk, note: 'cuid (Auth.js)']
  email       citext [unique, not null, note: 'case-insensitive; identity + admin search (FC006.1)']
  role        user_role [not null, default: 'user', note: 'FC002.1']
  status      user_status [not null, default: 'active', note: 'FC006.2; suspended = session rejected (no link creation/claim); existing links unaffected']
  created_at  timestamptz [not null, default: `now()`, note: 'user-list ordering (FC006.1)']

  Indexes {
    role [note: 'admin filtering']
  }
}

// Auth.js adapter — one row per linked OAuth identity (FA003).
// (provider, provider_account_id) replaces the old google_sub.
// Sign-in only: we never call Google APIs, so the provider token columns
// (access_token, refresh_token, id_token, expires_at, token_type, scope,
// session_state) are intentionally dropped — they would never be read.
// Requires overriding the adapter's `linkAccount` to strip those fields before
// insert, else Prisma rejects the extra keys the provider returns.
Table accounts {
  id                  text [pk]
  user_id             text [not null, ref: > users.id, note: 'cascade delete']
  type                text [not null, note: 'oauth | oidc']
  provider            text [not null, note: 'e.g. google']
  provider_account_id text [not null, note: 'OAuth subject (sub); login lookup key']

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
  status          link_status [not null, default: 'active', note: 'FC003.2; disable = status-only, no reason/actor stored']
  created_at      timestamptz [not null, default: `now()`, note: 'history order (FA004), shown in lists']

  Indexes {
    (user_id, created_at) [note: 'history, FA004 (desc)']
    anon_session_id [note: 'claim, FA003.2 (where not null)']
    expires_at [note: 'TTL sweeps, FA005 (where not null)']
    status [note: 'admin filter/search, FC003.1 (pair pg_trgm on code/original_url)']
  }
}

