-- Create indexes for project comments
-- Task Group 3: Project Comments/Threads Schema
-- Part 3.5: Create indexes for project comments

-- Index on project_id for filtering comments by project
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);

-- Index on parent_comment_id for threaded replies
CREATE INDEX IF NOT EXISTS idx_project_comments_parent_comment_id ON project_comments(parent_comment_id);

-- Index on user_id for filtering comments by author
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);

-- Index on created_at DESC for chronological ordering
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON project_comments(created_at DESC);

-- Index on comment_id for attachments
CREATE INDEX IF NOT EXISTS idx_project_comment_attachments_comment_id ON project_comment_attachments(comment_id);

