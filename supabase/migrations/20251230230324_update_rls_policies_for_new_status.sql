-- Update RLS policies to use new status values
-- Task Group 1: Project Status Enum Replacement
-- Part 1.6: Update all RLS policies and queries

-- Update "Public can view published projects" policy to use 'completed' instead of 'published'
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'completed'::project_status_new);

-- Update "Clients can create projects" policy to use new status values
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
      -- Only allow inserting with status 'pending' (replaces 'pending_approval' and 'draft')
      projects.status = 'pending'::project_status_new
    )
    AND (
      -- Ensure created_by matches the authenticated user
      projects.created_by = (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Update comment for documentation
COMMENT ON POLICY "Clients can create projects" ON projects 
  IS 'Allows client users to create projects with status pending. The created_by field must match the authenticated user.';

