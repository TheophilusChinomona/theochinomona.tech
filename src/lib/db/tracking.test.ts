/**
 * Tests for tracking codes and notification preferences database helper functions
 * These tests verify database operations for the tracking_codes and client_notification_preferences tables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getProjectByTrackingCode,
  getTrackingCodeByProjectId,
  regenerateTrackingCode,
  getAllTrackingCodesByProjectId,
  getNotificationPreferences,
  getOptedInNotificationPreferences,
  upsertNotificationPreference,
  type TrackingCode,
  type ProjectPhase,
  type ProjectTask,
  type ProjectAttachment,
  type ClientNotificationPreference,
} from './tracking'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

describe('Tracking Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Tracking Code Functions Tests
  // ============================================================================

  describe('getProjectByTrackingCode', () => {
    it('should return project with phases and tasks for valid active tracking code', async () => {
      const mockTrackingCode: TrackingCode = {
        id: 'tc-123',
        project_id: 'proj-123',
        code: 'TC-ABC123',
        is_active: true,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockProject = {
        id: 'proj-123',
        title: 'Test Project',
        description: 'Test description',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        client_id: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        notifications_enabled: true,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

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
          status: 'pending',
          notify_on_complete: true,
          estimated_cost: null,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockTasks: ProjectTask[] = [
        {
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
        },
      ]

      const mockAttachments: ProjectAttachment[] = []

      // Mock for tracking codes query
      const mockTrackingSelect = vi.fn().mockReturnThis()
      const mockTrackingEq1 = vi.fn().mockReturnThis()
      const mockTrackingEq2 = vi.fn().mockReturnThis()
      const mockTrackingSingle = vi.fn().mockResolvedValue({ data: mockTrackingCode, error: null })
      
      mockTrackingEq1.mockReturnValue({ eq: mockTrackingEq2 })
      mockTrackingEq2.mockReturnValue({ single: mockTrackingSingle })

      // Mock for projects query
      const mockProjectSelect = vi.fn().mockReturnThis()
      const mockProjectEq = vi.fn().mockReturnThis()
      const mockProjectSingle = vi.fn().mockResolvedValue({ data: mockProject, error: null })
      
      mockProjectEq.mockReturnValue({ single: mockProjectSingle })

      // Mock for phases query
      const mockPhasesSelect = vi.fn().mockReturnThis()
      const mockPhasesEq = vi.fn().mockReturnThis()
      const mockPhasesOrder = vi.fn().mockResolvedValue({ data: mockPhases, error: null })
      
      mockPhasesEq.mockReturnValue({ order: mockPhasesOrder })

      // Mock for tasks query
      const mockTasksSelect = vi.fn().mockReturnThis()
      const mockTasksIn = vi.fn().mockReturnThis()
      const mockTasksOrder = vi.fn().mockResolvedValue({ data: mockTasks, error: null })
      
      mockTasksIn.mockReturnValue({ order: mockTasksOrder })

      // Mock for attachments query
      const mockAttachmentsSelect = vi.fn().mockReturnThis()
      const mockAttachmentsEq = vi.fn().mockReturnThis()
      const mockAttachmentsOrder = vi.fn().mockResolvedValue({ data: mockAttachments, error: null })
      
      mockAttachmentsEq.mockReturnValue({ order: mockAttachmentsOrder })

      let callIndex = 0
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        callIndex++
        if (table === 'tracking_codes') {
          return { select: mockTrackingSelect } as any
        } else if (table === 'projects') {
          return { select: mockProjectSelect } as any
        } else if (table === 'project_phases') {
          return { select: mockPhasesSelect } as any
        } else if (table === 'project_tasks') {
          return { select: mockTasksSelect } as any
        } else if (table === 'project_attachments') {
          return { select: mockAttachmentsSelect } as any
        }
        return {} as any
      })

      mockTrackingSelect.mockReturnValue({ eq: mockTrackingEq1 })
      mockProjectSelect.mockReturnValue({ eq: mockProjectEq })
      mockPhasesSelect.mockReturnValue({ eq: mockPhasesEq })
      mockTasksSelect.mockReturnValue({ in: mockTasksIn })
      mockAttachmentsSelect.mockReturnValue({ eq: mockAttachmentsEq })

      const result = await getProjectByTrackingCode('TC-ABC123')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Project')
      expect(result?.tracking_code?.code).toBe('TC-ABC123')
      expect(result?.phases).toHaveLength(1)
      expect(result?.phases[0]?.tasks).toHaveLength(1)
    })

    it('should return null for invalid tracking code', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })
      mockEq2.mockReturnValue({ single: mockSingle })

      const result = await getProjectByTrackingCode('INVALID-CODE')

      expect(result).toBeNull()
    })

    it('should return null for inactive tracking code', async () => {
      // Tracking code exists but is_active = false, query will return no match
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })
      mockEq2.mockReturnValue({ single: mockSingle })

      const result = await getProjectByTrackingCode('TC-INACTIVE')

      expect(result).toBeNull()
    })
  })

  describe('getTrackingCodeByProjectId', () => {
    it('should return active tracking code for project', async () => {
      const mockTrackingCode: TrackingCode = {
        id: 'tc-123',
        project_id: 'proj-123',
        code: 'TC-ABC123',
        is_active: true,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockTrackingCode, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })
      mockEq2.mockReturnValue({ single: mockSingle })

      const result = await getTrackingCodeByProjectId('proj-123')

      expect(result).toEqual(mockTrackingCode)
      expect(result?.code).toBe('TC-ABC123')
      expect(result?.is_active).toBe(true)
    })

    it('should return null when project has no tracking code', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })
      mockEq2.mockReturnValue({ single: mockSingle })

      const result = await getTrackingCodeByProjectId('non-existent-project')

      expect(result).toBeNull()
    })
  })

  describe('regenerateTrackingCode', () => {
    it('should call RPC function and return new tracking code', async () => {
      const newCode = 'TC-NEW123'

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: newCode,
        error: null,
      } as any)

      const result = await regenerateTrackingCode('proj-123')

      expect(result).toBe(newCode)
      expect(supabase.rpc).toHaveBeenCalledWith('regenerate_tracking_code', {
        p_project_id: 'proj-123',
      })
    })

    it('should throw error when RPC fails', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      } as any)

      await expect(regenerateTrackingCode('proj-123')).rejects.toThrow(
        'Failed to regenerate tracking code'
      )
    })
  })

  describe('getAllTrackingCodesByProjectId', () => {
    it('should return all tracking codes including inactive ones', async () => {
      const mockCodes: TrackingCode[] = [
        {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-NEW123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'tc-old',
          project_id: 'proj-123',
          code: 'TC-OLD123',
          is_active: false,
          created_at: '2025-12-29T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockCodes, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getAllTrackingCodesByProjectId('proj-123')

      expect(result).toHaveLength(2)
      expect(result[0]?.is_active).toBe(true)
      expect(result[1]?.is_active).toBe(false)
    })
  })

  // ============================================================================
  // Notification Preference Functions Tests
  // ============================================================================

  describe('getNotificationPreferences', () => {
    it('should return all notification preferences for tracking code', async () => {
      const mockPreferences: ClientNotificationPreference[] = [
        {
          id: 'pref-1',
          tracking_code_id: 'tc-123',
          email: 'client1@example.com',
          opted_in: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        {
          id: 'pref-2',
          tracking_code_id: 'tc-123',
          email: 'client2@example.com',
          opted_in: false,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockPreferences, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })

      const result = await getNotificationPreferences('tc-123')

      expect(result).toHaveLength(2)
    })
  })

  describe('getOptedInNotificationPreferences', () => {
    it('should return only opted-in notification preferences', async () => {
      const mockPreferences: ClientNotificationPreference[] = [
        {
          id: 'pref-1',
          tracking_code_id: 'tc-123',
          email: 'client1@example.com',
          opted_in: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq1 = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockResolvedValue({ data: mockPreferences, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq1 })
      mockEq1.mockReturnValue({ eq: mockEq2 })

      const result = await getOptedInNotificationPreferences('tc-123')

      expect(result).toHaveLength(1)
      expect(result[0]?.opted_in).toBe(true)
    })
  })

  describe('upsertNotificationPreference', () => {
    it('should create new notification preference', async () => {
      const mockPreference: ClientNotificationPreference = {
        id: 'pref-new',
        tracking_code_id: 'tc-123',
        email: 'new@example.com',
        opted_in: true,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockUpsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockPreference, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any)
      mockUpsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      const result = await upsertNotificationPreference('tc-123', 'new@example.com', true)

      expect(result.email).toBe('new@example.com')
      expect(result.opted_in).toBe(true)
    })

    it('should normalize email to lowercase and trim', async () => {
      const mockPreference: ClientNotificationPreference = {
        id: 'pref-new',
        tracking_code_id: 'tc-123',
        email: 'test@example.com',
        opted_in: true,
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
      }

      const mockUpsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockPreference, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any)
      mockUpsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      await upsertNotificationPreference('tc-123', '  TEST@EXAMPLE.COM  ', true)

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
        }),
        expect.anything()
      )
    })

    it('should throw error when upsert fails', async () => {
      const mockUpsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any)
      mockUpsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })

      await expect(
        upsertNotificationPreference('tc-123', 'test@example.com', true)
      ).rejects.toThrow('Failed to update notification preference')
    })
  })
})

