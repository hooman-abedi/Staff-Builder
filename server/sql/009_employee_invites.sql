CREATE TABLE IF NOT EXISTS employee_invites (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_invites_business_id
ON employee_invites (business_id);

CREATE INDEX IF NOT EXISTS idx_employee_invites_user_id
ON employee_invites (user_id);

CREATE INDEX IF NOT EXISTS idx_employee_invites_token
ON employee_invites (token);