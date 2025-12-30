-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('admin', 'client');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT their own row
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth_user_id = auth.uid());

-- RLS Policy: Users can UPDATE their own row (name, surname, phone only)
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid() AND
    -- Prevent role changes via this policy
    role = (SELECT role FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Admins can SELECT all rows
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role can INSERT/UPDATE/DELETE (for backend operations)
-- Note: Service role bypasses RLS by default, but we can create explicit policy
CREATE POLICY "Service role full access"
  ON users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policy: Allow INSERT for authenticated users creating their own record
-- This will be used when a user signs up
CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

