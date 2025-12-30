/**
 * Tests for users table database helper functions
 * These tests verify database operations for the users table
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUserByAuthId,
  getUserRoleByAuthId,
  createUserRecord,
  getAllUsers,
  updateUser,
  updateUserRole,
  deleteUser,
  getDashboardStats,
} from './users'
import { supabase } from '@/lib/supabase'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('Users Database Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserByAuthId', () => {
    it('should return user when valid auth_user_id is provided', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T00:00:00Z',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        eq: mockEq,
      })
      mockEq.mockReturnValue({
        single: mockSingle,
      })

      const result = await getUserByAuthId('auth-user-123')

      expect(result).toEqual(mockUser)
      expect(supabase.from).toHaveBeenCalledWith('users')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('auth_user_id', 'auth-user-123')
    })

    it('should return null when user does not exist', async () => {
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

      const result = await getUserByAuthId('non-existent-id')

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

      await expect(getUserByAuthId('auth-user-123')).rejects.toThrow()
    })
  })

  describe('getUserRoleByAuthId', () => {
    it('should return role when valid auth_user_id is provided', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null,
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

      const result = await getUserRoleByAuthId('auth-user-123')

      expect(result).toBe('admin')
      expect(mockSelect).toHaveBeenCalledWith('role')
    })

    it('should return null when user does not exist', async () => {
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

      const result = await getUserRoleByAuthId('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('createUserRecord', () => {
    it('should create user record with all required fields', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T00:00:00Z',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await createUserRecord('auth-user-123', {
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
      })

      expect(result).toEqual(mockUser)
      expect(mockInsert).toHaveBeenCalledWith({
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'client',
      })
    })

    it('should set default role to client when not provided', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: null,
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T00:00:00Z',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)
      mockInsert.mockReturnValue({
        select: mockSelect,
      })
      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      await createUserRecord('auth-user-123', {
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'client',
          phone: null,
        })
      )
    })
  })

  // ============================================
  // Admin User Management Function Tests
  // ============================================

  describe('getAllUsers', () => {
    it('should return all users from database', async () => {
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          auth_user_id: 'auth-user-1',
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          role: 'admin' as const,
          created_at: '2025-12-29T00:00:00Z',
          updated_at: '2025-12-29T00:00:00Z',
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          auth_user_id: 'auth-user-2',
          name: 'Jane',
          surname: 'Smith',
          email: 'jane@example.com',
          phone: null,
          role: 'client' as const,
          created_at: '2025-12-28T00:00:00Z',
          updated_at: '2025-12-28T00:00:00Z',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockUsers, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(supabase.from).toHaveBeenCalledWith('users')
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

      await expect(getAllUsers()).rejects.toThrow()
    })
  })

  describe('updateUser', () => {
    it('should update user fields correctly', async () => {
      const mockUpdatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        auth_user_id: 'auth-user-123',
        name: 'Updated',
        surname: 'Name',
        email: 'updated@example.com',
        phone: '9999999999',
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedUser, error: null })

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

      const result = await updateUser('123e4567-e89b-12d3-a456-426614174000', {
        name: 'Updated',
        surname: 'Name',
        email: 'updated@example.com',
        phone: '9999999999',
      })

      expect(result).toEqual(mockUpdatedUser)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated',
          surname: 'Name',
          email: 'updated@example.com',
          phone: '9999999999',
        })
      )
    })

    it('should throw error when user not found', async () => {
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
        updateUser('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('User not found')
    })
  })

  describe('updateUserRole', () => {
    it('should change user role from client to admin', async () => {
      const mockUpdatedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: null,
        role: 'admin' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T12:00:00Z',
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedUser, error: null })

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

      const result = await updateUserRole(
        '123e4567-e89b-12d3-a456-426614174000',
        'admin'
      )

      expect(result.role).toBe('admin')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'admin',
        })
      )
    })
  })

  describe('deleteUser', () => {
    it('should delete user and return userId', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
      } as any)
      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const result = await deleteUser('123e4567-e89b-12d3-a456-426614174000')

      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(supabase.from).toHaveBeenCalledWith('users')
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

      await expect(deleteUser('non-existent-id')).rejects.toThrow('User not found')
    })
  })

  describe('getDashboardStats', () => {
    it('should return dashboard statistics correctly', async () => {
      const now = new Date()
      const recentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      const oldDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const mockUsers = [
        {
          id: '1',
          auth_user_id: 'auth-1',
          name: 'Admin',
          surname: 'User',
          email: 'admin@example.com',
          phone: null,
          role: 'admin' as const,
          created_at: recentDate,
          updated_at: recentDate,
        },
        {
          id: '2',
          auth_user_id: 'auth-2',
          name: 'Client',
          surname: 'User',
          email: 'client@example.com',
          phone: null,
          role: 'client' as const,
          created_at: oldDate,
          updated_at: oldDate,
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockUsers, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)
      mockSelect.mockReturnValue({
        order: mockOrder,
      })

      const result = await getDashboardStats()

      expect(result.totalUsers).toBe(2)
      expect(result.totalAdmins).toBe(1)
      expect(result.totalClients).toBe(1)
      expect(result.recentSignups).toBe(1)
      expect(result.recentUsers).toHaveLength(2)
    })
  })
})

