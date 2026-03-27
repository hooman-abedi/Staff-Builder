-- Allow internal platform users to exist without belonging to a customer business
ALTER TABLE users
ALTER COLUMN business_id DROP NOT NULL;

-- Update role constraint if it exists in a CHECK form by dropping and recreating it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'users_role_check'
          AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('super_admin', 'support_admin', 'employer', 'employee'));