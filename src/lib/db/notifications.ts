/**
 * Database helper functions for notifications
 * Task Group 6: Database Functions - Core
 */

import { supabase } from '@/lib/supabase'
import type { Notification, NotificationType } from './types/dashboard'

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification> {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data: data ?? null,
      read: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return notification as Notification
}

/**
 * Get notifications for a user
 * Optionally filter to only unread notifications
 */
export async function getNotificationsForUser(
  userId: string,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get notifications: ${error.message}`)
  }

  return data as Notification[]
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`)
  }

  return count ?? 0
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }
}

/**
 * Delete all notifications for a user
 */
export async function deleteAllNotifications(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete all notifications: ${error.message}`)
  }
}

/**
 * Get notifications by type for a user
 */
export async function getNotificationsByType(
  userId: string,
  type: NotificationType,
  limit: number = 50
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get notifications by type: ${error.message}`)
  }

  return data as Notification[]
}

// ============================================
// Phase Completion Notification Functions
// (Used by tracking system for email notifications)
// ============================================

interface PhaseCompletionNotificationParams {
  projectId: string
  phaseId: string
  phaseName: string
  trackingCode: string
}

interface NotificationResult {
  success: boolean
  emailsSent?: number
  error?: string
}

/**
 * Send phase completion notification via edge function
 * This triggers email notifications to subscribed users
 */
export async function sendPhaseCompletionNotification(
  params: PhaseCompletionNotificationParams
): Promise<NotificationResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'send-phase-notification',
      {
        body: {
          projectId: params.projectId,
          phaseId: params.phaseId,
          phaseName: params.phaseName,
          trackingCode: params.trackingCode,
        },
      }
    )

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      emailsSent: data?.emailsSent ?? 0,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Check if notifications are enabled for a project
 */
export async function isProjectNotificationsEnabled(
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('projects')
    .select('notifications_enabled')
    .eq('id', projectId)
    .single()

  if (error) {
    // Project not found or other error - default to false
    return false
  }

  // Default to true if field is null
  return data?.notifications_enabled ?? true
}

/**
 * Update notification settings for a project
 */
export async function updateProjectNotificationsEnabled(
  projectId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      notifications_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    throw new Error(`Failed to update notification settings: ${error.message}`)
  }
}

