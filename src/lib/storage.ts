/**
 * Storage helper functions for Supabase Storage
 * Handles image uploads for project thumbnails
 */

import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'project-thumbnails'

/**
 * Validates that a file is an image
 */
function validateImageFile(file: File): void {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${validTypes.join(', ')}`
    )
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`)
  }
}

/**
 * Generates a unique filename for the uploaded image
 */
function generateFileName(projectId: string, originalName: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || 'jpg'
  // Sanitize filename: remove special chars, keep only alphanumeric, dots, and hyphens
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50)
  return `${projectId}-${timestamp}-${baseName}.${extension}`
}

/**
 * Upload a project thumbnail image to Supabase Storage
 * 
 * @param file - The image file to upload
 * @param projectId - The ID of the project (used in filename generation)
 * @returns The public URL of the uploaded image
 * @throws Error if upload fails or file validation fails
 * 
 * Note: This function requires:
 * 1. Supabase Storage bucket named 'project-thumbnails' to be created
 * 2. Bucket to be configured as public for read access
 * 3. RLS policies configured for admin upload access
 * 
 * To set up the bucket:
 * - Go to Supabase Dashboard > Storage
 * - Create a new bucket named 'project-thumbnails'
 * - Set bucket to public
 * - Configure RLS policies (see documentation)
 */
export async function uploadProjectThumbnail(
  file: File,
  projectId: string
): Promise<string> {
  // Validate file
  validateImageFile(file)

  // Generate unique filename
  const fileName = generateFileName(projectId, file.name)
  const filePath = `thumbnails/${fileName}`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  if (!data) {
    throw new Error('Upload succeeded but no data returned')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image')
  }

  return urlData.publicUrl
}

/**
 * Delete a project thumbnail from Supabase Storage
 * 
 * @param fileUrl - The public URL of the file to delete
 * @returns void
 * @throws Error if deletion fails
 */
export async function deleteProjectThumbnail(fileUrl: string): Promise<void> {
  // Extract file path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/project-thumbnails/thumbnails/filename.jpg
  const urlParts = fileUrl.split('/')
  const fileNameIndex = urlParts.findIndex((part) => part === BUCKET_NAME)
  
  if (fileNameIndex === -1 || fileNameIndex === urlParts.length - 1) {
    throw new Error('Invalid file URL format')
  }

  // Reconstruct path (everything after bucket name)
  const filePath = urlParts.slice(fileNameIndex + 1).join('/')

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

/**
 * Check if Supabase Storage is available and bucket exists
 * 
 * @returns true if bucket is accessible, false otherwise
 */
export async function checkStorageAvailability(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1,
      })

    // If we can list (even if empty), bucket exists and is accessible
    return !error
  } catch {
    return false
  }
}

