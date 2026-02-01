-- Rollback: Restore previous RLS policy
-- Task Group 12: Unified My Projects Page

-- Drop the fixed policy
DROP POLICY IF EXISTS "Clients can update their own projects" ON projects;

-- Restore the previous policy (with the bug)
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

