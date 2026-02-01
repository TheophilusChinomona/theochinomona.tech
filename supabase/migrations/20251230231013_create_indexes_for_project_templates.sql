-- Create indexes for project templates
-- Task Group 4: Project Templates Schema
-- Part 4.4: Create indexes for project templates

-- Index on user_id for filtering templates by user
CREATE INDEX IF NOT EXISTS idx_project_templates_user_id ON project_templates(user_id);

-- Index on created_at DESC for chronological ordering
CREATE INDEX IF NOT EXISTS idx_project_templates_created_at ON project_templates(created_at DESC);

-- Index on template_id for attachments
CREATE INDEX IF NOT EXISTS idx_project_template_attachments_template_id ON project_template_attachments(template_id);

