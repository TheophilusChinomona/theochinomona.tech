# Supabase Storage Setup for Project Thumbnails

## Overview

This document describes how to set up Supabase Storage for project thumbnail images.

## Supabase Storage Availability

**Supabase Storage is available on the free plan** with the following limits:
- 1 GB storage space
- 2 GB bandwidth per month
- File size limit: 50 MB per file

For production use with higher limits, consider upgrading to a paid plan.

## Setup Status

✅ **Storage bucket and RLS policies have been created via migration**

The bucket `project-thumbnails` and all required RLS policies have been set up using Supabase MCP. The migration file is: `supabase/migrations/20251230091352_create_project_thumbnails_storage.sql`

### Bucket Configuration

- **Name**: `project-thumbnails`
- **Public**: ✅ Enabled (public read access)
- **File size limit**: 5 MB (5,242,880 bytes)
- **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

### RLS Policies Created

1. **Public can read project thumbnails** - Allows SELECT for all files in the bucket
2. **Admins can upload project thumbnails** - Allows INSERT for admin users only
3. **Admins can update project thumbnails** - Allows UPDATE for admin users only
4. **Admins can delete project thumbnails** - Allows DELETE for admin users only

## Manual Setup (Alternative Method)

If you need to recreate the bucket manually, follow these steps:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `project-thumbnails`
   - **Public bucket**: ✅ Enable (check this box)
   - **File size limit**: 5 MB (recommended)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### 2. Configure Storage RLS Policies

After creating the bucket, configure Row Level Security policies via SQL Editor or Dashboard:

#### Policy 1: Public Read Access
```sql
-- Allow public to read all files in the bucket
CREATE POLICY "Public can read project thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-thumbnails');
```

#### Policy 2: Admin Upload Access
```sql
-- Allow admins to upload files
CREATE POLICY "Admins can upload project thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);
```

#### Policy 3: Admin Update Access
```sql
-- Allow admins to update files
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
```

#### Policy 4: Admin Delete Access
```sql
-- Allow admins to delete files
CREATE POLICY "Admins can delete project thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-thumbnails' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
);
```

### 3. Apply Policies via Supabase Dashboard

Alternatively, you can create these policies via the Supabase Dashboard:

1. Go to **Storage** > **Policies** in your Supabase Dashboard
2. Select the `project-thumbnails` bucket
3. Click **New Policy** for each policy above
4. Use the SQL editor to paste each policy SQL

## Verification

After setup, you can verify the bucket is accessible by:

1. Using the `checkStorageAvailability()` function in `src/lib/storage.ts`
2. Testing an upload via the admin interface
3. Checking the Storage section in Supabase Dashboard

## Fallback Option

If Supabase Storage is not available or you prefer external URLs:

- The project form supports direct URL input for thumbnails
- Simply leave the file upload field empty and provide a URL instead
- The `uploadProjectThumbnail()` function will only be called when a file is selected

## File Organization

Files are organized in the bucket as:
```
project-thumbnails/
  └── thumbnails/
      ├── {projectId}-{timestamp}-{originalName}.jpg
      ├── {projectId}-{timestamp}-{originalName}.png
      └── ...
```

This structure keeps all thumbnails organized and makes cleanup easier.

