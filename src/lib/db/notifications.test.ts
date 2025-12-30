/**
 * Tests for notification helper functions
 * These tests verify email notification triggering and project notification settings
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sendPhaseCompletionNotification,
  isProjectNotificationsEnabled,
  updateProjectNotificationsEnabled,
} from './notifications'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}))

describe('Notifications Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendPhaseCompletionNotification', () => {
    it('should send notification and return success result', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { message: 'Notifications sent successfully', emailsSent: 3 },
        error: null,
      } as any)

      const result = await sendPhaseCompletionNotification({
        projectId: 'proj-123',
        phaseId: 'phase-1',
        phaseName: 'Design Phase',
        trackingCode: 'TC-ABC123',
      })

      expect(result.success).toBe(true)
      expect(result.emailsSent).toBe(3)
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-phase-notification', {
        body: {
          projectId: 'proj-123',
          phaseId: 'phase-1',
          phaseName: 'Design Phase',
          trackingCode: 'TC-ABC123',
        },
      })
    })

    it('should return failure result when function invoke fails', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      } as any)

      const result = await sendPhaseCompletionNotification({
        projectId: 'proj-123',
        phaseId: 'phase-1',
        phaseName: 'Design Phase',
        trackingCode: 'TC-ABC123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Function error')
    })

    it('should handle thrown errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      )

      const result = await sendPhaseCompletionNotification({
        projectId: 'proj-123',
        phaseId: 'phase-1',
        phaseName: 'Design Phase',
        trackingCode: 'TC-ABC123',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should return 0 emails sent when not specified in response', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { message: 'OK' },
        error: null,
      } as any)

      const result = await sendPhaseCompletionNotification({
        projectId: 'proj-123',
        phaseId: 'phase-1',
        phaseName: 'Design Phase',
        trackingCode: 'TC-ABC123',
      })

      expect(result.success).toBe(true)
      expect(result.emailsSent).toBe(0)
    })
  })

  describe('isProjectNotificationsEnabled', () => {
    it('should return true when notifications are enabled', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { notifications_enabled: true },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await isProjectNotificationsEnabled('proj-123')

      expect(result).toBe(true)
    })

    it('should return false when notifications are disabled', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { notifications_enabled: false },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await isProjectNotificationsEnabled('proj-123')

      expect(result).toBe(false)
    })

    it('should return true as default when field is null', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { notifications_enabled: null },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })

      const result = await isProjectNotificationsEnabled('proj-123')

      expect(result).toBe(true)
    })

    it('should return false when project not found', async () => {
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

      const result = await isProjectNotificationsEnabled('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('updateProjectNotificationsEnabled', () => {
    it('should update notifications to enabled', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })

      await updateProjectNotificationsEnabled('proj-123', true)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: true,
        })
      )
    })

    it('should update notifications to disabled', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })

      await updateProjectNotificationsEnabled('proj-123', false)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications_enabled: false,
        })
      )
    })

    it('should throw error when update fails', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({
        error: { message: 'Update failed' },
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any)
      mockUpdate.mockReturnValue({ eq: mockEq })

      await expect(
        updateProjectNotificationsEnabled('proj-123', true)
      ).rejects.toThrow('Failed to update notification settings')
    })
  })
})

