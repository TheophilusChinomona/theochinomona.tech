-- Rollback migration: Drop projects table and related objects

-- Drop RLS policies
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;

-- Drop trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

-- Drop indexes
DROP INDEX IF EXISTS idx_projects_category;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_featured;
DROP INDEX IF EXISTS idx_projects_created_at;
DROP INDEX IF EXISTS idx_projects_status_featured;

-- Drop table
DROP TABLE IF EXISTS projects;

-- Drop enum type
DROP TYPE IF EXISTS project_status;

