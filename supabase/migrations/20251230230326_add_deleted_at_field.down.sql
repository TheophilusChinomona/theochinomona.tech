-- Rollback: Remove deleted_at field
-- Task Group 2: Projects Table Updates

ALTER TABLE projects
DROP COLUMN IF EXISTS deleted_at;

