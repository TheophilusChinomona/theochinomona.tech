-- Create project_comments table
-- Task Group 3: Project Comments/Threads Schema
-- Part 3.2: Create project_comments table migration

CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_project_comments_updated_at
  BEFORE UPDATE ON project_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE project_comments IS 'Comments/threads for project communication between admin and clients';
COMMENT ON COLUMN project_comments.parent_comment_id IS 'Parent comment ID for threaded replies. NULL for top-level comments.';

