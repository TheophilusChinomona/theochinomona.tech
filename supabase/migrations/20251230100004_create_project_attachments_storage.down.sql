-- Down migration for project-attachments storage bucket
-- Note: Storage bucket deletion must be done via Supabase Dashboard

-- Manual cleanup required:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Delete all files in 'project-attachments' bucket
-- 3. Delete the 'project-attachments' bucket
-- 4. Remove RLS policies if applied manually


