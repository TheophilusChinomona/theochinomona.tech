/**
 * Database helper functions for projects table
 * These functions interact with Supabase to manage project records
 */

import { supabase } from '@/lib/supabase'

export type ProjectStatus =
  | 'draft'
  | 'published'
  | 'pending_approval'
  | 'awaiting_payment'
  | 'approved'
  | 'denied'

export type PaymentPreference = 'upfront_deposit' | 'milestone_based'

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  category: string
  thumbnail: string | null
  client_name: string | null
  client_id: string | null
  project_url: string | null
  github_url: string | null
  completion_date: string | null
  featured: boolean
  status: ProjectStatus
  notifications_enabled: boolean
  created_by: string | null
  payment_preference: PaymentPreference | null
  requires_payment: boolean | null
  deposit_paid: boolean
  invoice_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  title: string
  description: string
  tech: string[]
  category: string
  thumbnail?: string | null
  client_name?: string | null
  client_id?: string | null
  project_url?: string | null
  github_url?: string | null
  completion_date?: string | null
  featured?: boolean
  status?: ProjectStatus
  notifications_enabled?: boolean
  created_by?: string | null
  payment_preference?: PaymentPreference | null
  requires_payment?: boolean | null
  deposit_paid?: boolean
  invoice_id?: string | null
}

export interface UpdateProjectInput {
  title?: string
  description?: string
  tech?: string[]
  category?: string
  thumbnail?: string | null
  client_name?: string | null
  client_id?: string | null
  project_url?: string | null
  github_url?: string | null
  completion_date?: string | null
  featured?: boolean
  status?: ProjectStatus
  notifications_enabled?: boolean
  created_by?: string | null
  payment_preference?: PaymentPreference | null
  requires_payment?: boolean | null
  deposit_paid?: boolean
  invoice_id?: string | null
}

/**
 * Get all projects from the database (admin only)
 */
export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Project[]
}

/**
 * Get all published projects (public access)
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Project[]
}

/**
 * Get project by ID
 * Admins can access all projects, public can only access published projects
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data as Project
}

/**
 * Create a new project (admin or client)
 * If created_by is provided (client), status defaults to 'pending_approval'
 * If created_by is null (admin), status defaults to 'draft'
 */
export async function createProject(data: CreateProjectInput): Promise<Project> {
  // Validate required fields
  if (!data.title || !data.description) {
    throw new Error('Title and description are required')
  }

  if (!data.tech || !Array.isArray(data.tech) || data.tech.length === 0) {
    throw new Error('Tech array must contain at least one item')
  }

  if (!data.category) {
    throw new Error('Category is required')
  }

  // Determine default status based on who created it
  let defaultStatus: ProjectStatus = 'draft'
  if (data.created_by) {
    // Client-created projects start as pending_approval
    defaultStatus = 'pending_approval'
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      description: data.description,
      tech: data.tech,
      category: data.category,
      thumbnail: data.thumbnail || null,
      client_name: data.client_name || null,
      client_id: data.client_id || null,
      project_url: data.project_url || null,
      github_url: data.github_url || null,
      completion_date: data.completion_date || null,
      featured: data.featured ?? false,
      status: data.status || defaultStatus,
      notifications_enabled: data.notifications_enabled ?? true,
      created_by: data.created_by || null,
      payment_preference: data.payment_preference || null,
      requires_payment: data.requires_payment ?? null,
      deposit_paid: data.deposit_paid ?? false,
      invoice_id: data.invoice_id || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return project as Project
}

/**
 * Update an existing project (admin only)
 */
export async function updateProject(
  id: string,
  updates: UpdateProjectInput
): Promise<Project> {
  // Validate tech array if provided
  if (updates.tech !== undefined) {
    if (!Array.isArray(updates.tech) || updates.tech.length === 0) {
      throw new Error('Tech array must contain at least one item')
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Project not found')
    }
    throw error
  }

  return data as Project
}

/**
 * Delete a project from the database (admin only)
 */
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Project not found')
    }
    throw error
  }
}

/**
 * Delete multiple projects by IDs (admin only)
 */
export async function bulkDeleteProjects(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) {
    throw new Error('At least one project ID is required')
  }

  const { error } = await supabase.from('projects').delete().in('id', ids)

  if (error) {
    throw error
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  metadata?: Record<string, unknown>
): Promise<Project> {
  const updates: UpdateProjectInput = {
    status,
    ...metadata,
  }

  return updateProject(projectId, updates)
}

/**
 * Mark deposit as paid and update project status to approved
 */
export async function markDepositPaid(
  projectId: string,
  invoiceId: string
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      status: 'approved',
      deposit_paid: true,
      invoice_id: invoiceId,
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Project not found')
    }
    throw error
  }

  return data as Project
}

/**
 * Get projects filtered by status
 */
export async function getProjectsByStatus(
  status: ProjectStatus
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:users!projects_client_id_fkey(id, name, surname, email)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as Project[]
}

