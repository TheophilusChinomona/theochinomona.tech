-- Migration: Add RLS policy for clients to view their assigned projects
-- This allows clients to see projects where they are the assigned client_id,
-- regardless of the project's published status

-- RLS Policy: Clients can view projects assigned to them
CREATE POLICY "Clients can view their assigned projects"
  ON projects FOR SELECT
  USING (
    client_id IS NOT NULL 
    AND client_id = (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Clients can view their assigned projects" ON projects 
  IS 'Allows client users to view projects where they are the assigned client, regardless of draft/published status';

