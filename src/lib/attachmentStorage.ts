/**
 * Storage helper functions for project attachments
 * Handles image and PDF uploads for project phases and tasks
 */

import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'project-attachments'

export type AttachmentFileType = 'image' | 'pdf'

const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

const VALID_PDF_TYPES = ['application/pdf']

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Validates that a file is a valid image type
 */
function validateImageFile(file: File): void {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid image type. Allowed types: ${VALID_IMAGE_TYPES.join(', ')}`
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }
}

/**
 * Validates that a file is a valid PDF type
 */
function validatePdfFile(file: File): void {
  if (!VALID_PDF_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only PDF files are allowed.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }
}

/**
 * Validates a file based on its expected type
 */
export function validateAttachmentFile(
  file: File,
  type: AttachmentFileType
): void {
  if (type === 'image') {
    validateImageFile(file)
  } else if (type === 'pdf') {
    validatePdfFile(file)
  } else {
    throw new Error(`Invalid attachment type: ${type}`)
  }
}

/**
 * Detects the attachment type from a file
 */
export function detectAttachmentType(file: File): AttachmentFileType | null {
  if (VALID_IMAGE_TYPES.includes(file.type)) {
    return 'image'
  }
  if (VALID_PDF_TYPES.includes(file.type)) {
    return 'pdf'
  }
  return null
}

/**
 * Generates a unique filename for the uploaded attachment
 */
function generateAttachmentFileName(
  projectId: string,
  originalName: string,
  type: AttachmentFileType
): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop() || (type === 'pdf' ? 'pdf' : 'jpg')
  // Sanitize filename: remove special chars, keep only alphanumeric, dots, and hyphens
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50)
  return `${projectId}-${timestamp}-${baseName}.${extension}`
}

/**
 * Upload a project attachment to Supabase Storage
 *
 * @param file - The file to upload (image or PDF)
 * @param projectId - The ID of the project
 * @param type - The type of attachment ('image' or 'pdf')
 * @returns The public URL of the uploaded file
 * @throws Error if upload fails or file validation fails
 *
 * Note: This function requires:
 * 1. Supabase Storage bucket named 'project-attachments' to be created
 * 2. Bucket to be configured as public for read access
 * 3. RLS policies configured for admin upload access
 */
export async function uploadAttachment(
  file: File,
  projectId: string,
  type: AttachmentFileType
): Promise<string> {
  // Validate file
  validateAttachmentFile(file, type)

  // Generate unique filename
  const fileName = generateAttachmentFileName(projectId, file.name, type)
  const folder = type === 'image' ? 'images' : 'pdfs'
  const filePath = `${folder}/${fileName}`

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    throw new Error(`Failed to upload ${type}: ${error.message}`)
  }

  if (!data) {
    throw new Error('Upload succeeded but no data returned')
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded file')
  }

  return urlData.publicUrl
}

/**
 * Delete an attachment from Supabase Storage
 *
 * @param fileUrl - The public URL of the file to delete
 * @returns void
 * @throws Error if deletion fails
 */
export async function deleteAttachment(fileUrl: string): Promise<void> {
  // Extract file path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/project-attachments/images/filename.jpg
  const urlParts = fileUrl.split('/')
  const bucketIndex = urlParts.findIndex((part) => part === BUCKET_NAME)

  if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
    throw new Error('Invalid file URL format')
  }

  // Reconstruct path (everything after bucket name)
  const filePath = urlParts.slice(bucketIndex + 1).join('/')

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    throw new Error(`Failed to delete attachment: ${error.message}`)
  }
}

/**
 * Check if the project-attachments bucket exists and is accessible
 *
 * @returns true if bucket is accessible, false otherwise
 */
export async function checkAttachmentStorageAvailability(): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).list('', {
      limit: 1,
    })

    // If we can list (even if empty), bucket exists and is accessible
    return !error
  } catch {
    return false
  }
}

/**
 * Validates a YouTube or Vimeo embed URL
 *
 * @param url - The URL to validate
 * @returns true if valid YouTube/Vimeo URL, false otherwise
 */
export function isValidVideoEmbedUrl(url: string): boolean {
  if (!url) return false

  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()

    // YouTube patterns
    if (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'www.youtube-nocookie.com'
    ) {
      return true
    }

    // Vimeo patterns
    if (
      hostname === 'vimeo.com' ||
      hostname === 'www.vimeo.com' ||
      hostname === 'player.vimeo.com'
    ) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Extracts video ID and generates embed URL from YouTube/Vimeo links
 *
 * @param url - The original video URL
 * @returns The embed-ready URL or null if invalid
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()

    // YouTube patterns
    if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
      const videoId = parsedUrl.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1)
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Vimeo patterns
    if (hostname === 'vimeo.com' || hostname === 'www.vimeo.com') {
      const videoId = parsedUrl.pathname.split('/').pop()
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }

    if (hostname === 'player.vimeo.com') {
      // Already an embed URL
      return url
    }

    return null
  } catch {
    return null
  }
}


