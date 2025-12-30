-- Create phase_status enum type
CREATE TYPE phase_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create project_phases table
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  estimated_start_date DATE,
  estimated_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status phase_status NOT NULL DEFAULT 'pending',
  notify_on_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_project_phases_project_sort ON project_phases(project_id, sort_order);
CREATE INDEX idx_project_phases_status ON project_phases(status);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_project_phases_updated_at
  BEFORE UPDATE ON project_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view phases for projects with active tracking codes
CREATE POLICY "Public can view phases via active tracking code"
  ON project_phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_codes
      WHERE tracking_codes.project_id = project_phases.project_id
        AND tracking_codes.is_active = true
    )
  );

-- RLS Policy: Admins can manage all phases
CREATE POLICY "Admins can manage all phases"
  ON project_phases FOR ALL
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


