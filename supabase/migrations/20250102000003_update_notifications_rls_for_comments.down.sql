-- Rollback: Restore the original admin-only INSERT policy
DROP POLICY IF EXISTS "Users can create notifications for project participants" ON notifications;

-- Recreate the original admin-only policy
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

