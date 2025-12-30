-- Down migration for project_phases table

-- Drop trigger
DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;

-- Drop RLS policies
DROP POLICY IF EXISTS "Public can view phases via active tracking code" ON project_phases;
DROP POLICY IF EXISTS "Admins can manage all phases" ON project_phases;

-- Drop indexes
DROP INDEX IF EXISTS idx_project_phases_status;
DROP INDEX IF EXISTS idx_project_phases_project_sort;
DROP INDEX IF EXISTS idx_project_phases_project_id;

-- Drop table
DROP TABLE IF EXISTS project_phases;

-- Drop enum type
DROP TYPE IF EXISTS phase_status;


