/**
 * Auth Provider Component
 * Initializes auth state on app load and sets up session refresh
 * 
 * Strategy:
 * 1. Use JWT metadata for immediate auth (no database query delay)
 * 2. Fetch full user record in background and update state
 */

import { useEffect } from 'react'
import { useAuthStore, type AuthUser } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { getUserByAuthId } from '@/lib/db/users'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  children: React.ReactNode
}

// Create user from JWT metadata (instant, no database query)
function createUserFromMetadata(session: Session): AuthUser | null {
  const user = session.user
  const metadata = user.user_metadata
  
  // Check if we have enough metadata to create a user
  if (!metadata?.role) {
    return null
  }
  
  return {
    id: user.id,
    auth_user_id: user.id,
    email: user.email || '',
    name: metadata.name || 'User',
    surname: metadata.surname || '',
    phone: metadata.phone || null,
    role: metadata.role as 'admin' | 'client',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    supabaseUser: user,
  }
}

// Fetch full user record from database (background update)
async function fetchAndUpdateUserRecord(session: Session) {
  try {
    const userRecord = await getUserByAuthId(session.user.id)
    
    if (userRecord) {
      // Update state with full user record
      useAuthStore.setState({
        user: {
          ...userRecord,
          supabaseUser: session.user,
        },
      })
    }
  } catch {
    // Don't fail - we already have metadata-based auth
  }
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    let isMounted = true

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return
        
        if (event === 'SIGNED_OUT') {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }
        
        if (event === 'TOKEN_REFRESHED') {
          if (session) {
            useAuthStore.setState({ session })
          }
          return
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          if (session) {
            useAuthStore.setState({ session, isLoading: false })
          }
          return
        }
        
        // Handle SIGNED_IN and INITIAL_SESSION
        if (session?.user) {
          // Step 1: Immediately set auth state using JWT metadata (no delay!)
          const metadataUser = createUserFromMetadata(session)
          
          if (metadataUser) {
            useAuthStore.setState({
              user: metadataUser,
              session,
              isAuthenticated: true,
              isLoading: false,
            })
            
            // Step 2: Fetch full user record in background (non-blocking)
            fetchAndUpdateUserRecord(session)
          } else {
            // No metadata - must query database
            try {
              const userRecord = await getUserByAuthId(session.user.id)
              
              if (!isMounted) return
              
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
              } else {
                useAuthStore.setState({
                  user: null,
                  session: null,
                  isAuthenticated: false,
                  isLoading: false,
                })
              }
            } catch {
              useAuthStore.setState({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
              })
            }
          }
        } else {
          useAuthStore.setState({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      }
    )

    // Safety timeout: ensure loading state is resolved
    const safetyTimeout = setTimeout(() => {
      if (!isMounted) return
      
      const { isLoading } = useAuthStore.getState()
      if (isLoading) {
        useAuthStore.setState({ isLoading: false })
      }
    }, 3000)

    // Cleanup
    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [])

  return <>{children}</>
}
