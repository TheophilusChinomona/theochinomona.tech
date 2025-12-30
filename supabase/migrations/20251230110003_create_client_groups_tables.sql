-- Migration: Create client_groups and client_group_members tables
-- Task Group 3: Client Groups Schema & Migration

-- Create client_groups table
CREATE TABLE client_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_client_groups_updated_at
  BEFORE UPDATE ON client_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create client_group_members table (junction table)
CREATE TABLE client_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES client_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_client_group_members_group_id ON client_group_members(group_id);
CREATE INDEX idx_client_group_members_user_id ON client_group_members(user_id);

-- Enable Row Level Security on client_groups
ALTER TABLE client_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all client groups
CREATE POLICY "Admins can manage all client groups"
  ON client_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on client_groups
CREATE POLICY "Service role full access on client_groups"
  ON client_groups FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Enable Row Level Security on client_group_members
ALTER TABLE client_group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all group members
CREATE POLICY "Admins can manage all group members"
  ON client_group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on client_group_members
CREATE POLICY "Service role full access on client_group_members"
  ON client_group_members FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE client_groups IS 'Groups for organizing clients (used for release note targeting)';
COMMENT ON TABLE client_group_members IS 'Junction table linking users to client groups';
COMMENT ON COLUMN client_groups.name IS 'Unique name for the client group';


