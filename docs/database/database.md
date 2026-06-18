// ShortLink — database schema (DBML)
// Render at https://dbdiagram.io or with `@dbml/cli`.

Project url_shortener {
  database_type: 'PostgreSQL'
  Note: 'Short code is base62(links.id); links.id is a monotonic bigint identity.'
}

Enum user_role {
  anonymous
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

// Provider identity lives in `accounts`. Auth.js adapter fields stripped to only what the app reads.
Table users {
  id            text [pk]
  email         citext [unique, note: 'null for anonymous users']
  password_hash text [note: 'null for OAuth users; only set for admin/super_admin email+password login']
  role          user_role [not null, default: 'anonymous', note: 'anonymous = created on first shorten, promoted to user on sign-in']
  status        user_status [not null, default: 'active', note: 'suspended = no link creation/claim; existing links unaffected']
  created_at    timestamptz [not null, default: `now()`]

  Indexes {
    role
  }
}

// Auth.js adapter — one row per linked OAuth identity.
// Provider token columns dropped (sign-in only, never read).
Table accounts {
  id                  text [pk]
  user_id             text [not null, ref: > users.id]
  type                text [not null, note: 'oauth | oidc']
  provider            text [not null]
  provider_account_id text [not null, note: 'OAuth subject (sub)']

  Indexes {
    (provider, provider_account_id) [unique]
    user_id
  }
}

// Insert row -> UPDATE code = base62(id) in the same transaction.
// Active = status='active' AND (expires_at IS NULL OR expires_at > now()).
// Delete is hard; code never reused (monotonic id).
Table links {
  id           bigint [pk, increment]
  code         text [unique, not null, note: 'base62(id)']
  original_url text [not null]
  user_id      text [not null, ref: > users.id, note: 'points to anonymous user row until claimed']
  expires_at   timestamptz [note: 'null = permanent']
  click_count  bigint [not null, default: 0]
  status       link_status [not null, default: 'active']
  created_at   timestamptz [not null, default: `now()`]

  Indexes {
    (user_id, created_at)
    expires_at [note: 'where not null']
    status
  }
}
