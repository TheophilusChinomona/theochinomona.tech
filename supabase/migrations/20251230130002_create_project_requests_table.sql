-- Create project_requests table
-- Task Group 1: Project Requests Schema & Migrations

CREATE TABLE project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  special_requirements TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  denial_reason TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_project_requests_updated_at
  BEFORE UPDATE ON project_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_project_requests_client_id ON project_requests(client_id);
CREATE INDEX idx_project_requests_status ON project_requests(status);
CREATE INDEX idx_project_requests_project_id ON project_requests(project_id);
CREATE INDEX idx_project_requests_created_at ON project_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can SELECT their own requests
CREATE POLICY "Clients can view their own requests"
  ON project_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = project_requests.client_id
      AND auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Clients can INSERT their own requests
CREATE POLICY "Clients can create their own requests"
  ON project_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = project_requests.client_id
      AND auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can manage all requests
CREATE POLICY "Admins can manage all requests"
  ON project_requests FOR ALL
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

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access on project_requests"
  ON project_requests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments
COMMENT ON TABLE project_requests IS 'Project requests submitted by clients';
COMMENT ON COLUMN project_requests.status IS 'Request status: pending, approved, denied, needs_info';
COMMENT ON COLUMN project_requests.project_id IS 'Linked project when request is approved';

