-- Allow users to read other users' basic info when accessed through foreign key relationships
-- This is needed for displaying comment authors, etc.
-- Task Group 15: Integration Updates

CREATE POLICY "Users can read user info through foreign keys"
  ON users FOR SELECT
  USING (
    -- Allow reading user data when accessed through project_comments foreign key
    -- This allows clients to see admin names/roles in comments
    EXISTS (
      SELECT 1 FROM project_comments pc
      JOIN projects p ON p.id = pc.project_id
      WHERE pc.user_id = users.id
      AND (
        -- Current user is the client of the project
        (p.client_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
        OR
        -- Current user created the project
        (p.created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
        OR
        -- Current user is an admin
        EXISTS (
          SELECT 1 FROM users
          WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

COMMENT ON POLICY "Users can read user info through foreign keys" ON users
  IS 'Allows users to read other users basic info (name, surname, role) when accessed through foreign key relationships like project_comments';

