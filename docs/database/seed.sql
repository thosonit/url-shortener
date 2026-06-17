-- URL Shortener — seed data
-- Assumes init.sql has already been applied.

-- Super admin with email + password login.
-- Password hash: bcrypt(cost=10) of the value in .env SUPER_ADMIN_PASSWORD.
INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES
  ('seed_super_01', 'thoson.it@gmail.com', '$2b$10$8PWUqbU/NpnjNYdFBP9YJOV8Ya9Hl92NuNf8sdEkqBLf9aPt1ScOq', 'super_admin', 'active', now())
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role          = EXCLUDED.role;
