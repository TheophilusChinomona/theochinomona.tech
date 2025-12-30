/**
 * Tests for project phases database helper functions
 * These tests verify database operations for the project_phases table
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPhasesByProjectId,
  getPhaseById,
  createPhase,
  updatePhase,
  deletePhase,
  updatePhaseOrder,
  completePhase,
  startPhase,
  type CreatePhaseInput,
  type UpdatePhaseInput,
} from './phases'
import type { ProjectPhase } from './tracking'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Phases Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPhasesByProjectId', () => {
    it('should return all phases for a project ordered by sort_order', async () => {
      const mockPhases: ProjectPhase[] = [
        {
          id: 'phase-1',
          project_id: 'proj-123',
          name: 'Phase 1',
          description: 'First phase',
          sort_order: 0,
          estimated_start_date: '2025-01-01',
          estimated_end_date: '2025-01-15',
          actual_start_date: null,
          actual_end_date: null,
          status: 'completed',
          notify_on_complete: true,
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'phase-2',
          project_id: 'proj-123',
          name: 'Phase 2',
          description: 'Second phase',
          sort_order: 1,
          estimated_start_date: '2025-01-16',
          estimated_end_date: '2025-01-31',
          actual_start_date: null,
          actual_end_date: null,
          status: 'in_progress',
          notify_on_complete: true,
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockPhases, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getPhasesByProjectId('proj-123')

      expect(result).toHaveLength(2)
      expect(result[0]?.sort_order).toBe(0)
      expect(result[1]?.sort_order).toBe(1)
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true })
    })

    it('should return empty array when project has no phases', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getPhasesByProjectId('proj-empty')

      expect(result).toEqual([])
    })
  })

  describe('getPhaseById', () => {
    it('should return single phase by ID', async () => {
      const mockPhase: ProjectPhase = {
        id: 'phase-1',
        project_id: 'proj-123',
        name: 'Phase 1',
        description: 'First phase',
        sort_order: 0,
        estimated_start_date: '2025-01-01',
        estimated_end_date: '2025-01-15',
        actual_start_date: null,
        actual_end_date: null,
        status: 'pending',
        notify_on_complete: true,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockPhase, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await getPhaseById('phase-1')

      expect(result).toEqual(mockPhase)
    })

    it('should return null when phase does not exist', async () => {
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

      const result = await getPhaseById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createPhase', () => {
    it('should create phase with correct sort_order', async () => {
      const mockCreatedPhase: ProjectPhase = {
        id: 'phase-new',
        project_id: 'proj-123',
        name: 'New Phase',
        description: 'New phase description',
        sort_order: 2,
        estimated_start_date: '2025-02-01',
        estimated_end_date: '2025-02-15',
        actual_start_date: null,
        actual_end_date: null,
        status: 'pending',
        notify_on_complete: true,
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
      const mockSingleInsert = vi.fn().mockResolvedValue({ data: mockCreatedPhase, error: null })

      let callIndex = 0
      vi.mocked(supabase.from).mockImplementation(() => {
        callIndex++
        if (callIndex === 1) {
          // First call for getting max sort_order
          return {
            select: mockSelectOrder,
          } as any
        }
        // Second call for insert
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

      const input: CreatePhaseInput = {
        project_id: 'proj-123',
        name: 'New Phase',
        description: 'New phase description',
        estimated_start_date: '2025-02-01',
        estimated_end_date: '2025-02-15',
      }

      const result = await createPhase(input)

      expect(result.name).toBe('New Phase')
      expect(result.sort_order).toBe(2)
    })

    it('should throw error when project_id is missing', async () => {
      const input = {
        name: 'New Phase',
      } as CreatePhaseInput

      await expect(createPhase(input)).rejects.toThrow('Project ID is required')
    })

    it('should throw error when name is empty', async () => {
      const input: CreatePhaseInput = {
        project_id: 'proj-123',
        name: '',
      }

      await expect(createPhase(input)).rejects.toThrow('Phase name is required')
    })
  })

  describe('updatePhase', () => {
    it('should update phase fields correctly', async () => {
      const mockUpdatedPhase: ProjectPhase = {
        id: 'phase-1',
        project_id: 'proj-123',
        name: 'Updated Phase Name',
        description: 'Updated description',
        sort_order: 0,
        estimated_start_date: '2025-01-01',
        estimated_end_date: '2025-01-15',
        actual_start_date: null,
        actual_end_date: null,
        status: 'in_progress',
        notify_on_complete: false,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedPhase, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const updates: UpdatePhaseInput = {
        name: 'Updated Phase Name',
        description: 'Updated description',
        status: 'in_progress',
        notify_on_complete: false,
      }

      const result = await updatePhase('phase-1', updates)

      expect(result.name).toBe('Updated Phase Name')
      expect(result.status).toBe('in_progress')
      expect(result.notify_on_complete).toBe(false)
    })

    it('should throw error when name is empty', async () => {
      await expect(updatePhase('phase-1', { name: '' })).rejects.toThrow(
        'Phase name cannot be empty'
      )
    })

    it('should throw error when phase not found', async () => {
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
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      await expect(updatePhase('non-existent', { name: 'Test' })).rejects.toThrow('Phase not found')
    })
  })

  describe('deletePhase', () => {
    it('should delete phase successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deletePhase('phase-1')).resolves.not.toThrow()
    })

    it('should throw error when phase not found', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({ eq: mockEq })

      await expect(deletePhase('non-existent')).rejects.toThrow('Phase not found')
    })
  })

  describe('updatePhaseOrder', () => {
    it('should update sort_order for all phases in list', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })

      const orderedIds = ['phase-3', 'phase-1', 'phase-2']
      await updatePhaseOrder('proj-123', orderedIds)

      expect(supabase.from).toHaveBeenCalledTimes(3)
    })

    it('should do nothing when empty array provided', async () => {
      await updatePhaseOrder('proj-123', [])

      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('completePhase', () => {
    it('should update status to completed and set actual_end_date', async () => {
      const mockCompletedPhase: ProjectPhase = {
        id: 'phase-1',
        project_id: 'proj-123',
        name: 'Phase 1',
        description: 'First phase',
        sort_order: 0,
        estimated_start_date: '2025-01-01',
        estimated_end_date: '2025-01-15',
        actual_start_date: '2025-01-02',
        actual_end_date: '2025-01-14',
        status: 'completed',
        notify_on_complete: true,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCompletedPhase, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const result = await completePhase('phase-1')

      expect(result.status).toBe('completed')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      )
    })
  })

  describe('startPhase', () => {
    it('should update status to in_progress and set actual_start_date', async () => {
      const mockStartedPhase: ProjectPhase = {
        id: 'phase-1',
        project_id: 'proj-123',
        name: 'Phase 1',
        description: 'First phase',
        sort_order: 0,
        estimated_start_date: '2025-01-01',
        estimated_end_date: '2025-01-15',
        actual_start_date: '2025-01-02',
        actual_end_date: null,
        status: 'in_progress',
        notify_on_complete: true,
        estimated_cost: null,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockStartedPhase, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const result = await startPhase('phase-1')

      expect(result.status).toBe('in_progress')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'in_progress',
        })
      )
    })
  })
})

