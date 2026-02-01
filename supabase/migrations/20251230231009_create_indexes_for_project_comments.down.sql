-- Rollback: Drop indexes
-- Task Group 3: Project Comments/Threads Schema

DROP INDEX IF EXISTS idx_project_comments_project_id;
DROP INDEX IF EXISTS idx_project_comments_parent_comment_id;
DROP INDEX IF EXISTS idx_project_comments_user_id;
DROP INDEX IF EXISTS idx_project_comments_created_at;
DROP INDEX IF EXISTS idx_project_comment_attachments_comment_id;

