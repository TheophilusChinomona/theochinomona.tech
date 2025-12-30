-- Add RLS policy to allow clients to INSERT projects
-- This allows clients to create project requests that will be pending approval

-- RLS Policy: Clients can create projects (for project requests)
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
      -- Only allow inserting with status 'pending_approval' or 'draft'
      projects.status = 'pending_approval'
      OR projects.status = 'draft'
    )
    AND (
      -- Ensure created_by matches the authenticated user
      projects.created_by = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "Clients can create projects" ON projects 
  IS 'Allows client users to create projects with status pending_approval or draft. The created_by field must match the authenticated user.';

