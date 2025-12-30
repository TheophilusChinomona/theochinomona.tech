-- Rollback: Remove client_id from projects table

-- Remove index
DROP INDEX IF EXISTS idx_projects_client_id;

-- Remove column
ALTER TABLE projects DROP COLUMN IF EXISTS client_id;

