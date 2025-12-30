/**
 * API Auth Middleware
 * Middleware functions for protecting API routes and verifying authentication
 * 
 * Note: This is a client-side structure. For server-side API routes (Node.js/Express),
 * these patterns should be adapted to work with Express middleware.
 */

import { supabase } from '@/lib/supabase'
import { getUserRoleByAuthId } from '@/lib/db/users'
import type { Session } from '@supabase/supabase-js'

export interface AuthContext {
  userId: string
  role: 'admin' | 'client'
  session: Session
}

/**
 * Verify JWT token from request
 * This is a client-side helper. For server-side, extract token from Authorization header
 */
export async function verifyToken(token: string): Promise<{
  userId: string | null
  error: Error | null
}> {
  try {
    // In a server-side implementation, you would verify the JWT token
    // For client-side, we use Supabase's session verification
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        userId: null,
        error: error || new Error('Invalid token'),
      }
    }

    return {
      userId: user.id,
      error: null,
    }
  } catch (error) {
    return {
      userId: null,
      error: error as Error,
    }
  }
}

/**
 * Check user role from users table
 */
export async function checkUserRole(
  userId: string
): Promise<'admin' | 'client' | null> {
  return await getUserRoleByAuthId(userId)
}

/**
 * Create auth context from session
 * Used for client-side route protection
 */
export async function createAuthContext(session: Session): Promise<AuthContext | null> {
  try {
    const role = await getUserRoleByAuthId(session.user.id)

    if (!role) {
      return null
    }

    return {
      userId: session.user.id,
      role,
      session,
    }
  } catch (error) {
    console.error('Error creating auth context:', error)
    return null
  }
}

/**
 * Verify user has required role
 */
export async function verifyRole(
  userId: string,
  requiredRole: 'admin' | 'client'
): Promise<boolean> {
  const role = await checkUserRole(userId)

  if (!role) {
    return false
  }

  // Admins can access client routes, but clients cannot access admin routes
  if (requiredRole === 'client') {
    return role === 'client' || role === 'admin'
  }

  if (requiredRole === 'admin') {
    return role === 'admin'
  }

  return false
}

/**
 * Server-side middleware pattern (for Express/Node.js backend)
 * This is a template for when server-side API routes are implemented
 */
export interface ServerAuthMiddleware {
  /**
   * Verify JWT from Authorization header
   * Example Express middleware:
   * 
   * ```typescript
   * export async function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
   *   const token = req.headers.authorization?.replace('Bearer ', '')
   *   if (!token) {
   *     return res.status(401).json({ error: 'No token provided' })
   *   }
   *   
   *   const { userId, error } = await verifyToken(token)
   *   if (error || !userId) {
   *     return res.status(401).json({ error: 'Invalid token' })
   *   }
   *   
   *   req.userId = userId
   *   next()
   * }
   * ```
   */
  verifyAuthToken: 'See implementation pattern above'

  /**
   * Protect route based on role requirements
   * Example Express middleware:
   * 
   * ```typescript
   * export function requireRole(requiredRole: 'admin' | 'client') {
   *   return async (req: Request, res: Response, next: NextFunction) => {
   *     const userId = req.userId
   *     if (!userId) {
   *       return res.status(401).json({ error: 'Unauthorized' })
   *     }
   *     
   *     const hasRole = await verifyRole(userId, requiredRole)
   *     if (!hasRole) {
   *       return res.status(403).json({ error: 'Forbidden' })
   *     }
   *     
   *     next()
   *   }
   * }
   * ```
   */
  requireRole: 'See implementation pattern above'
}

