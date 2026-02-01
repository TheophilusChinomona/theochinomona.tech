-- Create project_template_attachments table
-- Task Group 4: Project Templates Schema
-- Part 4.3: Create project_template_attachments table migration

CREATE TABLE project_template_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type attachment_file_type NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE project_template_attachments IS 'File attachments for project templates';
COMMENT ON COLUMN project_template_attachments.file_type IS 'File type: pdf or image';
COMMENT ON COLUMN project_template_attachments.file_size IS 'File size in bytes';

