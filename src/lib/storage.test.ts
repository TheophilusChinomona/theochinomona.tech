/**
 * Tests for storage helper functions
 * These tests verify image upload and storage functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  uploadProjectThumbnail,
  deleteProjectThumbnail,
  checkStorageAvailability,
} from './storage'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

describe('Storage Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadProjectThumbnail', () => {
    it('should upload file to storage bucket and return public URL', async () => {
      const mockFile = new File(['image content'], 'test-image.jpg', {
        type: 'image/jpeg',
      })
      const projectId = '123e4567-e89b-12d3-a456-426614174000'
      const expectedPath = 'thumbnails/123e4567-e89b-12d3-a456-426614174000-1234567890-test-image.jpg'
      const expectedPublicUrl = 'https://example.supabase.co/storage/v1/object/public/project-thumbnails/thumbnails/test.jpg'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: expectedPath },
        error: null,
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: expectedPublicUrl },
      })

      const mockStorageFrom = {
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      const result = await uploadProjectThumbnail(mockFile, projectId)

      expect(result).toBe(expectedPublicUrl)
      expect(supabase.storage.from).toHaveBeenCalledWith('project-thumbnails')
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('thumbnails/'),
        mockFile,
        expect.objectContaining({
          cacheControl: '3600',
          upsert: false,
        })
      )
    })

    it('should throw error for invalid file type', async () => {
      const mockFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const projectId = '123e4567-e89b-12d3-a456-426614174000'

      await expect(uploadProjectThumbnail(mockFile, projectId)).rejects.toThrow(
        'Invalid file type'
      )
    })

    it('should throw error for file exceeding size limit', async () => {
      // Create a file larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('')
      const mockFile = new File([largeContent], 'large-image.jpg', {
        type: 'image/jpeg',
      })
      const projectId = '123e4567-e89b-12d3-a456-426614174000'

      await expect(uploadProjectThumbnail(mockFile, projectId)).rejects.toThrow(
        'File size exceeds maximum'
      )
    })

    it('should throw error when upload fails', async () => {
      const mockFile = new File(['image content'], 'test-image.jpg', {
        type: 'image/jpeg',
      })
      const projectId = '123e4567-e89b-12d3-a456-426614174000'

      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      })

      const mockStorageFrom = {
        upload: mockUpload,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      await expect(uploadProjectThumbnail(mockFile, projectId)).rejects.toThrow(
        'Failed to upload image'
      )
    })

    it('should throw error when public URL cannot be retrieved', async () => {
      const mockFile = new File(['image content'], 'test-image.jpg', {
        type: 'image/jpeg',
      })
      const projectId = '123e4567-e89b-12d3-a456-426614174000'

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'thumbnails/test.jpg' },
        error: null,
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: null },
      })

      const mockStorageFrom = {
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      await expect(uploadProjectThumbnail(mockFile, projectId)).rejects.toThrow(
        'Failed to get public URL'
      )
    })
  })

  describe('deleteProjectThumbnail', () => {
    it('should delete file from storage bucket', async () => {
      const fileUrl =
        'https://example.supabase.co/storage/v1/object/public/project-thumbnails/thumbnails/test.jpg'

      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      const mockStorageFrom = {
        remove: mockRemove,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      await deleteProjectThumbnail(fileUrl)

      expect(supabase.storage.from).toHaveBeenCalledWith('project-thumbnails')
      expect(mockRemove).toHaveBeenCalledWith(['thumbnails/test.jpg'])
    })

    it('should throw error for invalid URL format', async () => {
      const invalidUrl = 'https://example.com/invalid-url'

      await expect(deleteProjectThumbnail(invalidUrl)).rejects.toThrow(
        'Invalid file URL format'
      )
    })

    it('should throw error when deletion fails', async () => {
      const fileUrl =
        'https://example.supabase.co/storage/v1/object/public/project-thumbnails/thumbnails/test.jpg'

      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' },
      })

      const mockStorageFrom = {
        remove: mockRemove,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      await expect(deleteProjectThumbnail(fileUrl)).rejects.toThrow(
        'Failed to delete image'
      )
    })
  })

  describe('checkStorageAvailability', () => {
    it('should return true when bucket is accessible', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      const mockStorageFrom = {
        list: mockList,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      const result = await checkStorageAvailability()

      expect(result).toBe(true)
      expect(supabase.storage.from).toHaveBeenCalledWith('project-thumbnails')
    })

    it('should return false when bucket is not accessible', async () => {
      const mockList = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      })

      const mockStorageFrom = {
        list: mockList,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      const result = await checkStorageAvailability()

      expect(result).toBe(false)
    })

    it('should return false when list operation throws error', async () => {
      const mockList = vi.fn().mockRejectedValue(new Error('Network error'))

      const mockStorageFrom = {
        list: mockList,
      }

      vi.mocked(supabase.storage.from).mockReturnValue(mockStorageFrom as any)

      const result = await checkStorageAvailability()

      expect(result).toBe(false)
    })
  })
})

