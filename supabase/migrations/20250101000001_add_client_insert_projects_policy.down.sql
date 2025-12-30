-- Rollback: Remove RLS policy for clients to INSERT projects
DROP POLICY IF EXISTS "Clients can create projects" ON projects;

