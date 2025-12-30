/**
 * Database helper functions for tracking codes and project tracking
 * These functions interact with Supabase to manage tracking-related records
 */

import { supabase } from '@/lib/supabase'
import type { Project } from './projects'

// ============================================================================
// Type Definitions
// ============================================================================

export type PhaseStatus = 'pending' | 'in_progress' | 'completed'
export type AttachmentType = 'image' | 'pdf' | 'video_embed'

export interface TrackingCode {
  id: string
  project_id: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectPhase {
  id: string
  project_id: string
  name: string
  description: string
  sort_order: number
  estimated_start_date: string | null
  estimated_end_date: string | null
  actual_start_date: string | null
  actual_end_date: string | null
  status: PhaseStatus
  notify_on_complete: boolean
  estimated_cost: number | null // Amount in cents
  created_at: string
  updated_at: string
}

export interface ProjectTask {
  id: string
  phase_id: string
  name: string
  description: string | null
  sort_order: number
  completion_percentage: number
  developer_notes: string | null
  estimated_cost: number | null // Amount in cents
  created_at: string
  updated_at: string
}

export interface ProjectAttachment {
  id: string
  project_id: string
  phase_id: string | null
  task_id: string | null
  file_url: string
  file_type: AttachmentType
  file_name: string
  created_at: string
}

export interface ClientNotificationPreference {
  id: string
  tracking_code_id: string
  email: string
  opted_in: boolean
  created_at: string
  updated_at: string
}

export interface ProjectWithDetails extends Project {
  tracking_code: TrackingCode | null
  phases: (ProjectPhase & { tasks: ProjectTask[] })[]
  attachments: ProjectAttachment[]
}

// ============================================================================
// Tracking Code Functions
// ============================================================================

/**
 * Get project with all details by tracking code
 * Returns null if code is invalid or inactive
 */
export async function getProjectByTrackingCode(
  code: string
): Promise<ProjectWithDetails | null> {
  // First, find the tracking code
  const { data: trackingCode, error: trackingError } = await supabase
    .from('tracking_codes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (trackingError || !trackingCode) {
    return null
  }

  // Get the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', trackingCode.project_id)
    .single()

  if (projectError || !project) {
    return null
  }

  // Get phases with tasks
  const { data: phases, error: phasesError } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', trackingCode.project_id)
    .order('sort_order', { ascending: true })

  if (phasesError) {
    throw phasesError
  }

  // Get all tasks for all phases
  const phaseIds = (phases || []).map((p) => p.id)
  let tasks: ProjectTask[] = []

  if (phaseIds.length > 0) {
    const { data: tasksData, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .in('phase_id', phaseIds)
      .order('sort_order', { ascending: true })

    if (tasksError) {
      throw tasksError
    }

    tasks = tasksData || []
  }

  // Get attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('project_id', trackingCode.project_id)
    .order('created_at', { ascending: false })

  if (attachmentsError) {
    throw attachmentsError
  }

  // Group tasks by phase
  const phasesWithTasks = (phases || []).map((phase) => ({
    ...phase,
    tasks: tasks.filter((task) => task.phase_id === phase.id),
  }))

  return {
    ...project,
    tracking_code: trackingCode,
    phases: phasesWithTasks,
    attachments: attachments || [],
  } as ProjectWithDetails
}

/**
 * Get tracking code by project ID
 * Returns the active tracking code for a project
 */
export async function getTrackingCodeByProjectId(
  projectId: string
): Promise<TrackingCode | null> {
  const { data, error } = await supabase
    .from('tracking_codes')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as TrackingCode
}

/**
 * Regenerate tracking code for a project
 * Deactivates old code and creates a new one
 * Uses the database function for atomic operation
 */
export async function regenerateTrackingCode(
  projectId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_tracking_code', {
    p_project_id: projectId,
  })

  if (error) {
    throw new Error(`Failed to regenerate tracking code: ${error.message}`)
  }

  return data as string
}

/**
 * Get all tracking codes for a project (including inactive)
 * Admin only
 */
export async function getAllTrackingCodesByProjectId(
  projectId: string
): Promise<TrackingCode[]> {
  const { data, error } = await supabase
    .from('tracking_codes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as TrackingCode[]
}

// ============================================================================
// Notification Preference Functions
// ============================================================================

/**
 * Get all notification preferences for a tracking code
 */
export async function getNotificationPreferences(
  trackingCodeId: string
): Promise<ClientNotificationPreference[]> {
  const { data, error } = await supabase
    .from('client_notification_preferences')
    .select('*')
    .eq('tracking_code_id', trackingCodeId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as ClientNotificationPreference[]
}

/**
 * Get opted-in notification preferences for a tracking code
 */
export async function getOptedInNotificationPreferences(
  trackingCodeId: string
): Promise<ClientNotificationPreference[]> {
  const { data, error } = await supabase
    .from('client_notification_preferences')
    .select('*')
    .eq('tracking_code_id', trackingCodeId)
    .eq('opted_in', true)

  if (error) {
    throw error
  }

  return data as ClientNotificationPreference[]
}

/**
 * Upsert notification preference
 * Creates or updates based on tracking_code_id + email combination
 */
export async function upsertNotificationPreference(
  trackingCodeId: string,
  email: string,
  optedIn: boolean
): Promise<ClientNotificationPreference> {
  const { data, error } = await supabase
    .from('client_notification_preferences')
    .upsert(
      {
        tracking_code_id: trackingCodeId,
        email: email.toLowerCase().trim(),
        opted_in: optedIn,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'tracking_code_id,email',
      }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update notification preference: ${error.message}`)
  }

  return data as ClientNotificationPreference
}


