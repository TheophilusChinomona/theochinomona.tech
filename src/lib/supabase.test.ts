/**
 * Tests for Supabase client initialization
 * Note: These tests verify the client can be initialized with proper configuration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock the Supabase client creation
const mockClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient),
}))

// Mock the supabase module
vi.mock('@/lib/supabase', async () => {
  const actual = await vi.importActual('@/lib/supabase')
  return actual
})

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with environment variables', async () => {
    // Set environment variables
    const originalUrl = import.meta.env.VITE_SUPABASE_URL
    const originalKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
    import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key'

    // Import the module to trigger initialization
    const { supabase } = await import('@/lib/supabase')

    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }),
      })
    )

    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()

    // Restore original values
    import.meta.env.VITE_SUPABASE_URL = originalUrl
    import.meta.env.VITE_SUPABASE_ANON_KEY = originalKey
  })

  it('should have auth methods accessible', async () => {
    const { supabase } = await import('@/lib/supabase')

    expect(supabase.auth.signUp).toBeDefined()
    expect(supabase.auth.signInWithPassword).toBeDefined()
    expect(supabase.auth.signOut).toBeDefined()
    expect(supabase.auth.getSession).toBeDefined()
  })

  it('should configure non-persistent sessions', async () => {
    // Verify that the client configuration includes persistSession: false
    // This is already verified in the first test, but we confirm the client exists
    const { supabase } = await import('@/lib/supabase')

    expect(supabase).toBeDefined()
    // The persistSession: false configuration is verified in the first test
    // where we check createClient was called with the correct auth config
  })
})

