/**
 * Tests for auth store
 * 
 * Note: Auth initialization and state updates after signIn are now handled by 
 * AuthProvider via onAuthStateChange. The store's signIn just calls Supabase auth.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuthStore } from './authStore'
import * as authLib from '@/lib/auth'

// Mock auth library
vi.mock('@/lib/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}))

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      useAuthStore.setState({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
      })
      
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('signIn', () => {
    it('should return null error on successful signIn', async () => {
      const mockSupabaseUser = {
        id: 'auth-user-123',
        email: 'test@example.com',
      } as any

      const mockSession = {
        access_token: 'token',
        user: mockSupabaseUser,
      } as any

      vi.mocked(authLib.signIn).mockResolvedValue({
        user: mockSupabaseUser,
        session: mockSession,
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      let signInResult: { error: Error | null } | undefined

      await act(async () => {
        signInResult = await result.current.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      // signIn should return null error on success
      // Note: State update is handled by AuthProvider's onAuthStateChange listener
      expect(signInResult?.error).toBeNull()
      expect(authLib.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should return error when signIn fails', async () => {
      const mockError = { message: 'Invalid credentials' } as any

      vi.mocked(authLib.signIn).mockResolvedValue({
        user: null,
        session: null,
        error: mockError,
      })

      const { result } = renderHook(() => useAuthStore())

      let signInResult: { error: Error | null } | undefined

      await act(async () => {
        signInResult = await result.current.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      })

      expect(signInResult?.error).toEqual(mockError)
      expect(result.current.isLoading).toBe(false)
    })

    it('should return error when user is null after signIn', async () => {
      vi.mocked(authLib.signIn).mockResolvedValue({
        user: null,
        session: null,
        error: null,
      })

      const { result } = renderHook(() => useAuthStore())

      let signInResult: { error: Error | null } | undefined

      await act(async () => {
        signInResult = await result.current.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(signInResult?.error?.message).toBe('Sign in failed')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should clear auth state after signOut', async () => {
      // First set authenticated state
      useAuthStore.setState({
        user: {
          id: 'user-123',
          auth_user_id: 'auth-user-123',
          name: 'John',
          surname: 'Doe',
          email: 'test@example.com',
          phone: '1234567890',
          role: 'client',
          created_at: '2025-12-29T00:00:00Z',
          updated_at: '2025-12-29T00:00:00Z',
          supabaseUser: {} as any,
        },
        session: {} as any,
        isAuthenticated: true,
        isLoading: false,
      })

      vi.mocked(authLib.signOut).mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should clear auth state even when signOut fails', async () => {
      // First set authenticated state
      useAuthStore.setState({
        user: {
          id: 'user-123',
          auth_user_id: 'auth-user-123',
          name: 'John',
          surname: 'Doe',
          email: 'test@example.com',
          phone: '1234567890',
          role: 'client',
          created_at: '2025-12-29T00:00:00Z',
          updated_at: '2025-12-29T00:00:00Z',
          supabaseUser: {} as any,
        },
        session: {} as any,
        isAuthenticated: true,
        isLoading: false,
      })

      vi.mocked(authLib.signOut).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // State should still be cleared even if signOut fails
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })
})
