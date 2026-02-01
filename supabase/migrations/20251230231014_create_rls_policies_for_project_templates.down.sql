-- Rollback: Drop RLS policies
-- Task Group 4: Project Templates Schema

DROP POLICY IF EXISTS "Users can manage their own templates" ON project_templates;
DROP POLICY IF EXISTS "Admins can view all templates" ON project_templates;
DROP POLICY IF EXISTS "Service role full access on project_templates" ON project_templates;

DROP POLICY IF EXISTS "Users can manage attachments for their templates" ON project_template_attachments;
DROP POLICY IF EXISTS "Admins can view all template attachments" ON project_template_attachments;
DROP POLICY IF EXISTS "Service role full access on project_template_attachments" ON project_template_attachments;

