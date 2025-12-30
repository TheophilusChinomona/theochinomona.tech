-- Migration: Create activity_log table for tracking project activity history
-- Task Group 2: Activity Log Schema & Migration

-- Create activity_log_event_type enum
CREATE TYPE activity_log_event_type AS ENUM (
  'phase_completed',
  'phase_started', 
  'task_updated',
  'note_added',
  'file_uploaded',
  'project_created',
  'project_completed'
);

-- Create activity_log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- nullable for system events
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type activity_log_event_type NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_project_created ON activity_log(project_id, created_at DESC);
CREATE INDEX idx_activity_log_event_type ON activity_log(event_type);

-- Enable Row Level Security
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can SELECT logs for projects where they are the client
CREATE POLICY "Clients can view activity for their projects"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN users u ON u.id = p.client_id
      WHERE p.id = activity_log.project_id 
        AND u.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can SELECT all logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Admins can INSERT logs
CREATE POLICY "Admins can create activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access (for triggers and backend operations)
CREATE POLICY "Service role full access on activity_log"
  ON activity_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE activity_log IS 'Tracks activity events for projects (phases, tasks, notes, files)';
COMMENT ON COLUMN activity_log.user_id IS 'User who triggered the event, NULL for system-generated events';
COMMENT ON COLUMN activity_log.event_data IS 'JSONB payload with event-specific details (e.g., phase_name, task_name, etc.)';


