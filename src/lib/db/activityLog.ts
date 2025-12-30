/**
 * Database helper functions for activity log
 * Task Group 6: Database Functions - Core
 */

import { supabase } from '@/lib/supabase'
import type { ActivityLogEntry, ActivityLogEventType } from './types/dashboard'

/**
 * Log an activity event for a project
 */
export async function logActivity(
  projectId: string,
  eventType: ActivityLogEventType,
  eventData: Record<string, unknown> = {},
  userId?: string
): Promise<ActivityLogEntry> {
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      project_id: projectId,
      event_type: eventType,
      event_data: eventData,
      user_id: userId ?? null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to log activity: ${error.message}`)
  }

  return data as ActivityLogEntry
}

/**
 * Get activity log for a specific project
 * Returns entries in reverse chronological order
 */
export async function getActivityLogForProject(
  projectId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get activity log for project: ${error.message}`)
  }

  return data as ActivityLogEntry[]
}

/**
 * Get activity log for all projects assigned to a user (as client)
 * Returns entries in reverse chronological order
 */
export async function getActivityLogForUser(
  userId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  // First get all projects where user is the client
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id')
    .eq('client_id', userId)

  if (projectsError) {
    throw new Error(`Failed to get user projects: ${projectsError.message}`)
  }

  if (!projects || projects.length === 0) {
    return []
  }

  const projectIds = projects.map((p) => p.id)

  // Get activity log for those projects
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get activity log for user: ${error.message}`)
  }

  return data as ActivityLogEntry[]
}

/**
 * Get recent activity log entries across all projects (admin)
 * Returns entries in reverse chronological order
 */
export async function getRecentActivityLog(
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get recent activity log: ${error.message}`)
  }

  return data as ActivityLogEntry[]
}

/**
 * Get activity log entries by event type
 */
export async function getActivityLogByEventType(
  eventType: ActivityLogEventType,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('event_type', eventType)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get activity log by event type: ${error.message}`)
  }

  return data as ActivityLogEntry[]
}


