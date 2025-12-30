/**
 * useAuth hook
 * Convenience hook for accessing auth state and actions
 */

import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  } = useAuthStore()

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,

    // Actions
    signIn,
    signUp,
    signOut,
  }
}

