-- URL Shortener — PostgreSQL init script
-- Derived from docs/database/database.md + schema.prisma
-- Run once against a blank database, or let Prisma migrate instead.
-- Requires: PostgreSQL 15+, citext extension.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for code/original_url fuzzy search (FC-LINKS.1)

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role   AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE link_status AS ENUM ('active', 'disabled');

-- ---------------------------------------------------------------------------
-- Identity & auth
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id         text        PRIMARY KEY,                    -- cuid (Auth.js)
  email      citext      NOT NULL UNIQUE,                -- case-insensitive identity + admin search (FC-USERS.1)
  role       user_role   NOT NULL DEFAULT 'user',        -- FC-RBAC.1
  status     user_status NOT NULL DEFAULT 'active',      -- FC-USERS.2
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);

-- Auth.js adapter — one row per linked OAuth identity (FA-SIGNIN).
-- Provider token columns dropped intentionally (sign-in only).
CREATE TABLE accounts (
  id                  text NOT NULL PRIMARY KEY,
  user_id             text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type                text NOT NULL,                     -- oauth | oidc
  provider            text NOT NULL,                     -- e.g. google
  provider_account_id text NOT NULL                      -- OAuth sub; login lookup key
);

CREATE UNIQUE INDEX idx_accounts_provider ON accounts (provider, provider_account_id);
CREATE INDEX         idx_accounts_user_id ON accounts (user_id);

-- Auth.js session store.
CREATE TABLE sessions (
  id            text        NOT NULL PRIMARY KEY,
  session_token text        NOT NULL UNIQUE,
  user_id       text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires       timestamptz NOT NULL
);

-- ---------------------------------------------------------------------------
-- Core link domain
-- ---------------------------------------------------------------------------

CREATE TABLE links (
  id              bigint      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,  -- base62 source
  code            text        NOT NULL UNIQUE,                            -- base62(id), written on insert
  original_url    text        NOT NULL,                                   -- validated http(s), non-self-ref
  user_id         text        REFERENCES users (id) ON DELETE SET NULL,  -- null = anonymous
  anon_session_id text,                                                   -- signed session id for claim-on-sign-in
  expires_at      timestamptz,                                            -- null = permanent
  click_count     bigint      NOT NULL DEFAULT 0,                        -- atomic +1 on redirect
  status          link_status NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_links_user_created  ON links (user_id, created_at DESC); -- FA-HISTORY
CREATE INDEX idx_links_anon_session  ON links (anon_session_id) WHERE anon_session_id IS NOT NULL; -- FA-SIGNIN.2
CREATE INDEX idx_links_expires_at    ON links (expires_at)      WHERE expires_at IS NOT NULL;      -- FA-EXPIRY TTL sweeps
CREATE INDEX idx_links_status        ON links (status);                                             -- FC-LINKS.1 admin filter
CREATE INDEX idx_links_code_trgm     ON links USING gin (code gin_trgm_ops);                       -- fuzzy search
CREATE INDEX idx_links_url_trgm      ON links USING gin (original_url gin_trgm_ops);               -- fuzzy search


