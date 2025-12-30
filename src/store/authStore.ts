/**
 * Auth Store using Zustand
 * Global auth state management for the application
 * 
 * Note: Auth initialization is handled by AuthProvider via onAuthStateChange.
 * This avoids race conditions and hanging getSession() calls.
 */

import { create } from 'zustand'
import { signIn, signOut, signUp, type SignInData, type SignUpData } from '@/lib/auth'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/lib/db/users'

export interface AuthUser extends User {
  supabaseUser: SupabaseUser
}

interface AuthState {
  // State
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  signIn: (data: SignInData) => Promise<{ error: Error | null }>
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state - isLoading starts true until AuthProvider initializes
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  // Sign in - calls Supabase auth and waits for state to be updated by onAuthStateChange
  signIn: async (data: SignInData) => {
    set({ isLoading: true })
    try {
      const result = await signIn(data)

      if (result.error) {
        set({ isLoading: false })
        return { error: result.error }
      }

      if (result.user && result.session) {
        // Wait for onAuthStateChange to update the state
        // Poll until isAuthenticated becomes true or timeout
        const maxWait = 5000 // 5 seconds
        const pollInterval = 50 // 50ms
        let waited = 0
        
        while (waited < maxWait) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
          waited += pollInterval
          
          const state = useAuthStore.getState()
          if (state.isAuthenticated && state.user) {
            return { error: null }
          }
          // If loading is false and not authenticated, something went wrong
          if (!state.isLoading && !state.isAuthenticated) {
            // Give it a bit more time - onAuthStateChange might still be processing
            if (waited > 1000) {
              break
            }
          }
        }
        
        // Timeout - but sign-in itself succeeded, so return success
        // The state should be updated by now
        const finalState = useAuthStore.getState()
        if (finalState.isAuthenticated) {
          return { error: null }
        }
        
        // Last resort: set loading to false if still loading
        if (finalState.isLoading) {
          set({ isLoading: false })
        }
        
        return { error: null }
      }

      set({ isLoading: false })
      return { error: new Error('Sign in failed') }
    } catch (error) {
      set({ isLoading: false })
      return { error: error as Error }
    }
  },

  // Sign up
  signUp: async (data: SignUpData) => {
    set({ isLoading: true })
    try {
      const result = await signUp(data)

      if (result.error) {
        set({ isLoading: false })
        return { error: result.error }
      }

      // After signup, user might need to verify email
      // If user and session are available, set them
      if (result.user && result.session && result.userRecord) {
        set({
          user: {
            ...result.userRecord,
            supabaseUser: result.user,
          },
          session: result.session,
          isAuthenticated: true,
          isLoading: false,
        })
        return { error: null }
      }

      // Email verification required
      set({ isLoading: false })
      return { error: null } // Not an error, just needs email verification
    } catch (error) {
      set({ isLoading: false })
      return { error: error as Error }
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true })
    try {
      await signOut()
      
      // Clear all auth state
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error signing out:', error)
      // Clear state even if signOut fails
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))


