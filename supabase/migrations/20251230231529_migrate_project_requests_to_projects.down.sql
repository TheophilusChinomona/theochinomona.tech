-- Rollback: Restore project_requests tables
-- Task Group 6: Project Requests Data Migration
-- Note: This rollback is complex and may result in data loss

-- Restore table names
ALTER TABLE project_requests_archived RENAME TO project_requests;
ALTER TABLE project_request_attachments_archived RENAME TO project_request_attachments;

-- Note: Restoring the actual data would require:
-- 1. Identifying migrated projects (by matching criteria)
-- 2. Deleting them from projects table
-- 3. Restoring project_requests data
-- This is a complex operation and should be done manually if needed

