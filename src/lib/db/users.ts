/**
 * Database helper functions for users table
 * These functions interact with Supabase to manage user records
 */

import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  auth_user_id: string
  name: string
  surname: string
  email: string
  phone: string | null
  role: 'admin' | 'client'
  created_at: string
  updated_at: string
}

/**
 * Get user by auth_user_id with timeout
 */
export async function getUserByAuthId(
  authUserId: string
): Promise<User | null> {
  if (import.meta.env.DEV) {
    console.log('getUserByAuthId - Querying for auth_user_id:', authUserId)
  }

  // Create a timeout promise
  const timeoutMs = 5000
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`getUserByAuthId timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  // Create the query promise
  const queryPromise = supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single()

  try {
    // Race between query and timeout
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error) {
      if (import.meta.env.DEV) {
        console.error('getUserByAuthId - Error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
      }
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    if (import.meta.env.DEV) {
      console.log('getUserByAuthId - Success:', {
        id: data?.id,
        email: data?.email,
        role: data?.role,
      })
    }

    return data as User
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('getUserByAuthId - Exception:', error)
    }
    // Return null on timeout instead of throwing to prevent auth from breaking
    if (error instanceof Error && error.message.includes('timed out')) {
      console.warn('getUserByAuthId - Query timed out, returning null')
      return null
    }
    throw error
  }
}

/**
 * Get user role by auth_user_id
 */
export async function getUserRoleByAuthId(
  authUserId: string
): Promise<'admin' | 'client' | null> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', authUserId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data?.role as 'admin' | 'client' | null
}

/**
 * Create user record after Supabase auth signup
 */
export async function createUserRecord(
  authUserId: string,
  userData: {
    name: string
    surname: string
    email: string
    phone?: string
    role?: 'admin' | 'client'
  }
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      phone: userData.phone || null,
      role: userData.role || 'client',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as User
}

// ============================================
// Admin User Management Functions
// ============================================

export interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  totalClients: number
  recentSignups: number
  recentUsers: User[]
}

/**
 * Get all users from the database (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as User[]
}

/**
 * Update user information (admin only)
 */
export async function updateUser(
  userId: string,
  updates: {
    name?: string
    surname?: string
    email?: string
    phone?: string | null | undefined
  }
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('User not found')
    }
    throw error
  }

  return data as User
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: 'admin' | 'client'
): Promise<User> {
  if (newRole !== 'admin' && newRole !== 'client') {
    throw new Error('Invalid role. Must be "admin" or "client"')
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('User not found')
    }
    throw error
  }

  return data as User
}

/**
 * Delete user from the database (admin only)
 */
export async function deleteUser(userId: string): Promise<string> {
  const { error } = await supabase.from('users').delete().eq('id', userId)

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('User not found')
    }
    throw error
  }

  return userId
}

/**
 * Get dashboard statistics (admin only)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Get all users for statistics
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (usersError) {
    throw usersError
  }

  const allUsers = users as User[]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const totalUsers = allUsers.length
  const totalAdmins = allUsers.filter((u) => u.role === 'admin').length
  const totalClients = allUsers.filter((u) => u.role === 'client').length
  const recentSignups = allUsers.filter(
    (u) => new Date(u.created_at) >= sevenDaysAgo
  ).length
  const recentUsers = allUsers.slice(0, 10)

  return {
    totalUsers,
    totalAdmins,
    totalClients,
    recentSignups,
    recentUsers,
  }
}

