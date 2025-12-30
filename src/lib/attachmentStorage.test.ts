/**
 * Tests for attachment storage helper functions
 * These tests verify file upload, validation, and video embed URL handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateAttachmentFile,
  detectAttachmentType,
  uploadAttachment,
  deleteAttachment,
  checkAttachmentStorageAvailability,
  isValidVideoEmbedUrl,
  getVideoEmbedUrl,
} from './attachmentStorage'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

// Helper to create mock File objects
function createMockFile(
  name: string,
  type: string,
  size: number = 1024
): File {
  const blob = new Blob([''], { type })
  Object.defineProperty(blob, 'name', { value: name })
  Object.defineProperty(blob, 'size', { value: size })
  return blob as File
}

describe('Attachment Storage Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // File Validation Tests
  // ============================================================================

  describe('validateAttachmentFile', () => {
    describe('image validation', () => {
      it('should accept valid JPEG image', () => {
        const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'image')).not.toThrow()
      })

      it('should accept valid PNG image', () => {
        const file = createMockFile('test.png', 'image/png', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'image')).not.toThrow()
      })

      it('should accept valid WebP image', () => {
        const file = createMockFile('test.webp', 'image/webp', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'image')).not.toThrow()
      })

      it('should accept valid GIF image', () => {
        const file = createMockFile('test.gif', 'image/gif', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'image')).not.toThrow()
      })

      it('should reject invalid image type', () => {
        const file = createMockFile('test.bmp', 'image/bmp', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'image')).toThrow('Invalid image type')
      })

      it('should reject file exceeding 5MB size limit', () => {
        const file = createMockFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024)

        expect(() => validateAttachmentFile(file, 'image')).toThrow('File size exceeds maximum')
      })
    })

    describe('PDF validation', () => {
      it('should accept valid PDF file', () => {
        const file = createMockFile('doc.pdf', 'application/pdf', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'pdf')).not.toThrow()
      })

      it('should reject non-PDF file when pdf type expected', () => {
        const file = createMockFile('doc.doc', 'application/msword', 1024 * 100)

        expect(() => validateAttachmentFile(file, 'pdf')).toThrow('Only PDF files are allowed')
      })

      it('should reject PDF file exceeding 5MB size limit', () => {
        const file = createMockFile('large.pdf', 'application/pdf', 6 * 1024 * 1024)

        expect(() => validateAttachmentFile(file, 'pdf')).toThrow('File size exceeds maximum')
      })
    })

    it('should throw error for invalid attachment type', () => {
      const file = createMockFile('test.zip', 'application/zip', 1024)

      expect(() => validateAttachmentFile(file, 'archive' as any)).toThrow(
        'Invalid attachment type'
      )
    })
  })

  describe('detectAttachmentType', () => {
    it('should detect JPEG image', () => {
      const file = createMockFile('test.jpg', 'image/jpeg')

      expect(detectAttachmentType(file)).toBe('image')
    })

    it('should detect PNG image', () => {
      const file = createMockFile('test.png', 'image/png')

      expect(detectAttachmentType(file)).toBe('image')
    })

    it('should detect WebP image', () => {
      const file = createMockFile('test.webp', 'image/webp')

      expect(detectAttachmentType(file)).toBe('image')
    })

    it('should detect GIF image', () => {
      const file = createMockFile('test.gif', 'image/gif')

      expect(detectAttachmentType(file)).toBe('image')
    })

    it('should detect PDF file', () => {
      const file = createMockFile('doc.pdf', 'application/pdf')

      expect(detectAttachmentType(file)).toBe('pdf')
    })

    it('should return null for unsupported type', () => {
      const file = createMockFile('archive.zip', 'application/zip')

      expect(detectAttachmentType(file)).toBeNull()
    })
  })

  // ============================================================================
  // Upload/Delete Tests
  // ============================================================================

  describe('uploadAttachment', () => {
    it('should upload image and return public URL', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 100)
      const mockPublicUrl = 'https://example.supabase.co/storage/v1/object/public/project-attachments/images/proj-123-test.jpg'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'images/proj-123-test.jpg' },
        error: null,
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      })

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any)

      const result = await uploadAttachment(file, 'proj-123', 'image')

      expect(result).toBe(mockPublicUrl)
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('images/'),
        file,
        expect.objectContaining({
          cacheControl: '3600',
          upsert: false,
        })
      )
    })

    it('should upload PDF and return public URL', async () => {
      const file = createMockFile('doc.pdf', 'application/pdf', 1024 * 100)
      const mockPublicUrl = 'https://example.supabase.co/storage/v1/object/public/project-attachments/pdfs/proj-123-doc.pdf'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'pdfs/proj-123-doc.pdf' },
        error: null,
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: mockPublicUrl },
      })

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      } as any)

      const result = await uploadAttachment(file, 'proj-123', 'pdf')

      expect(result).toBe(mockPublicUrl)
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('pdfs/'),
        file,
        expect.any(Object)
      )
    })

    it('should throw error on upload failure', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 100)

      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      })

      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any)

      await expect(uploadAttachment(file, 'proj-123', 'image')).rejects.toThrow(
        'Failed to upload image'
      )
    })

    it('should throw error when file validation fails', async () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024)

      await expect(uploadAttachment(file, 'proj-123', 'image')).rejects.toThrow(
        'File size exceeds maximum'
      )
    })
  })

  describe('deleteAttachment', () => {
    it('should delete file from storage', async () => {
      const fileUrl = 'https://example.supabase.co/storage/v1/object/public/project-attachments/images/test.jpg'

      const mockRemove = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any)

      await deleteAttachment(fileUrl)

      expect(mockRemove).toHaveBeenCalledWith(['images/test.jpg'])
    })

    it('should throw error for invalid URL format', async () => {
      const invalidUrl = 'https://example.com/some-file.jpg'

      await expect(deleteAttachment(invalidUrl)).rejects.toThrow('Invalid file URL format')
    })

    it('should throw error on deletion failure', async () => {
      const fileUrl = 'https://example.supabase.co/storage/v1/object/public/project-attachments/images/test.jpg'

      const mockRemove = vi.fn().mockResolvedValue({
        error: { message: 'Deletion failed' },
      })

      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any)

      await expect(deleteAttachment(fileUrl)).rejects.toThrow('Failed to delete attachment')
    })
  })

  describe('checkAttachmentStorageAvailability', () => {
    it('should return true when bucket is accessible', async () => {
      const mockList = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.storage.from).mockReturnValue({
        list: mockList,
      } as any)

      const result = await checkAttachmentStorageAvailability()

      expect(result).toBe(true)
    })

    it('should return false when bucket is not accessible', async () => {
      const mockList = vi.fn().mockResolvedValue({
        error: { message: 'Bucket not found' },
      })

      vi.mocked(supabase.storage.from).mockReturnValue({
        list: mockList,
      } as any)

      const result = await checkAttachmentStorageAvailability()

      expect(result).toBe(false)
    })
  })

  // ============================================================================
  // Video Embed URL Tests
  // ============================================================================

  describe('isValidVideoEmbedUrl', () => {
    it('should return true for youtube.com URL', () => {
      expect(isValidVideoEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
      expect(isValidVideoEmbedUrl('https://youtube.com/watch?v=abc123')).toBe(true)
    })

    it('should return true for youtu.be short URL', () => {
      expect(isValidVideoEmbedUrl('https://youtu.be/abc123')).toBe(true)
    })

    it('should return true for youtube-nocookie.com URL', () => {
      expect(isValidVideoEmbedUrl('https://www.youtube-nocookie.com/embed/abc123')).toBe(true)
    })

    it('should return true for vimeo.com URL', () => {
      expect(isValidVideoEmbedUrl('https://vimeo.com/123456789')).toBe(true)
      expect(isValidVideoEmbedUrl('https://www.vimeo.com/123456789')).toBe(true)
    })

    it('should return true for player.vimeo.com URL', () => {
      expect(isValidVideoEmbedUrl('https://player.vimeo.com/video/123456789')).toBe(true)
    })

    it('should return false for invalid URL', () => {
      expect(isValidVideoEmbedUrl('not-a-url')).toBe(false)
    })

    it('should return false for non-video URL', () => {
      expect(isValidVideoEmbedUrl('https://example.com/video')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidVideoEmbedUrl('')).toBe(false)
    })
  })

  describe('getVideoEmbedUrl', () => {
    it('should convert youtube.com URL to embed URL', () => {
      const url = 'https://www.youtube.com/watch?v=abc123'
      const embedUrl = getVideoEmbedUrl(url)

      expect(embedUrl).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should convert youtu.be URL to embed URL', () => {
      const url = 'https://youtu.be/abc123'
      const embedUrl = getVideoEmbedUrl(url)

      expect(embedUrl).toBe('https://www.youtube.com/embed/abc123')
    })

    it('should convert vimeo.com URL to embed URL', () => {
      const url = 'https://vimeo.com/123456789'
      const embedUrl = getVideoEmbedUrl(url)

      expect(embedUrl).toBe('https://player.vimeo.com/video/123456789')
    })

    it('should return player.vimeo.com URL unchanged', () => {
      const url = 'https://player.vimeo.com/video/123456789'
      const embedUrl = getVideoEmbedUrl(url)

      expect(embedUrl).toBe(url)
    })

    it('should return null for invalid URL', () => {
      expect(getVideoEmbedUrl('not-a-url')).toBeNull()
    })

    it('should return null for non-video URL', () => {
      expect(getVideoEmbedUrl('https://example.com/video')).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(getVideoEmbedUrl('')).toBeNull()
    })

    it('should return null for Vimeo URL without video ID', () => {
      expect(getVideoEmbedUrl('https://vimeo.com/about')).toBeNull()
    })
  })
})

