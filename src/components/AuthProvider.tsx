/**
 * Auth Provider Component
 * Initializes auth state on app load and sets up session refresh
 * 
 * Uses onAuthStateChange as the primary mechanism for auth state.
 * Includes fallback session check for reliability.
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { getUserByAuthId } from '@/lib/db/users'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  children: React.ReactNode
}

// Helper to update auth state based on session
async function updateAuthState(session: Session | null, source: string) {
  if (import.meta.env.DEV) {
    console.log(`AuthProvider (${source}) - Processing session:`, {
      hasSession: !!session,
      userId: session?.user?.id,
    })
  }

  if (session?.user) {
    try {
      const userRecord = await getUserByAuthId(session.user.id)
      
      if (import.meta.env.DEV) {
        console.log(`AuthProvider (${source}) - User record:`, 
          userRecord ? `Found (role: ${userRecord.role})` : 'Not found')
      }

      if (userRecord) {
        useAuthStore.setState({
          user: {
            ...userRecord,
            supabaseUser: session.user,
          },
          session,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      } else {
        // Session exists but no user record in database
        if (import.meta.env.DEV) {
          console.warn(`AuthProvider (${source}) - Session exists but no user record`)
        }
        useAuthStore.setState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return true
      }
    } catch (error) {
      console.error(`AuthProvider (${source}) - Error fetching user record:`, error)
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return true
    }
  } else {
    // No session
    if (import.meta.env.DEV) {
      console.log(`AuthProvider (${source}) - No session`)
    }
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    })
    return true
  }
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    let isMounted = true
    let hasInitialized = false

    if (import.meta.env.DEV) {
      console.log('AuthProvider - Mounting, setting up auth')
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return

        if (import.meta.env.DEV) {
          console.log('AuthProvider - onAuthStateChange:', event)
        }
        
        if (event === 'INITIAL_SESSION') {
          hasInitialized = true
          await updateAuthState(session, 'INITIAL_SESSION')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          hasInitialized = true
          // Small delay to ensure session tokens are fully propagated
          await new Promise(resolve => setTimeout(resolve, 50))
          if (!isMounted) return
          await updateAuthState(session, event)
        } else if (event === 'SIGNED_OUT') {
          hasInitialized = true
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      }
    )

    // Fallback: Check session directly if INITIAL_SESSION doesn't fire quickly
    // This handles cases where the listener might miss the initial event
    const fallbackTimeout = setTimeout(async () => {
      if (!isMounted || hasInitialized) return
      
      if (import.meta.env.DEV) {
        console.log('AuthProvider - Fallback: checking session directly')
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted || hasInitialized) return
        
        if (error) {
          console.error('AuthProvider - Fallback getSession error:', error)
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }

        hasInitialized = true
        await updateAuthState(session, 'fallback')
      } catch (error) {
        console.error('AuthProvider - Fallback error:', error)
        if (isMounted && !hasInitialized) {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      }
    }, 100) // Short delay to let INITIAL_SESSION fire first

    // Safety timeout: ensure loading state is resolved
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return
      
      const { isLoading } = useAuthStore.getState()
      if (isLoading) {
        if (import.meta.env.DEV) {
          console.warn('AuthProvider - Safety timeout: forcing isLoading to false')
        }
        useAuthStore.setState({ isLoading: false })
      }
    }, 5000) // 5 second safety net

    // Cleanup
    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout)
      clearTimeout(safetyTimeout)
    }
  }, [])

  return <>{children}</>
}
