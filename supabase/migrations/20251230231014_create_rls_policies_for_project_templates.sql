-- Create RLS policies for project templates
-- Task Group 4: Project Templates Schema
-- Part 4.5: Create RLS policies for project templates

-- Enable Row Level Security
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_template_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT/INSERT/UPDATE/DELETE their own templates
CREATE POLICY "Users can manage their own templates"
  ON project_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = project_templates.user_id
      AND auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = project_templates.user_id
      AND auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can SELECT all templates
CREATE POLICY "Admins can view all templates"
  ON project_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access for backend operations
CREATE POLICY "Service role full access on project_templates"
  ON project_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for project_template_attachments
CREATE POLICY "Users can manage attachments for their templates"
  ON project_template_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM project_templates pt
      JOIN users u ON u.id = pt.user_id
      WHERE pt.id = project_template_attachments.template_id
      AND u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_templates pt
      JOIN users u ON u.id = pt.user_id
      WHERE pt.id = project_template_attachments.template_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all template attachments"
  ON project_template_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access on project_template_attachments"
  ON project_template_attachments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

