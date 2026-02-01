-- Rollback: Remove is_hiring_request field
-- Task Group 2: Projects Table Updates

ALTER TABLE projects
DROP COLUMN IF EXISTS is_hiring_request;

