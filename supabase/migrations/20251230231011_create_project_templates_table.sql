-- Create project_templates table
-- Task Group 4: Project Templates Schema
-- Part 4.2: Create project_templates table migration

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tech TEXT[] NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  special_requirements TEXT,
  is_hiring_request BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON project_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE project_templates IS 'Reusable project templates created by users';
COMMENT ON COLUMN project_templates.name IS 'Template name for easy identification';
COMMENT ON COLUMN project_templates.is_hiring_request IS 'Indicates if template is for hiring vs suggesting project';

