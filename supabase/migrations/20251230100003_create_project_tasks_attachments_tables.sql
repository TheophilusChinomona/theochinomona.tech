-- Create project_tasks table
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  developer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for project_tasks
CREATE INDEX idx_project_tasks_phase_id ON project_tasks(phase_id);
CREATE INDEX idx_project_tasks_phase_sort ON project_tasks(phase_id, sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view tasks via active tracking code (through phases -> projects -> tracking_codes chain)
CREATE POLICY "Public can view tasks via active tracking code"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_phases
      JOIN tracking_codes ON tracking_codes.project_id = project_phases.project_id
      WHERE project_phases.id = project_tasks.phase_id
        AND tracking_codes.is_active = true
    )
  );

-- RLS Policy: Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
  ON project_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create attachment_type enum
CREATE TYPE attachment_type AS ENUM ('image', 'pdf', 'video_embed');

-- Create project_attachments table
CREATE TABLE project_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type attachment_type NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for project_attachments
CREATE INDEX idx_project_attachments_project_id ON project_attachments(project_id);
CREATE INDEX idx_project_attachments_phase_id ON project_attachments(phase_id);
CREATE INDEX idx_project_attachments_task_id ON project_attachments(task_id);

-- Enable Row Level Security for project_attachments
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view attachments via active tracking code
CREATE POLICY "Public can view attachments via active tracking code"
  ON project_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_codes
      WHERE tracking_codes.project_id = project_attachments.project_id
        AND tracking_codes.is_active = true
    )
  );

-- RLS Policy: Admins can manage all attachments
CREATE POLICY "Admins can manage all attachments"
  ON project_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create client_notification_preferences table
CREATE TABLE client_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code_id UUID NOT NULL REFERENCES tracking_codes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  opted_in BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tracking_code_id, email)
);

-- Create indexes for client_notification_preferences
CREATE INDEX idx_notification_preferences_tracking_code ON client_notification_preferences(tracking_code_id);
CREATE INDEX idx_notification_preferences_email ON client_notification_preferences(email);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON client_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for client_notification_preferences
ALTER TABLE client_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can insert/update their own notification preferences
-- (No authentication required - identified by email + tracking code)
CREATE POLICY "Public can manage their notification preferences"
  ON client_notification_preferences FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Admins can manage all notification preferences
CREATE POLICY "Admins can manage all notification preferences"
  ON client_notification_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );


