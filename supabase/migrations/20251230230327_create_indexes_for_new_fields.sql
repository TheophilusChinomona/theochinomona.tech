-- Create indexes for new fields
-- Task Group 2: Projects Table Updates
-- Part 2.5: Create indexes for new fields

-- Index on deleted_at for filtering soft-deleted projects
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);

-- Index on is_hiring_request for admin prioritization queries
CREATE INDEX IF NOT EXISTS idx_projects_is_hiring_request ON projects(is_hiring_request);

-- Note: created_by index already exists from migration 20251230130005_add_project_approval_fields.sql

