CREATE TABLE IF NOT EXISTS businesses (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- roles: 'employer' or 'employee'
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'employee')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- easiest login rule: email unique globally
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);