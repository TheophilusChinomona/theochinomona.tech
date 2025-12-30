/**
 * Tests for Firebase fallback configuration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase modules
const mockInitializeApp = vi.fn()
const mockGetApps = vi.fn(() => [])
const mockGetDatabase = vi.fn()
const mockGetAuth = vi.fn()

vi.mock('firebase/app', () => ({
  initializeApp: (...args: any[]) => mockInitializeApp(...args),
  getApps: () => mockGetApps(),
}))

vi.mock('firebase/database', () => ({
  getDatabase: (...args: any[]) => mockGetDatabase(...args),
}))

vi.mock('firebase/auth', () => ({
  getAuth: (...args: any[]) => mockGetAuth(...args),
}))

describe('Firebase Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetApps.mockReturnValue([])
  })

  it('should return nulls when configuration is incomplete', async () => {
    // Clear all Firebase env vars by setting them to undefined
    const originalEnv = { ...import.meta.env }
    delete (import.meta.env as any).VITE_FIREBASE_API_KEY
    delete (import.meta.env as any).VITE_FIREBASE_AUTH_DOMAIN
    delete (import.meta.env as any).VITE_FIREBASE_DATABASE_URL
    delete (import.meta.env as any).VITE_FIREBASE_PROJECT_ID

    // Re-import to test with cleared env
    vi.resetModules()
    const { initializeFirebase } = await import('./firebase')

    const result = initializeFirebase()

    expect(result.app).toBeNull()
    expect(result.database).toBeNull()
    expect(result.auth).toBeNull()

    // Restore env
    Object.assign(import.meta.env, originalEnv)
  })

  it('should have placeholder auth helper functions structure', async () => {
    const { firebaseAuthHelpers } = await import('./firebase')

    expect(firebaseAuthHelpers).toBeDefined()
    expect(firebaseAuthHelpers.signUp).toBeDefined()
    expect(firebaseAuthHelpers.signIn).toBeDefined()
    expect(firebaseAuthHelpers.signOut).toBeDefined()

    // Should throw error as not yet implemented
    await expect(
      firebaseAuthHelpers.signUp('test@example.com', 'password', {
        name: 'Test',
        surname: 'User',
      })
    ).rejects.toThrow('Firebase auth not yet implemented')
  })
})

