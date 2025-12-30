/**
 * TypeScript interfaces for Client Dashboard Experience
 * Task Group 6: Database Functions - Core
 */

// ============================================================================
// User Preferences Types
// ============================================================================

export type ThemePreference = 'light' | 'dark' | 'system'

export interface UserPreferences {
  id: string
  user_id: string
  theme: ThemePreference
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferencesInput {
  theme?: ThemePreference
  email_notifications?: boolean
}

// Default preferences for users without saved preferences
export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  email_notifications: true,
}

// ============================================================================
// Activity Log Types
// ============================================================================

export type ActivityLogEventType =
  | 'phase_completed'
  | 'phase_started'
  | 'task_updated'
  | 'note_added'
  | 'file_uploaded'
  | 'project_created'
  | 'project_completed'
  | 'invoice_created'
  | 'invoice_sent'
  | 'payment_received'
  | 'refund_processed'

export interface ActivityLogEntry {
  id: string
  user_id: string | null
  project_id: string
  event_type: ActivityLogEventType
  event_data: Record<string, unknown>
  created_at: string
}

export interface ActivityLogInput {
  project_id: string
  event_type: ActivityLogEventType
  event_data?: Record<string, unknown>
  user_id?: string
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'project_update'
  | 'phase_complete'
  | 'task_update'
  | 'note_added'
  | 'file_uploaded'
  | 'release_note'
  | 'system'
  | 'invoice_sent'
  | 'payment_received'
  | 'payment_failed'
  | 'invoice_overdue'
  | 'refund_processed'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

export interface NotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
}

// ============================================================================
// Release Notes Types
// ============================================================================

export type ReleaseNoteTargetType = 'all' | 'group' | 'specific'

export interface ReleaseNote {
  id: string
  title: string
  content: string
  target_type: ReleaseNoteTargetType
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ReleaseNoteWithReadStatus extends ReleaseNote {
  is_read: boolean
  read_at: string | null
}

export interface ReleaseNoteInput {
  title: string
  content: string
  target_type?: ReleaseNoteTargetType
}

export interface ReleaseNoteTarget {
  id: string
  release_note_id: string
  target_type: 'group' | 'user'
  target_id: string
  created_at: string
}

export interface ReleaseNoteRead {
  id: string
  release_note_id: string
  user_id: string
  read_at: string
}

// ============================================================================
// Client Groups Types
// ============================================================================

export interface ClientGroup {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ClientGroupWithMemberCount extends ClientGroup {
  member_count: number
}

export interface ClientGroupInput {
  name: string
  description?: string
}

export interface ClientGroupMember {
  id: string
  group_id: string
  user_id: string
  created_at: string
}


