/**
 * Database helper functions for projects table
 * These functions interact with Supabase to manage project records
 */

import { supabase } from '@/lib/supabase'

export type ProjectStatus =
  | 'pending'
  | 'pending_payment'
  | 'pending_info'
  | 'in_progress'
  | 'in_testing'
  | 'completed'

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
  is_hiring_request: boolean
  deleted_at: string | null
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
  is_hiring_request?: boolean
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
  is_hiring_request?: boolean
  deleted_at?: string | null
}

/**
 * Get all projects from the database (admin only)
 * Excludes soft-deleted projects
 */
export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Project[]
}

/**
 * Get all published projects (public access)
 * Note: 'published' status is now 'completed' in the new status system
 * Excludes soft-deleted projects
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'completed')
    .is('deleted_at', null)
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
 * If created_by is provided (client), status defaults to 'pending'
 * If created_by is null (admin), status defaults to 'pending'
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
  let defaultStatus: ProjectStatus = 'pending'
  if (data.created_by) {
    // Client-created projects start as pending
    defaultStatus = 'pending'
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
      is_hiring_request: data.is_hiring_request ?? false,
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
 * Update project status with activity logging
 * Task Group 8: Project Status Management API
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: ProjectStatus,
  changedBy: string,
  reason?: string
): Promise<Project> {
  // Get current project to get old status
  const currentProject = await getProjectById(projectId)
  if (!currentProject) {
    throw new Error('Project not found')
  }

  const oldStatus = currentProject.status

  // Update project status
  const updatedProject = await updateProject(projectId, { status: newStatus })

  // Log activity
  try {
    const { logActivity } = await import('./activityLog')
    await logActivity(
      projectId,
      'project_status_changed',
      {
        old_status: oldStatus,
        new_status: newStatus,
        reason: reason || 'Status updated',
      },
      changedBy
    )
  } catch (e) {
    console.error('Failed to log status change activity:', e)
  }

  return updatedProject
}

/**
 * Soft-delete a project (sets deleted_at timestamp)
 * Task Group 8: Project Status Management API
 */
export async function softDeleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  // Get project to validate ownership and status
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  // Validate user owns the project
  if (project.created_by !== userId) {
    throw new Error('Unauthorized: You can only delete projects you created')
  }

  // Validate status is pending
  if (!['pending', 'pending_payment', 'pending_info'].includes(project.status)) {
    throw new Error('You can only delete projects with pending statuses')
  }

  // Soft-delete by setting deleted_at
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) {
    throw new Error(`Failed to soft-delete project: ${error.message}`)
  }

  // Log activity
  try {
    const { logActivity } = await import('./activityLog')
    await logActivity(
      projectId,
      'project_soft_deleted',
      {
        project_title: project.title,
      },
      userId
    )
  } catch (e) {
    console.error('Failed to log soft-delete activity:', e)
  }
}

/**
 * Hard-delete a project (permanently delete from database)
 * Task Group 8: Project Status Management API
 * Admin only - deletes project and all related data
 */
export async function hardDeleteProject(projectId: string): Promise<void> {
  // Delete related data first (CASCADE should handle most, but we'll be explicit)
  // Comments
  await supabase.from('project_comments').delete().eq('project_id', projectId)
  
  // Attachments
  await supabase.from('project_attachments').delete().eq('project_id', projectId)
  
  // Phases (CASCADE will delete tasks)
  await supabase.from('project_phases').delete().eq('project_id', projectId)
  
  // Finally delete the project
  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) {
    throw new Error(`Failed to hard-delete project: ${error.message}`)
  }

  // Log activity (before deletion, so we need project info)
  try {
    const { logActivity } = await import('./activityLog')
    // Note: We can't get project info after deletion, so we log with minimal info
    await logActivity(
      projectId,
      'project_hard_deleted',
      {
        project_id: projectId,
      }
    )
  } catch (e) {
    console.error('Failed to log hard-delete activity:', e)
  }
}

/**
 * Get projects filtered by status group
 * Task Group 8: Project Status Management API
 */
export async function getProjectsByStatusGroup(
  statusGroup: 'pending' | 'active' | 'completed'
): Promise<Project[]> {
  let statuses: ProjectStatus[]

  switch (statusGroup) {
    case 'pending':
      statuses = ['pending', 'pending_payment', 'pending_info']
      break
    case 'active':
      statuses = ['in_progress', 'in_testing']
      break
    case 'completed':
      statuses = ['completed']
      break
    default:
      statuses = []
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*, client:users!projects_client_id_fkey(id, name, surname, email)')
    .in('status', statuses)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as Project[]
}

/**
 * Clone a project (create new project based on existing one)
 * Task Group 10: Project Cloning API
 */
export async function cloneProject(
  projectId: string,
  userId: string
): Promise<Project> {
  // Get original project
  const originalProject = await getProjectById(projectId)
  if (!originalProject) {
    throw new Error('Project not found')
  }

  // Validate user owns the project
  if (originalProject.created_by !== userId) {
    throw new Error('Unauthorized: You can only clone projects you created')
  }

  // Create new project with copied fields
  const newProject = await createProject({
    title: `${originalProject.title} (Copy)`,
    description: originalProject.description,
    category: originalProject.category,
    tech: originalProject.tech,
    client_name: originalProject.client_name,
    client_id: originalProject.client_id,
    is_hiring_request: originalProject.is_hiring_request,
    status: 'pending',
    created_by: userId,
  })

  // Log activity
  try {
    const { logActivity } = await import('./activityLog')
    await logActivity(
      newProject.id,
      'project_cloned',
      {
        original_project_id: projectId,
        new_project_id: newProject.id,
        original_project_title: originalProject.title,
      },
      userId
    )
  } catch (e) {
    console.error('Failed to log clone activity:', e)
  }

  return newProject
}

/**
 * Mark deposit as paid and update project status to in_progress
 */
export async function markDepositPaid(
  projectId: string,
  invoiceId: string
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      status: 'in_progress',
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
 * Excludes soft-deleted projects
 */
export async function getProjectsByStatus(
  status: ProjectStatus
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:users!projects_client_id_fkey(id, name, surname, email)')
    .eq('status', status)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as Project[]
}

