-- Add deleted_at field to projects table
-- Task Group 2: Projects Table Updates
-- Part 2.3: Add deleted_at field

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN projects.deleted_at IS 'Soft-delete timestamp. NULL means not deleted.';

