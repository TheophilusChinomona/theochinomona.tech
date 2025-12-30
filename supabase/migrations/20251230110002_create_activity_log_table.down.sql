-- Down Migration: Remove activity_log table
-- Task Group 2: Activity Log Schema & Migration

-- Drop policies
DROP POLICY IF EXISTS "Clients can view activity for their projects" ON activity_log;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_log;
DROP POLICY IF EXISTS "Admins can create activity logs" ON activity_log;
DROP POLICY IF EXISTS "Service role full access on activity_log" ON activity_log;

-- Drop indexes
DROP INDEX IF EXISTS idx_activity_log_project_id;
DROP INDEX IF EXISTS idx_activity_log_user_id;
DROP INDEX IF EXISTS idx_activity_log_created_at;
DROP INDEX IF EXISTS idx_activity_log_project_created;
DROP INDEX IF EXISTS idx_activity_log_event_type;

-- Drop table
DROP TABLE IF EXISTS activity_log;

-- Drop enum type
DROP TYPE IF EXISTS activity_log_event_type;


