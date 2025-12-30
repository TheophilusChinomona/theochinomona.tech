-- Create storage bucket for project thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-thumbnails',
  'project-thumbnails',
  true, -- Public bucket for read access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can read project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update project thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project thumbnails" ON storage.objects;

-- RLS Policy: Public can read project thumbnails
CREATE POLICY "Public can read project thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-thumbnails');

-- RLS Policy: Admins can upload project thumbnails
CREATE POLICY "Admins can upload project thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Admins can update project thumbnails
CREATE POLICY "Admins can update project thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policy: Admins can delete project thumbnails
CREATE POLICY "Admins can delete project thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);

