-- Rollback: Remove the client activity log creation policy
DROP POLICY IF EXISTS "Clients can create activity logs for their projects" ON activity_log;

