-- Rollback: Restore old RLS policies
-- Task Group 2: Projects Table Updates

-- Drop new policies
DROP POLICY IF EXISTS "Clients can view their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;

-- Restore old policies (without deleted_at checks)
CREATE POLICY "Clients can view their own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.client_id
      AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view projects they created"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view their assigned projects"
  ON projects FOR SELECT
  USING (
    client_id IS NOT NULL 
    AND client_id = (
      SELECT id FROM users 
      WHERE auth_user_id = auth.uid()
    )
  );

