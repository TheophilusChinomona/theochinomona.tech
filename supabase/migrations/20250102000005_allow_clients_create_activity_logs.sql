-- Allow clients to create activity logs for their projects
-- Task Group 15: Integration Updates

CREATE POLICY "Clients can create activity logs for their projects"
  ON activity_log FOR INSERT
  WITH CHECK (
    -- User must be involved in the project (as client_id or created_by)
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = activity_log.project_id
      AND (
        -- User is the client
        (p.client_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
        OR
        -- User created the project
        (p.created_by = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
      )
    )
  );

COMMENT ON POLICY "Clients can create activity logs for their projects" ON activity_log
  IS 'Allows clients to create activity log entries for projects they are involved in';

