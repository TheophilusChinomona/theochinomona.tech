-- Fix RLS policy to allow clients to soft-delete their own projects
-- The WITH CHECK clause was blocking updates that set deleted_at to a timestamp
-- Task Group 12: Unified My Projects Page

-- Drop the existing policy
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;

-- Recreate the policy with a WITH CHECK that allows setting deleted_at
CREATE POLICY "Clients can update their own projects"
  ON projects FOR UPDATE
  USING (
    -- Can only update if deleted_at is currently NULL (not already soft-deleted)
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
    AND status IN ('pending', 'pending_payment', 'pending_info')
  )
  WITH CHECK (
    -- Allow updates where:
    -- 1. deleted_at is NULL (normal updates) AND status is still pending
    -- 2. OR deleted_at is being set (soft-delete) - allow this regardless of status check
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
    AND (
      -- Case 1: Normal update - deleted_at stays NULL, status must be pending
      (deleted_at IS NULL AND status IN ('pending', 'pending_payment', 'pending_info'))
      OR
      -- Case 2: Soft-delete - deleted_at is being set (not NULL)
      deleted_at IS NOT NULL
    )
  );

-- Update comment for documentation
COMMENT ON POLICY "Clients can update their own projects" ON projects 
  IS 'Allows clients to update or soft-delete projects they created with pending statuses. Soft-delete is allowed by setting deleted_at.';

