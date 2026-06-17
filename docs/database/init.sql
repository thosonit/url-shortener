-- URL Shortener — PostgreSQL init script
-- Run once against a blank database, or let Prisma migrate instead.
-- Requires: PostgreSQL 15+, citext extension.

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE user_role   AS ENUM ('anonymous', 'user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended');
CREATE TYPE link_status AS ENUM ('active', 'disabled');

CREATE TABLE users (
  id            text        PRIMARY KEY,
  email         citext      UNIQUE,
  password_hash text,                                      -- null for OAuth users
  role          user_role   NOT NULL DEFAULT 'anonymous',
  status        user_status NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users (role);

-- One row per linked OAuth identity. Provider token columns dropped (sign-in only).
CREATE TABLE accounts (
  id                  text NOT NULL PRIMARY KEY,
  user_id             text NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type                text NOT NULL,
  provider            text NOT NULL,
  provider_account_id text NOT NULL
);

CREATE UNIQUE INDEX idx_accounts_provider ON accounts (provider, provider_account_id);
CREATE INDEX         idx_accounts_user_id ON accounts (user_id);

CREATE TABLE links (
  id           bigint      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code         text        NOT NULL UNIQUE,
  original_url text        NOT NULL,
  user_id      text        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at   timestamptz,
  click_count  bigint      NOT NULL DEFAULT 0,
  status       link_status NOT NULL DEFAULT 'active',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_links_user_created ON links (user_id, created_at DESC);
CREATE INDEX idx_links_expires_at   ON links (expires_at)  WHERE expires_at IS NOT NULL;
CREATE INDEX idx_links_status       ON links (status);
CREATE INDEX idx_links_code_trgm    ON links USING gin (code gin_trgm_ops);
CREATE INDEX idx_links_url_trgm     ON links USING gin (original_url gin_trgm_ops);
