/**
 * Tests for project attachments database helper functions
 * These tests verify database operations for the project_attachments table
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAttachmentsByProjectId,
  getAttachmentsByPhaseId,
  getAttachmentsByTaskId,
  getAttachmentById,
  createAttachment,
  deleteAttachment,
  countAttachmentsByPhaseId,
  countAttachmentsByTaskId,
  type CreateAttachmentInput,
} from './attachments'
import type { ProjectAttachment } from './tracking'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Attachments Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAttachmentsByProjectId', () => {
    it('should return all attachments for a project', async () => {
      const mockAttachments: ProjectAttachment[] = [
        {
          id: 'att-1',
          project_id: 'proj-123',
          phase_id: 'phase-1',
          task_id: null,
          file_url: 'https://example.com/image1.jpg',
          file_type: 'image',
          file_name: 'image1.jpg',
          created_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'att-2',
          project_id: 'proj-123',
          phase_id: null,
          task_id: 'task-1',
          file_url: 'https://example.com/doc.pdf',
          file_type: 'pdf',
          file_name: 'document.pdf',
          created_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockAttachments, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getAttachmentsByProjectId('proj-123')

      expect(result).toHaveLength(2)
      expect(result[0].file_type).toBe('image')
      expect(result[1].file_type).toBe('pdf')
    })
  })

  describe('getAttachmentsByPhaseId', () => {
    it('should return attachments for a specific phase', async () => {
      const mockAttachments: ProjectAttachment[] = [
        {
          id: 'att-1',
          project_id: 'proj-123',
          phase_id: 'phase-1',
          task_id: null,
          file_url: 'https://example.com/image1.jpg',
          file_type: 'image',
          file_name: 'image1.jpg',
          created_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockAttachments, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getAttachmentsByPhaseId('phase-1')

      expect(result).toHaveLength(1)
      expect(result[0].phase_id).toBe('phase-1')
    })
  })

  describe('getAttachmentsByTaskId', () => {
    it('should return attachments for a specific task', async () => {
      const mockAttachments: ProjectAttachment[] = [
        {
          id: 'att-2',
          project_id: 'proj-123',
          phase_id: null,
          task_id: 'task-1',
          file_url: 'https://example.com/doc.pdf',
          file_type: 'pdf',
          file_name: 'document.pdf',
          created_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockAttachments, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getAttachmentsByTaskId('task-1')

      expect(result).toHaveLength(1)
      expect(result[0].task_id).toBe('task-1')
    })
  })

  describe('getAttachmentById', () => {
    it('should return single attachment by ID', async () => {
      const mockAttachment: ProjectAttachment = {
        id: 'att-1',
        project_id: 'proj-123',
        phase_id: 'phase-1',
        task_id: null,
        file_url: 'https://example.com/image1.jpg',
        file_type: 'image',
        file_name: 'image1.jpg',
        created_at: '2025-12-30T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockAttachment, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await getAttachmentById('att-1')

      expect(result).toEqual(mockAttachment)
    })

    it('should return null when attachment does not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await getAttachmentById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createAttachment', () => {
    it('should create image attachment correctly', async () => {
      const mockCreatedAttachment: ProjectAttachment = {
        id: 'att-new',
        project_id: 'proj-123',
        phase_id: 'phase-1',
        task_id: null,
        file_url: 'https://example.com/new-image.jpg',
        file_type: 'image',
        file_name: 'new-image.jpg',
        created_at: '2025-12-30T00:00:00Z',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedAttachment, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const input: CreateAttachmentInput = {
        project_id: 'proj-123',
        phase_id: 'phase-1',
        file_url: 'https://example.com/new-image.jpg',
        file_type: 'image',
        file_name: 'new-image.jpg',
      }

      const result = await createAttachment(input)

      expect(result.file_type).toBe('image')
      expect(result.file_name).toBe('new-image.jpg')
    })

    it('should create PDF attachment correctly', async () => {
      const mockCreatedAttachment: ProjectAttachment = {
        id: 'att-new',
        project_id: 'proj-123',
        phase_id: null,
        task_id: 'task-1',
        file_url: 'https://example.com/doc.pdf',
        file_type: 'pdf',
        file_name: 'document.pdf',
        created_at: '2025-12-30T00:00:00Z',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedAttachment, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const input: CreateAttachmentInput = {
        project_id: 'proj-123',
        task_id: 'task-1',
        file_url: 'https://example.com/doc.pdf',
        file_type: 'pdf',
        file_name: 'document.pdf',
      }

      const result = await createAttachment(input)

      expect(result.file_type).toBe('pdf')
    })

    it('should create video_embed attachment correctly', async () => {
      const mockCreatedAttachment: ProjectAttachment = {
        id: 'att-new',
        project_id: 'proj-123',
        phase_id: 'phase-1',
        task_id: null,
        file_url: 'https://www.youtube.com/embed/abc123',
        file_type: 'video_embed',
        file_name: 'Project Demo Video',
        created_at: '2025-12-30T00:00:00Z',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedAttachment, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const input: CreateAttachmentInput = {
        project_id: 'proj-123',
        phase_id: 'phase-1',
        file_url: 'https://www.youtube.com/embed/abc123',
        file_type: 'video_embed',
        file_name: 'Project Demo Video',
      }

      const result = await createAttachment(input)

      expect(result.file_type).toBe('video_embed')
    })

    it('should throw error when project_id is missing', async () => {
      const input = {
        file_url: 'https://example.com/image.jpg',
        file_type: 'image',
        file_name: 'image.jpg',
      } as CreateAttachmentInput

      await expect(createAttachment(input)).rejects.toThrow('Project ID is required')
    })

    it('should throw error when file_url is empty', async () => {
      const input: CreateAttachmentInput = {
        project_id: 'proj-123',
        file_url: '',
        file_type: 'image',
        file_name: 'image.jpg',
      }

      await expect(createAttachment(input)).rejects.toThrow('File URL is required')
    })

    it('should throw error when file_type is missing', async () => {
      const input = {
        project_id: 'proj-123',
        file_url: 'https://example.com/image.jpg',
        file_name: 'image.jpg',
      } as CreateAttachmentInput

      await expect(createAttachment(input)).rejects.toThrow('File type is required')
    })

    it('should throw error when file_name is empty', async () => {
      const input: CreateAttachmentInput = {
        project_id: 'proj-123',
        file_url: 'https://example.com/image.jpg',
        file_type: 'image',
        file_name: '',
      }

      await expect(createAttachment(input)).rejects.toThrow('File name is required')
    })

    it('should throw error for invalid file type', async () => {
      const input = {
        project_id: 'proj-123',
        file_url: 'https://example.com/file.zip',
        file_type: 'archive' as any,
        file_name: 'file.zip',
      }

      await expect(createAttachment(input)).rejects.toThrow('Invalid file type')
    })
  })

  describe('deleteAttachment', () => {
    it('should delete attachment successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deleteAttachment('att-1')).resolves.not.toThrow()
    })

    it('should throw error when attachment not found', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deleteAttachment('non-existent')).rejects.toThrow('Attachment not found')
    })
  })

  describe('countAttachmentsByPhaseId', () => {
    it('should return count of attachments for phase', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ count: 5, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })

      const result = await countAttachmentsByPhaseId('phase-1')

      expect(result).toBe(5)
    })

    it('should return 0 when no attachments exist', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ count: 0, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })

      const result = await countAttachmentsByPhaseId('phase-empty')

      expect(result).toBe(0)
    })
  })

  describe('countAttachmentsByTaskId', () => {
    it('should return count of attachments for task', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ count: 3, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })

      const result = await countAttachmentsByTaskId('task-1')

      expect(result).toBe(3)
    })
  })
})

