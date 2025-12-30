-- Down migration for project_tasks, project_attachments, and client_notification_preferences tables

-- Drop triggers
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON client_notification_preferences;
DROP TRIGGER IF EXISTS update_project_tasks_updated_at ON project_tasks;

-- Drop RLS policies for client_notification_preferences
DROP POLICY IF EXISTS "Public can manage their notification preferences" ON client_notification_preferences;
DROP POLICY IF EXISTS "Admins can manage all notification preferences" ON client_notification_preferences;

-- Drop RLS policies for project_attachments
DROP POLICY IF EXISTS "Public can view attachments via active tracking code" ON project_attachments;
DROP POLICY IF EXISTS "Admins can manage all attachments" ON project_attachments;

-- Drop RLS policies for project_tasks
DROP POLICY IF EXISTS "Public can view tasks via active tracking code" ON project_tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON project_tasks;

-- Drop indexes
DROP INDEX IF EXISTS idx_notification_preferences_email;
DROP INDEX IF EXISTS idx_notification_preferences_tracking_code;
DROP INDEX IF EXISTS idx_project_attachments_task_id;
DROP INDEX IF EXISTS idx_project_attachments_phase_id;
DROP INDEX IF EXISTS idx_project_attachments_project_id;
DROP INDEX IF EXISTS idx_project_tasks_phase_sort;
DROP INDEX IF EXISTS idx_project_tasks_phase_id;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS client_notification_preferences;
DROP TABLE IF EXISTS project_attachments;
DROP TABLE IF EXISTS project_tasks;

-- Drop enum type
DROP TYPE IF EXISTS attachment_type;


