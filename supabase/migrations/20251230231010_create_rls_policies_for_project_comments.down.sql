-- Rollback: Drop RLS policies
-- Task Group 3: Project Comments/Threads Schema

DROP POLICY IF EXISTS "Clients can view comments for their projects" ON project_comments;
DROP POLICY IF EXISTS "Clients can create comments for their projects" ON project_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON project_comments;
DROP POLICY IF EXISTS "Service role full access on project_comments" ON project_comments;

DROP POLICY IF EXISTS "Clients can view attachments for their project comments" ON project_comment_attachments;
DROP POLICY IF EXISTS "Clients can create attachments for their project comments" ON project_comment_attachments;
DROP POLICY IF EXISTS "Admins can manage all comment attachments" ON project_comment_attachments;
DROP POLICY IF EXISTS "Service role full access on project_comment_attachments" ON project_comment_attachments;

