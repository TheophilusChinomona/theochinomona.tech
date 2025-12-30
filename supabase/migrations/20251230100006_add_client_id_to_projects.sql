-- Add client_id to projects table for linking projects to client users
-- This allows sending notifications to the project's client

-- Add client_id column
ALTER TABLE projects
ADD COLUMN client_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_projects_client_id ON projects(client_id);

-- Add comment for documentation
COMMENT ON COLUMN projects.client_id IS 'Reference to the client user who owns/is assigned to this project';

