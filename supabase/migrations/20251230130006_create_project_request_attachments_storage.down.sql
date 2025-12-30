-- Rollback: Remove project request attachments storage bucket policies

-- Drop policies
DROP POLICY IF EXISTS "Public can view attachments for approved projects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Clients can view their own request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Clients can upload their own request attachments" ON storage.objects;

-- Note: Bucket deletion should be done manually via Supabase Dashboard
-- DELETE FROM storage.buckets WHERE id = 'project-request-attachments';

