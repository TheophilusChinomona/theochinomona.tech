/**
 * ProtectedRoute component
 * Wraps routes that require authentication and optionally specific roles
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'client'
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Debug logging in development (only log when there's an issue)
  if (import.meta.env.DEV && !isLoading && (!isAuthenticated || !user || (requiredRole && user.role !== requiredRole))) {
    console.log('ProtectedRoute Debug:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userRole: user?.role,
      requiredRole,
      roleMatch: requiredRole ? user?.role === requiredRole : true,
      currentPath: location.pathname,
    })
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    if (import.meta.env.DEV) {
      console.warn('ProtectedRoute: Not authenticated, redirecting to login')
    }
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Check role if requiredRole is specified
  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have the required role, redirect to home
    if (import.meta.env.DEV) {
      console.warn(
        `ProtectedRoute: User role (${user.role}) doesn't match required role (${requiredRole}), redirecting to home`
      )
    }
    return <Navigate to="/" replace />
  }

  // User is authenticated and has required role (if specified)
  return <>{children}</>
}

