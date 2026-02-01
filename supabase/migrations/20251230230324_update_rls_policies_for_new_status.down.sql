-- Rollback: Restore old RLS policies
-- Task Group 1: Project Status Enum Replacement

-- Restore "Public can view published projects" policy
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'published'::project_status);

-- Restore "Clients can create projects" policy
DROP POLICY IF EXISTS "Clients can create projects" ON projects;

CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
      AND role = 'client'
    )
    AND (
      projects.status = 'pending_approval'::project_status
      OR projects.status = 'draft'::project_status
    )
    AND (
      projects.created_by = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

