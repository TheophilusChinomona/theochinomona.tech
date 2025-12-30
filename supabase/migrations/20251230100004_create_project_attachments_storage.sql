-- Create project-attachments storage bucket
-- This migration creates the storage bucket for project phase/task attachments

-- Note: Storage bucket creation must be done via Supabase Dashboard or CLI
-- This file documents the required configuration

-- Bucket Configuration:
-- Name: project-attachments
-- Public: Yes (for read access)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, application/pdf

-- The following RLS policies should be applied to the bucket:

-- Policy 1: Allow public read access
-- CREATE POLICY "Public can read project attachments"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'project-attachments');

-- Policy 2: Allow authenticated admins to upload
-- CREATE POLICY "Admins can upload project attachments"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'project-attachments' AND
--   EXISTS (
--     SELECT 1 FROM users
--     WHERE auth_user_id = auth.uid() AND role = 'admin'
--   )
-- );

-- Policy 3: Allow authenticated admins to update
-- CREATE POLICY "Admins can update project attachments"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'project-attachments' AND
--   EXISTS (
--     SELECT 1 FROM users
--     WHERE auth_user_id = auth.uid() AND role = 'admin'
--   )
-- );

-- Policy 4: Allow authenticated admins to delete
-- CREATE POLICY "Admins can delete project attachments"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'project-attachments' AND
--   EXISTS (
--     SELECT 1 FROM users
--     WHERE auth_user_id = auth.uid() AND role = 'admin'
--   )
-- );

-- Manual Setup Required:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket named 'project-attachments'
-- 3. Set bucket to public
-- 4. Apply the RLS policies above via SQL Editor

-- Folder structure within bucket:
-- project-attachments/
--   ├── images/     (for jpg, png, gif, webp files)
--   └── pdfs/       (for pdf files)


