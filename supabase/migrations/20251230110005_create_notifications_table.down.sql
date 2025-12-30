-- Down Migration: Remove notifications table
-- Task Group 5: Notifications Schema & Migration

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Service role full access on notifications" ON notifications;

-- Drop indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_read_created;
DROP INDEX IF EXISTS idx_notifications_type;

-- Drop table
DROP TABLE IF EXISTS notifications;

-- Drop enum type
DROP TYPE IF EXISTS notification_type;


