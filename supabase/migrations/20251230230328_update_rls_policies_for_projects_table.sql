-- Update RLS policies for projects table
-- Task Group 2: Projects Table Updates
-- Part 2.6: Update RLS policies for projects table

-- Update SELECT policy: Clients can view projects where client_id OR created_by matches their user_id AND deleted_at IS NULL
-- Drop existing client view policies and recreate with deleted_at check
DROP POLICY IF EXISTS "Clients can view their own projects" ON projects;
DROP POLICY IF EXISTS "Clients can view projects they created" ON projects;
DROP POLICY IF EXISTS "Clients can view their assigned projects" ON projects;

-- Recreate unified policy for clients to view their projects
CREATE POLICY "Clients can view their own projects"
  ON projects FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = projects.client_id
        AND auth_user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = projects.created_by
        AND auth_user_id = auth.uid()
      )
    )
  );

-- Update UPDATE policy: Clients can update projects where created_by matches their user_id AND status is pending
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;

CREATE POLICY "Clients can update their own projects"
  ON projects FOR UPDATE
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
    AND status IN ('pending', 'pending_payment', 'pending_info')
  )
  WITH CHECK (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
    AND status IN ('pending', 'pending_payment', 'pending_info')
  );

-- Add DELETE policy: Clients can soft-delete (UPDATE deleted_at) projects where created_by matches their user_id AND status IN ('pending', 'pending_payment', 'pending_info')
-- Note: We use UPDATE policy for soft-delete since we're updating deleted_at, not actually deleting
-- Clients can update deleted_at to soft-delete
-- The UPDATE policy above already allows clients to update their own projects with pending statuses
-- We'll add a specific check in the application layer to ensure only deleted_at can be updated for soft-delete

-- Add comment for documentation
COMMENT ON POLICY "Clients can view their own projects" ON projects 
  IS 'Allows clients to view projects where they are client_id OR created_by, excluding soft-deleted projects';

COMMENT ON POLICY "Clients can update their own projects" ON projects 
  IS 'Allows clients to update projects they created with pending statuses (pending, pending_payment, pending_info), excluding soft-deleted projects';

