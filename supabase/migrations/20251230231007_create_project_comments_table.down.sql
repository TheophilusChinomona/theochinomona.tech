-- Rollback: Drop project_comments table
-- Task Group 3: Project Comments/Threads Schema

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON project_comments;
DROP TABLE IF EXISTS project_comments;

