/**
 * Tests for auth helper functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, signOut, getCurrentUser, verifyEmail, sendPasswordResetEmail } from './auth'
import { supabase } from './supabase'
import * as usersDb from './db/users'

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      verifyOtp: vi.fn(),
      refreshSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}))

// Mock database helpers
vi.mock('./db/users', () => ({
  createUserRecord: vi.fn(),
  getUserByAuthId: vi.fn(),
}))

describe('Auth Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should create auth user and users table record', async () => {
      const mockAuthUser = {
        id: 'auth-user-123',
        email: 'test@example.com',
      } as any

      const mockSession = {
        access_token: 'token',
        user: mockAuthUser,
      } as any

      const mockUserRecord = {
        id: 'user-123',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T00:00:00Z',
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: mockAuthUser,
          session: mockSession,
        },
        error: null,
      } as any)

      vi.mocked(usersDb.createUserRecord).mockResolvedValue(mockUserRecord)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
        phone: '1234567890',
      })

      expect(result.user).toEqual(mockAuthUser)
      expect(result.session).toEqual(mockSession)
      expect(result.userRecord).toEqual(mockUserRecord)
      expect(result.error).toBeNull()
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'John',
            surname: 'Doe',
            phone: '1234567890',
          },
        },
      })
      expect(usersDb.createUserRecord).toHaveBeenCalledWith('auth-user-123', {
        name: 'John',
        surname: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'client',
      })
    })

    it('should handle errors gracefully when auth signup fails', async () => {
      const mockError = {
        message: 'User already registered',
        status: 400,
      } as any

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any)

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
      })

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.userRecord).toBeNull()
      expect(result.error).toEqual(mockError)
      expect(usersDb.createUserRecord).not.toHaveBeenCalled()
    })
  })

  describe('signIn', () => {
    it('should return session with valid credentials', async () => {
      const mockAuthUser = {
        id: 'auth-user-123',
        email: 'test@example.com',
      } as any

      const mockSession = {
        access_token: 'token',
        user: mockAuthUser,
      } as any

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: mockAuthUser,
          session: mockSession,
        },
        error: null,
      } as any)

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toEqual(mockAuthUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should handle invalid credentials', async () => {
      const mockError = {
        message: 'Invalid login credentials',
        status: 400,
      } as any

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any)

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.user).toBeNull()
      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should clear session and local storage', async () => {
      // Mock localStorage
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      } as any)

      const result = await signOut()

      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(removeItemSpy).toHaveBeenCalledWith('supabase.auth.token')
    })
  })

  describe('getCurrentUser', () => {
    it('should retrieve user with role from users table', async () => {
      const mockAuthUser = {
        id: 'auth-user-123',
        email: 'test@example.com',
      } as any

      const mockSession = {
        user: mockAuthUser,
      } as any

      const mockUserRecord = {
        id: 'user-123',
        auth_user_id: 'auth-user-123',
        name: 'John',
        surname: 'Doe',
        email: 'test@example.com',
        phone: '1234567890',
        role: 'client' as const,
        created_at: '2025-12-29T00:00:00Z',
        updated_at: '2025-12-29T00:00:00Z',
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      } as any)

      vi.mocked(usersDb.getUserByAuthId).mockResolvedValue(mockUserRecord)

      const result = await getCurrentUser()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('user-123')
      expect(result?.role).toBe('client')
      expect(result?.supabaseUser).toEqual(mockAuthUser)
      expect(usersDb.getUserByAuthId).toHaveBeenCalledWith('auth-user-123')
    })

    it('should return null when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any)

      const result = await getCurrentUser()

      expect(result).toBeNull()
      expect(usersDb.getUserByAuthId).not.toHaveBeenCalled()
    })
  })

  describe('verifyEmail', () => {
    it('should handle verification token correctly', async () => {
      const mockAuthUser = {
        id: 'auth-user-123',
        email: 'test@example.com',
        email_confirmed_at: '2025-12-29T00:00:00Z',
      } as any

      const mockSession = {
        access_token: 'token',
        user: mockAuthUser,
      } as any

      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: {
          user: mockAuthUser,
          session: mockSession,
        },
        error: null,
      } as any)

      const result = await verifyEmail('verification-token')

      expect(result.user).toEqual(mockAuthUser)
      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'verification-token',
        type: 'email',
      })
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send reset email via Supabase', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:5173' },
        writable: true,
      })

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as any)

      const result = await sendPasswordResetEmail('test@example.com')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'http://localhost:5173/reset-password',
      })
    })

    it('should handle invalid email errors', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:5173' },
        writable: true,
      })

      const mockError = {
        message: 'Invalid email address',
        status: 400,
      } as any

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: mockError,
      } as any)

      const result = await sendPasswordResetEmail('invalid-email')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email address. Please check and try again.')
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled()
    })

    it('should handle network errors gracefully', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:5173' },
        writable: true,
      })

      const mockError = {
        message: 'Network error',
        status: 500,
      } as any

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: mockError,
      } as any)

      const result = await sendPasswordResetEmail('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error. Please check your connection and try again.')
    })

    it('should return success confirmation when email is sent', async () => {
      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:5173' },
        writable: true,
      })

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as any)

      const result = await sendPasswordResetEmail('test@example.com')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(result.message).toBe('Password reset email sent successfully')
    })
  })
})

