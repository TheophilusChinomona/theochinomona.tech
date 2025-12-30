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
 * Get user by auth_user_id
 * Simple query with timeout fallback
 */
export async function getUserByAuthId(
  authUserId: string
): Promise<User | null> {
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    })

    // Create the query promise
    const queryPromise = supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    // Race between query and timeout
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])

    if (error) {
      return null
    }

    return data as User | null
  } catch {
    return null
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
 * Get all client users from the database (admin only)
 * Returns users with role='client' for project assignment
 */
export async function getClientUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('name', { ascending: true })

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
 * Uses Edge Function to properly delete from both auth.users and public.users
 */
export async function deleteUser(userId: string): Promise<string> {
  // Get Supabase URL from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }

  // Get current session for authentication
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error('You must be logged in to delete users')
  }

  // Call the Edge Function
  const functionUrl = `${supabaseUrl}/functions/v1/delete-user`

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ userId }),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to delete user')
  }

  return userId
}

/**
 * Update user profile (for users updating their own profile)
 * Allows updating name, surname, and phone
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string
    surname?: string
    phone?: string | null
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
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data as User
}

/**
 * Change user password
 * Uses Supabase auth API to update password
 */
export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(`Failed to change password: ${error.message}`)
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data as User | null
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

