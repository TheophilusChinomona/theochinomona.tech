/**
 * Tests for project tasks database helper functions
 * These tests verify database operations for the project_tasks table
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTasksByPhaseId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskOrder,
  updateTaskCompletion,
  completeTask,
  getTasksByPhaseIds,
  type CreateTaskInput,
  type UpdateTaskInput,
} from './tasks'
import type { ProjectTask } from './tracking'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Tasks Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTasksByPhaseId', () => {
    it('should return all tasks for a phase ordered by sort_order', async () => {
      const mockTasks: ProjectTask[] = [
        {
          id: 'task-1',
          phase_id: 'phase-1',
          name: 'Task 1',
          description: 'First task',
          sort_order: 0,
          completion_percentage: 100,
          developer_notes: 'Done',
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'task-2',
          phase_id: 'phase-1',
          name: 'Task 2',
          description: 'Second task',
          sort_order: 1,
          completion_percentage: 50,
          developer_notes: 'In progress',
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockTasks, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getTasksByPhaseId('phase-1')

      expect(result).toHaveLength(2)
      expect(result[0]?.sort_order).toBe(0)
      expect(result[1]?.sort_order).toBe(1)
    })
  })

  describe('getTaskById', () => {
    it('should return single task by ID', async () => {
      const mockTask: ProjectTask = {
        id: 'task-1',
        phase_id: 'phase-1',
        name: 'Task 1',
        description: 'First task',
        sort_order: 0,
        completion_percentage: 50,
        developer_notes: 'In progress',
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockTask, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await getTaskById('task-1')

      expect(result).toEqual(mockTask)
    })

    it('should return null when task does not exist', async () => {
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

      const result = await getTaskById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createTask', () => {
    it('should create task with correct sort_order', async () => {
      const mockCreatedTask: ProjectTask = {
        id: 'task-new',
        phase_id: 'phase-1',
        name: 'New Task',
        description: 'New task description',
        sort_order: 2,
        completion_percentage: 0,
        developer_notes: null,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      // Mock for getting max sort_order
      const mockSelectOrder = vi.fn().mockReturnThis()
      const mockEqOrder = vi.fn().mockReturnThis()
      const mockOrderOrder = vi.fn().mockReturnThis()
      const mockLimitOrder = vi.fn().mockReturnThis()
      const mockSingleOrder = vi.fn().mockResolvedValue({ data: { sort_order: 1 }, error: null })

      // Mock for insert
      const mockInsert = vi.fn().mockReturnThis()
      const mockSelectInsert = vi.fn().mockReturnThis()
      const mockSingleInsert = vi.fn().mockResolvedValue({ data: mockCreatedTask, error: null })

      let callIndex = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callIndex++
        if (callIndex === 1) {
          return {
            select: mockSelectOrder,
          } as any
        }
        return {
          insert: mockInsert,
        } as any
      })

      mockSelectOrder.mockReturnValue({ eq: mockEqOrder })
      mockEqOrder.mockReturnValue({ order: mockOrderOrder })
      mockOrderOrder.mockReturnValue({ limit: mockLimitOrder })
      mockLimitOrder.mockReturnValue({ single: mockSingleOrder })

      mockInsert.mockReturnValue({ select: mockSelectInsert })
      mockSelectInsert.mockReturnValue({ single: mockSingleInsert })

      const input: CreateTaskInput = {
        phase_id: 'phase-1',
        name: 'New Task',
        description: 'New task description',
      }

      const result = await createTask(input)

      expect(result.name).toBe('New Task')
      expect(result.sort_order).toBe(2)
    })

    it('should throw error when phase_id is missing', async () => {
      const input = {
        name: 'New Task',
      } as CreateTaskInput

      await expect(createTask(input)).rejects.toThrow('Phase ID is required')
    })

    it('should throw error when name is empty', async () => {
      const input: CreateTaskInput = {
        phase_id: 'phase-1',
        name: '',
      }

      await expect(createTask(input)).rejects.toThrow('Task name is required')
    })

    it('should throw error when completion_percentage is out of range', async () => {
      const input: CreateTaskInput = {
        phase_id: 'phase-1',
        name: 'New Task',
        completion_percentage: 150,
      }

      await expect(createTask(input)).rejects.toThrow(
        'Completion percentage must be between 0 and 100'
      )
    })

    it('should throw error when completion_percentage is negative', async () => {
      const input: CreateTaskInput = {
        phase_id: 'phase-1',
        name: 'New Task',
        completion_percentage: -10,
      }

      await expect(createTask(input)).rejects.toThrow(
        'Completion percentage must be between 0 and 100'
      )
    })
  })

  describe('updateTask', () => {
    it('should update task fields correctly', async () => {
      const mockUpdatedTask: ProjectTask = {
        id: 'task-1',
        phase_id: 'phase-1',
        name: 'Updated Task Name',
        description: 'Updated description',
        sort_order: 0,
        completion_percentage: 75,
        developer_notes: 'Almost done',
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedTask, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const updates: UpdateTaskInput = {
        name: 'Updated Task Name',
        description: 'Updated description',
        completion_percentage: 75,
        developer_notes: 'Almost done',
      }

      const result = await updateTask('task-1', updates)

      expect(result.name).toBe('Updated Task Name')
      expect(result.completion_percentage).toBe(75)
    })

    it('should throw error when name is empty', async () => {
      await expect(updateTask('task-1', { name: '' })).rejects.toThrow(
        'Task name cannot be empty'
      )
    })

    it('should throw error when completion_percentage is out of range', async () => {
      await expect(updateTask('task-1', { completion_percentage: 200 })).rejects.toThrow(
        'Completion percentage must be between 0 and 100'
      )
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deleteTask('task-1')).resolves.not.toThrow()
    })

    it('should throw error when task not found', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deleteTask('non-existent')).rejects.toThrow('Task not found')
    })
  })

  describe('updateTaskOrder', () => {
    it('should update sort_order for all tasks in list', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })

      const orderedIds = ['task-3', 'task-1', 'task-2']
      await updateTaskOrder('phase-1', orderedIds)

      expect(supabase.from).toHaveBeenCalledTimes(3)
    })

    it('should do nothing when empty array provided', async () => {
      await updateTaskOrder('phase-1', [])

      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('updateTaskCompletion', () => {
    it('should update completion percentage correctly', async () => {
      const mockUpdatedTask: ProjectTask = {
        id: 'task-1',
        phase_id: 'phase-1',
        name: 'Task 1',
        description: 'First task',
        sort_order: 0,
        completion_percentage: 75,
        developer_notes: null,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedTask, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const result = await updateTaskCompletion('task-1', 75)

      expect(result.completion_percentage).toBe(75)
    })

    it('should throw error when percentage is out of range', async () => {
      await expect(updateTaskCompletion('task-1', 150)).rejects.toThrow(
        'Completion percentage must be between 0 and 100'
      )
    })

    it('should throw error when percentage is negative', async () => {
      await expect(updateTaskCompletion('task-1', -10)).rejects.toThrow(
        'Completion percentage must be between 0 and 100'
      )
    })

    it('should round floating point percentages', async () => {
      const mockUpdatedTask: ProjectTask = {
        id: 'task-1',
        phase_id: 'phase-1',
        name: 'Task 1',
        description: null,
        sort_order: 0,
        completion_percentage: 75,
        developer_notes: null,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedTask, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      await updateTaskCompletion('task-1', 75.7)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          completion_percentage: 76, // Rounded
        })
      )
    })
  })

  describe('completeTask', () => {
    it('should set completion to 100%', async () => {
      const mockUpdatedTask: ProjectTask = {
        id: 'task-1',
        phase_id: 'phase-1',
        name: 'Task 1',
        description: null,
        sort_order: 0,
        completion_percentage: 100,
        developer_notes: null,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedTask, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const result = await completeTask('task-1')

      expect(result.completion_percentage).toBe(100)
    })
  })

  describe('getTasksByPhaseIds', () => {
    it('should return tasks for multiple phases', async () => {
      const mockTasks: ProjectTask[] = [
        {
          id: 'task-1',
          phase_id: 'phase-1',
          name: 'Task 1',
          description: null,
          sort_order: 0,
          completion_percentage: 100,
          developer_notes: null,
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'task-2',
          phase_id: 'phase-2',
          name: 'Task 2',
          description: null,
          sort_order: 0,
          completion_percentage: 50,
          developer_notes: null,
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockIn = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockTasks, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ in: mockIn })
      mockIn.mockReturnValue({ order: mockOrder })

      const result = await getTasksByPhaseIds(['phase-1', 'phase-2'])

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no phase IDs provided', async () => {
      const result = await getTasksByPhaseIds([])

      expect(result).toEqual([])
      expect(supabase.from).not.toHaveBeenCalled()
    })
  })
})

