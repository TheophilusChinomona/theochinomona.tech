-- Update RLS policy to allow users to create notifications when commenting on projects
-- Task Group 14: Comment Thread Components

-- Drop the existing admin-only INSERT policy
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

-- Create a simpler policy that allows:
-- 1. Admins to create notifications for anyone
-- 2. Users to create notifications if the target user (user_id) is involved in a project with them
--    We check this by looking at the project_id in the notification data JSONB field
CREATE POLICY "Users can create notifications for project participants"
  ON notifications FOR INSERT
  WITH CHECK (
    -- Admins can create notifications for anyone
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
    OR
    -- Users can create notifications if:
    -- 1. The notification has a project_id in the data field
    -- 2. The target user (user_id) is the client or creator of that project
    -- 3. The current user is also involved in that project (client, creator, or admin)
    (
      (data->>'project_id') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id::text = data->>'project_id'
        AND (
          -- Target user is the client
          p.client_id = notifications.user_id
          OR
          -- Target user created the project
          p.created_by = notifications.user_id
        )
        AND (
          -- Current user is the client
          p.client_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
          OR
          -- Current user created the project
          p.created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid())
          OR
          -- Current user is an admin
          EXISTS (
            SELECT 1 FROM users
            WHERE auth_user_id = auth.uid()
            AND role = 'admin'
          )
        )
      )
    )
  );

COMMENT ON POLICY "Users can create notifications for project participants" ON notifications
  IS 'Allows admins and project participants to create notifications when commenting or interacting on shared projects';

