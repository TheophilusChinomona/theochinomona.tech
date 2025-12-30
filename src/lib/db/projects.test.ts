/**
 * Tests for projects table database helper functions
 * These tests verify database operations for the projects table
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllProjects,
  getPublishedProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bulkDeleteProjects,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
} from './projects'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Projects Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllProjects', () => {
    it('should return all projects from database', async () => {
      const mockProjects: Project[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Project 1',
          description: 'Description 1',
          tech: ['React', 'TypeScript'],
          category: 'Web',
          thumbnail: null,
          client_name: null,
          project_url: null,
          github_url: null,
          completion_date: null,
          featured: false,
          status: 'draft',
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Project 2',
          description: 'Description 2',
          tech: ['Vue', 'JavaScript'],
          category: 'Mobile',
          thumbnail: 'https://example.com/image.jpg',
          client_name: 'Client Name',
          project_url: 'https://example.com',
          github_url: 'https://github.com/example',
          completion_date: '2025-12-01',
          featured: true,
          status: 'published',
          created_at: '2025-12-29T00:00:00Z',
          updated_at: '2025-12-29T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProjects, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAllProjects()

      expect(result).toEqual(mockProjects)
      expect(supabase.from).toHaveBeenCalledWith('projects')
      expect(mockSelect).toHaveBeenCalledWith('*')
    })

    it('should throw error on database error', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'DB_ERROR', message: 'Database error' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      await expect(getAllProjects()).rejects.toThrow()
    })
  })

  describe('getPublishedProjects', () => {
    it('should return only published projects', async () => {
      const mockProjects: Project[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Published Project',
          description: 'Description',
          tech: ['React'],
          category: 'Web',
          thumbnail: null,
          client_name: null,
          project_url: null,
          github_url: null,
          completion_date: null,
          featured: true,
          status: 'published',
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder1 = vi.fn().mockReturnThis()
      const mockOrder2 = vi.fn().mockResolvedValue({ data: mockProjects, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        order: mockOrder1,
      })
      mockOrder1.mockReturnValue({
        order: mockOrder2,
      })

      const result = await getPublishedProjects()

      expect(result).toEqual(mockProjects)
      expect(mockEq).toHaveBeenCalledWith('status', 'published')
    })

    it('should order by featured first, then created_at', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder1 = vi.fn().mockReturnThis()
      const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        order: mockOrder1,
      })
      mockOrder1.mockReturnValue({
        order: mockOrder2,
      })

      await getPublishedProjects()

      expect(mockOrder1).toHaveBeenCalledWith('featured', { ascending: false })
      expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getProjectById', () => {
    it('should return single project by ID', async () => {
      const mockProject: Project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Project',
        description: 'Test description',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await getProjectById('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toEqual(mockProject)
      expect(mockEq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000')
    })

    it('should return null when project does not exist', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await getProjectById('non-existent-id')

      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      await expect(getProjectById('123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow()
    })
  })

  describe('createProject', () => {
    it('should create new project with all fields', async () => {
      const mockProject: Project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Project',
        description: 'New description',
        tech: ['React', 'TypeScript'],
        category: 'Web',
        thumbnail: 'https://example.com/image.jpg',
        client_name: 'Client Name',
        project_url: 'https://example.com',
        github_url: 'https://github.com/example',
        completion_date: '2025-12-01',
        featured: true,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const inputData: CreateProjectInput = {
        title: 'New Project',
        description: 'New description',
        tech: ['React', 'TypeScript'],
        category: 'Web',
        thumbnail: 'https://example.com/image.jpg',
        client_name: 'Client Name',
        project_url: 'https://example.com',
        github_url: 'https://github.com/example',
        completion_date: '2025-12-01',
        featured: true,
        status: 'published',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await createProject(inputData)

      expect(result).toEqual(mockProject)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Project',
          description: 'New description',
          tech: ['React', 'TypeScript'],
          category: 'Web',
        })
      )
    })

    it('should set default values for optional fields', async () => {
      const mockProject: Project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Project',
        description: 'New description',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'draft',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const inputData: CreateProjectInput = {
        title: 'New Project',
        description: 'New description',
        tech: ['React'],
        category: 'Web',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      await createProject(inputData)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: false,
          status: 'draft',
        })
      )
    })

    it('should throw error when required fields are missing', async () => {
      const inputData = {
        title: '',
        description: 'Description',
        tech: ['React'],
        category: 'Web',
      } as CreateProjectInput

      await expect(createProject(inputData)).rejects.toThrow('Title and description are required')
    })

    it('should throw error when tech array is empty', async () => {
      const inputData: CreateProjectInput = {
        title: 'Title',
        description: 'Description',
        tech: [],
        category: 'Web',
      }

      await expect(createProject(inputData)).rejects.toThrow('Tech array must contain at least one item')
    })
  })

  describe('updateProject', () => {
    it('should update project fields correctly', async () => {
      const mockUpdatedProject: Project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Project',
        description: 'Updated description',
        tech: ['Vue', 'TypeScript'],
        category: 'Mobile',
        thumbnail: 'https://example.com/new-image.jpg',
        client_name: 'New Client',
        project_url: 'https://new-example.com',
        github_url: 'https://github.com/new',
        completion_date: '2025-12-15',
        featured: true,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const updates: UpdateProjectInput = {
        title: 'Updated Project',
        description: 'Updated description',
        tech: ['Vue', 'TypeScript'],
        category: 'Mobile',
        featured: true,
        status: 'published',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedProject, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await updateProject('123e4567-e89b-12d3-a456-426614174000', updates)

      expect(result).toEqual(mockUpdatedProject)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Project',
          description: 'Updated description',
        })
      )
    })

    it('should throw error when project not found', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      await expect(
        updateProject('non-existent-id', { title: 'Updated' })
      ).rejects.toThrow('Project not found')
    })

    it('should throw error when tech array is empty', async () => {
      await expect(
        updateProject('123e4567-e89b-12d3-a456-426614174000', { tech: [] })
      ).rejects.toThrow('Tech array must contain at least one item')
    })
  })

  describe('deleteProject', () => {
    it('should delete project and return void', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      await deleteProject('123e4567-e89b-12d3-a456-426614174000')

      expect(supabase.from).toHaveBeenCalledWith('projects')
      expect(mockEq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000')
    })

    it('should handle errors gracefully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      await expect(deleteProject('non-existent-id')).rejects.toThrow('Project not found')
    })
  })

  describe('bulkDeleteProjects', () => {
    it('should delete multiple projects by IDs', async () => {
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '223e4567-e89b-12d3-a456-426614174001',
        '323e4567-e89b-12d3-a456-426614174002',
      ]

      const mockDelete = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        in: mockIn,
      })

      await bulkDeleteProjects(ids)

      expect(supabase.from).toHaveBeenCalledWith('projects')
      expect(mockIn).toHaveBeenCalledWith('id', ids)
    })

    it('should throw error when no IDs provided', async () => {
      await expect(bulkDeleteProjects([])).rejects.toThrow('At least one project ID is required')
    })

    it('should handle database errors gracefully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'DB_ERROR', message: 'Database error' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        in: mockIn,
      })

      await expect(
        bulkDeleteProjects(['123e4567-e89b-12d3-a456-426614174000'])
      ).rejects.toThrow()
    })
  })
})
