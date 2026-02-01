-- Create RLS policies for project comments
-- Task Group 3: Project Comments/Threads Schema
-- Part 3.6: Create RLS policies for project comments

-- Enable Row Level Security
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comment_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can SELECT/INSERT comments for projects where they are client_id OR created_by
CREATE POLICY "Clients can view comments for their projects"
  ON project_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN users u ON (u.id = p.client_id OR u.id = p.created_by)
      WHERE p.id = project_comments.project_id
      AND u.auth_user_id = auth.uid()
      AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "Clients can create comments for their projects"
  ON project_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN users u ON (u.id = p.client_id OR u.id = p.created_by)
      WHERE p.id = project_comments.project_id
      AND u.auth_user_id = auth.uid()
      AND p.deleted_at IS NULL
    )
    AND project_comments.user_id = (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can SELECT/INSERT/UPDATE/DELETE all comments
CREATE POLICY "Admins can manage all comments"
  ON project_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access for backend operations
CREATE POLICY "Service role full access on project_comments"
  ON project_comments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for project_comment_attachments
CREATE POLICY "Clients can view attachments for their project comments"
  ON project_comment_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_comments pc
      JOIN projects p ON p.id = pc.project_id
      JOIN users u ON (u.id = p.client_id OR u.id = p.created_by)
      WHERE pc.id = project_comment_attachments.comment_id
      AND u.auth_user_id = auth.uid()
      AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "Clients can create attachments for their project comments"
  ON project_comment_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_comments pc
      JOIN projects p ON p.id = pc.project_id
      JOIN users u ON (u.id = p.client_id OR u.id = p.created_by)
      WHERE pc.id = project_comment_attachments.comment_id
      AND u.auth_user_id = auth.uid()
      AND p.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can manage all comment attachments"
  ON project_comment_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access on project_comment_attachments"
  ON project_comment_attachments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

