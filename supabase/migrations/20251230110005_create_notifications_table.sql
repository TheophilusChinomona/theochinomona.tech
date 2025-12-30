-- Migration: Create notifications table for user notifications
-- Task Group 5: Notifications Schema & Migration

-- Create notification_type enum
CREATE TYPE notification_type AS ENUM (
  'project_update',
  'phase_complete',
  'task_update',
  'note_added',
  'file_uploaded',
  'release_note',
  'system'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Optional data for deep links (e.g., project_id, phase_id)
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Users can UPDATE read status on their own notifications
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Admins can INSERT notifications (for creating notifications for users)
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access (for backend operations and triggers)
CREATE POLICY "Service role full access on notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'User notifications for project updates, releases, and system messages';
COMMENT ON COLUMN notifications.type IS 'Type of notification for display and filtering';
COMMENT ON COLUMN notifications.data IS 'JSONB payload for deep linking (e.g., project_id, phase_id, release_note_id)';
COMMENT ON COLUMN notifications.read IS 'Whether the user has read/acknowledged the notification';


