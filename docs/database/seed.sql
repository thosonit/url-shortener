-- URL Shortener — seed data
-- Assumes init.sql has already been applied.
-- Replace email values with real accounts before running.

-- ---------------------------------------------------------------------------
-- Default admin accounts
-- Auth.js creates users on first sign-in; these rows pre-assign roles so the
-- correct role is in place the moment the OAuth callback fires.
-- ---------------------------------------------------------------------------

INSERT INTO users (id, email, role, status, created_at) VALUES
  ('cuid_super_01', 'super@example.com', 'super_admin', 'active', now()),
  ('cuid_admin_01', 'admin@example.com', 'admin',       'active', now())
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;
