-- Rollback: Drop project_templates table
-- Task Group 4: Project Templates Schema

DROP TRIGGER IF EXISTS update_project_templates_updated_at ON project_templates;
DROP TABLE IF EXISTS project_templates;

