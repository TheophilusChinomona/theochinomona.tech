-- Create project_request_attachments table
-- Task Group 1: Project Requests Schema & Migrations

CREATE TYPE attachment_file_type AS ENUM ('pdf', 'image');

CREATE TABLE project_request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES project_requests(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type attachment_file_type NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_project_request_attachments_request_id ON project_request_attachments(request_id);
CREATE INDEX idx_project_request_attachments_created_at ON project_request_attachments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE project_request_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can view attachments for their own requests
CREATE POLICY "Clients can view attachments for their own requests"
  ON project_request_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_requests pr
      JOIN users u ON u.id = pr.client_id
      WHERE pr.id = project_request_attachments.request_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Clients can INSERT attachments for their own requests
CREATE POLICY "Clients can create attachments for their own requests"
  ON project_request_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_requests pr
      JOIN users u ON u.id = pr.client_id
      WHERE pr.id = project_request_attachments.request_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can manage all attachments
CREATE POLICY "Admins can manage all attachments"
  ON project_request_attachments FOR ALL
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

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access on project_request_attachments"
  ON project_request_attachments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments
COMMENT ON TABLE project_request_attachments IS 'File attachments for project requests';
COMMENT ON COLUMN project_request_attachments.file_type IS 'File type: pdf or image';
COMMENT ON COLUMN project_request_attachments.file_size IS 'File size in bytes';

