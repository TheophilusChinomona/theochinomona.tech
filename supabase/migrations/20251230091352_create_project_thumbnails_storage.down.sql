-- Rollback migration: Drop storage bucket and policies

-- Drop RLS policies
DROP POLICY IF EXISTS "Public can read project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project thumbnails" ON storage.objects;

-- Drop bucket (this will also delete all files in the bucket)
DELETE FROM storage.buckets WHERE id = 'project-thumbnails';

