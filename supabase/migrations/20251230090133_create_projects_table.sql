-- Create project_status enum type
CREATE TYPE project_status AS ENUM ('draft', 'published');

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech TEXT[] NOT NULL,
  category TEXT NOT NULL,
  thumbnail TEXT,
  client_name TEXT,
  project_url TEXT,
  github_url TEXT,
  completion_date DATE,
  featured BOOLEAN NOT NULL DEFAULT false,
  status project_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TODO: Add foreign key to client_projects table in Phase 5

-- Create indexes for performance
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_status_featured ON projects(status, featured);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view published projects
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'published');

-- RLS Policy: Admins can manage all projects
CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
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

