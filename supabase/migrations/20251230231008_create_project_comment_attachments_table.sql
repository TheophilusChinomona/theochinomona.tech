-- Create project_comment_attachments table
-- Task Group 3: Project Comments/Threads Schema
-- Part 3.3: Create project_comment_attachments table migration

-- Reuse existing attachment_file_type enum (already exists from project_request_attachments)
-- If file_type enum is needed separately, we can create it, but attachment_file_type works

CREATE TABLE project_comment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES project_comments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type attachment_file_type NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE project_comment_attachments IS 'File attachments for project comments';
COMMENT ON COLUMN project_comment_attachments.file_type IS 'File type: pdf or image';
COMMENT ON COLUMN project_comment_attachments.file_size IS 'File size in bytes';

