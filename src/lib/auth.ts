/**
 * Authentication helper functions
 * These functions handle user authentication, signup, login, logout, and session management
 */

import { supabase } from './supabase'
import { createUserRecord, getUserByAuthId, type User } from './db/users'
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  name: string
  surname: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: SupabaseUser | null
  session: Session | null
  error: AuthError | null
}

/**
 * Sign up a new user
 * Creates auth user and corresponding users table record
 */
export async function signUp(data: SignUpData): Promise<{
  user: SupabaseUser | null
  session: Session | null
  userRecord: User | null
  error: AuthError | null
}> {
  try {
    // Step 1: Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          surname: data.surname,
          phone: data.phone,
        },
      },
    })

    if (authError) {
      return {
        user: null,
        session: null,
        userRecord: null,
        error: authError,
      }
    }

    // Step 2: Create user record in users table
    // Only create if we have a user (email verification may delay this)
    // Note: With email verification enabled, user might be null until email is verified
    // In that case, we'll create the user record after email verification
    let userRecord: User | null = null
    if (authData.user) {
      try {
        userRecord = await createUserRecord(authData.user.id, {
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          role: 'client', // Default role for new signups
        })
      } catch (userError) {
        // If user record creation fails, we should handle this
        // For now, we'll return the auth user but log the error
        console.error('Failed to create user record:', userError)
        // Note: In production, you might want to rollback the auth user creation
        // or have a background job to create the user record
        // Alternatively, use a database trigger to auto-create user record on auth.users insert
      }
    }

    return {
      user: authData.user,
      session: authData.session,
      userRecord,
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      userRecord: null,
      error: error as AuthError,
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  return {
    user: authData.user,
    session: authData.session,
    error,
  }
}

/**
 * Sign out the current user
 * Clears session and local storage
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut()

  // Clear any local storage (even though persistSession is false, we ensure cleanup)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token')
  }

  return { error }
}

/**
 * Get current user with role from users table
 */
export async function getCurrentUser(): Promise<(User & { supabaseUser: SupabaseUser }) | null> {
  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (import.meta.env.DEV) {
      console.log('getCurrentUser - Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        sessionError: sessionError?.message,
      })
    }

    if (sessionError || !session?.user) {
      if (import.meta.env.DEV) {
        console.warn('getCurrentUser - No session or session error:', sessionError)
      }
      return null
    }

    // Get user record from users table
    if (import.meta.env.DEV) {
      console.log('getCurrentUser - Fetching user record for auth_user_id:', session.user.id)
    }
    
    const userRecord = await getUserByAuthId(session.user.id)

    if (import.meta.env.DEV) {
      console.log('getCurrentUser - User record result:', {
        found: !!userRecord,
        role: userRecord?.role,
        email: userRecord?.email,
      })
    }

    if (!userRecord) {
      if (import.meta.env.DEV) {
        console.warn('getCurrentUser - User record not found for auth_user_id:', session.user.id)
      }
      return null
    }

    return {
      ...userRecord,
      supabaseUser: session.user,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    if (import.meta.env.DEV) {
      console.error('getCurrentUser - Error details:', error)
    }
    return null
  }
}

/**
 * Get current session from Supabase
 */
export async function getSession(): Promise<Session | null> {
  try {
    if (import.meta.env.DEV) {
      console.log('getSession - Calling supabase.auth.getSession()...')
    }

    // Use a promise with timeout to prevent hanging
    const sessionPromise = supabase.auth.getSession()
    
    const result = await Promise.race([
      sessionPromise,
      new Promise<{ data: { session: null }; error: null }>((resolve) => {
        setTimeout(() => {
          if (import.meta.env.DEV) {
            console.warn('getSession - Timeout after 3 seconds')
          }
          resolve({ data: { session: null }, error: null })
        }, 3000)
      }),
    ])

    const {
      data: { session },
      error,
    } = result

    if (import.meta.env.DEV) {
      console.log('getSession - Result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        error: error?.message,
      })
    }

    if (error) {
      console.error('Error getting session:', error)
      if (import.meta.env.DEV) {
        console.error('getSession - Error details:', error)
      }
      return null
    }

    return session
  } catch (error) {
    console.error('getSession - Exception:', error)
    if (import.meta.env.DEV) {
      console.error('getSession - Exception details:', error)
    }
    return null
  }
}

/**
 * Verify email with token
 * Handles email verification callback
 */
export async function verifyEmail(token: string): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  })

  return {
    user: data.user,
    session: data.session,
    error,
  }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession()

  if (error) {
    console.error('Error refreshing session:', error)
    return null
  }

  return session
}

/**
 * Password reset response interface
 */
export interface PasswordResetResponse {
  success: boolean
  error: string | null
  message?: string
}

/**
 * Invite user data interface
 */
export interface InviteUserData {
  email: string
  name: string
  surname: string
  role: 'admin' | 'client'
}

/**
 * Invite user response interface
 */
export interface InviteUserResponse {
  success: boolean
  error: string | null
  message?: string
}

/**
 * Invite a user by email (admin only)
 * Sends an invitation email and creates a user record with the specified role
 * 
 * This function calls a Supabase Edge Function that securely handles the invitation
 * using the service role key on the backend.
 */
export async function inviteUserByEmail(
  data: InviteUserData
): Promise<InviteUserResponse> {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (!supabaseUrl) {
      return {
        success: false,
        error: 'Supabase URL not configured',
      }
    }

    // Get current session for authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'You must be logged in to invite users',
      }
    }

    // Call the Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/invite-user`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to send invitation',
      }
    }

    return {
      success: result.success,
      error: result.error,
      message: result.message || 'Invitation email sent successfully',
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Send password reset email to user
 * Uses Supabase's built-in resetPasswordForEmail functionality
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<PasswordResetResponse> {
  try {
    // Get the current origin for redirect URL
    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : '/reset-password'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      // Map Supabase errors to user-friendly messages
      let errorMessage = error.message

      // Handle specific error cases
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        errorMessage = 'Too many password reset requests. Please try again later.'
      } else if (error.message.includes('invalid') || error.message.includes('email')) {
        errorMessage = 'Invalid email address. Please check and try again.'
      } else if (error.message.includes('network') || error.status === 500) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
      error: null,
      message: 'Password reset email sent successfully',
    }
  } catch (error) {
    // Handle unexpected errors
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

