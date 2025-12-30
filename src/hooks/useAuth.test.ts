/**
 * Tests for useAuth hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/store/authStore'

// Mock the store
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return auth state and actions', () => {
    const mockState = {
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    }

    vi.mocked(useAuthStore).mockReturnValue(mockState as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.signIn).toBeDefined()
    expect(result.current.signUp).toBeDefined()
    expect(result.current.signOut).toBeDefined()
  })

  it('should return current user when authenticated', () => {
    const mockUser = {
      id: 'user-123',
      auth_user_id: 'auth-user-123',
      name: 'John',
      surname: 'Doe',
      email: 'test@example.com',
      phone: '1234567890',
      role: 'client' as const,
      created_at: '2025-12-29T00:00:00Z',
      updated_at: '2025-12-29T00:00:00Z',
      supabaseUser: {} as any,
    }

    const mockState = {
      user: mockUser,
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    }

    vi.mocked(useAuthStore).mockReturnValue(mockState as any)

    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })
})
