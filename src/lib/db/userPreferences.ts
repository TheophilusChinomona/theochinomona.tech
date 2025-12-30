/**
 * Database helper functions for user preferences
 * Task Group 6: Database Functions - Core
 */

import { supabase } from '@/lib/supabase'
import type { UserPreferences, UserPreferencesInput, ThemePreference } from './types/dashboard'
import { DEFAULT_USER_PREFERENCES } from './types/dashboard'

/**
 * Get user preferences by user ID
 * Returns default preferences if none exist
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get user preferences: ${error.message}`)
  }

  // If no preferences exist, return defaults with the user_id
  if (!data) {
    return {
      id: '',
      user_id: userId,
      ...DEFAULT_USER_PREFERENCES,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return data as UserPreferences
}

/**
 * Update user preferences (upsert)
 * Creates preferences if they don't exist, updates if they do
 */
export async function updateUserPreferences(
  userId: string,
  updates: UserPreferencesInput
): Promise<UserPreferences> {
  // First check if preferences exist
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Update existing preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user preferences: ${error.message}`)
    }

    return data as UserPreferences
  } else {
    // Create new preferences
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        theme: updates.theme ?? DEFAULT_USER_PREFERENCES.theme,
        email_notifications: updates.email_notifications ?? DEFAULT_USER_PREFERENCES.email_notifications,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user preferences: ${error.message}`)
    }

    return data as UserPreferences
  }
}

/**
 * Update user theme preference
 * Convenience function for just updating theme
 */
export async function updateUserTheme(
  userId: string,
  theme: ThemePreference
): Promise<UserPreferences> {
  return updateUserPreferences(userId, { theme })
}

/**
 * Update user email notification preference
 * Convenience function for just updating email notifications
 */
export async function updateEmailNotifications(
  userId: string,
  emailNotifications: boolean
): Promise<UserPreferences> {
  return updateUserPreferences(userId, { email_notifications: emailNotifications })
}


