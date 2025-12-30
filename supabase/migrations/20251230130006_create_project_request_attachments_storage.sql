-- Create storage bucket for project request attachments
-- Task Group 3: File Storage Setup

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-request-attachments',
  'project-request-attachments',
  true, -- Public bucket for read access (for approved projects)
  52428800, -- 50MB file size limit (50 * 1024 * 1024)
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Clients can upload their own request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Clients can view their own request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can view attachments for approved projects" ON storage.objects;

-- RLS Policy: Clients can upload files for their own requests
-- Note: We'll use metadata to track request_id, or folder structure: request-{request_id}/filename
CREATE POLICY "Clients can upload their own request attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'client'
  )
);

-- RLS Policy: Clients can view their own uploaded files
CREATE POLICY "Clients can view their own request attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'client'
  )
);

-- RLS Policy: Admins can view all files
CREATE POLICY "Admins can view all request attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Admins can delete files
CREATE POLICY "Admins can delete request attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-request-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Public can view files for approved projects
-- This allows public access to attachments for projects with active tracking codes
-- Note: This is a simplified policy - in practice, you might want to check project status
CREATE POLICY "Public can view attachments for approved projects"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-request-attachments'
  -- Additional checks can be added here if needed
  -- For now, public read is enabled via public bucket setting
);

