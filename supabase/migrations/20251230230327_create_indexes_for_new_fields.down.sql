-- Rollback: Drop indexes
-- Task Group 2: Projects Table Updates

DROP INDEX IF EXISTS idx_projects_deleted_at;
DROP INDEX IF EXISTS idx_projects_is_hiring_request;

