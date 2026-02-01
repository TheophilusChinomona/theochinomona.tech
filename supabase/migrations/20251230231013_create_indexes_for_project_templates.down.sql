-- Rollback: Drop indexes
-- Task Group 4: Project Templates Schema

DROP INDEX IF EXISTS idx_project_templates_user_id;
DROP INDEX IF EXISTS idx_project_templates_created_at;
DROP INDEX IF EXISTS idx_project_template_attachments_template_id;

