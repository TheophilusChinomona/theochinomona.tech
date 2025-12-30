/**
 * Database helper functions for release notes
 * Task Group 7: Database Functions - Release Notes & Groups
 */

import { supabase } from '@/lib/supabase'
import type {
  ReleaseNote,
  ReleaseNoteWithReadStatus,
  ReleaseNoteInput,
  ReleaseNoteTarget,
} from './types/dashboard'

// ============================================================================
// Release Notes CRUD Functions
// ============================================================================

/**
 * Create a new release note (draft by default)
 */
export async function createReleaseNote(
  input: ReleaseNoteInput
): Promise<ReleaseNote> {
  const { data, error } = await supabase
    .from('release_notes')
    .insert({
      title: input.title,
      content: input.content,
      target_type: input.target_type ?? 'all',
      is_published: false,
      published_at: null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create release note: ${error.message}`)
  }

  return data as ReleaseNote
}

/**
 * Update a release note
 */
export async function updateReleaseNote(
  id: string,
  updates: Partial<ReleaseNoteInput>
): Promise<ReleaseNote> {
  const { data, error } = await supabase
    .from('release_notes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update release note: ${error.message}`)
  }

  return data as ReleaseNote
}

/**
 * Publish a release note
 * Sets is_published to true and published_at to now
 */
export async function publishReleaseNote(id: string): Promise<ReleaseNote> {
  const { data, error } = await supabase
    .from('release_notes')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to publish release note: ${error.message}`)
  }

  return data as ReleaseNote
}

/**
 * Unpublish a release note
 */
export async function unpublishReleaseNote(id: string): Promise<ReleaseNote> {
  const { data, error } = await supabase
    .from('release_notes')
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to unpublish release note: ${error.message}`)
  }

  return data as ReleaseNote
}

/**
 * Delete a release note
 * Also deletes associated targets and reads (via CASCADE)
 */
export async function deleteReleaseNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('release_notes')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete release note: ${error.message}`)
  }
}

/**
 * Get a release note by ID
 */
export async function getReleaseNoteById(id: string): Promise<ReleaseNote | null> {
  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to get release note: ${error.message}`)
  }

  return data as ReleaseNote | null
}

/**
 * Get all release notes (admin view)
 * Returns all notes regardless of published status
 */
export async function getAllReleaseNotes(): Promise<ReleaseNote[]> {
  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get all release notes: ${error.message}`)
  }

  return data as ReleaseNote[]
}

/**
 * Get published release notes targeted to a specific user
 * Uses the RLS policy which calls can_user_see_release_note function
 */
export async function getReleaseNotesForUser(
  userId: string
): Promise<ReleaseNoteWithReadStatus[]> {
  // Get all published release notes the user can see
  const { data: notes, error: notesError } = await supabase
    .from('release_notes')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (notesError) {
    throw new Error(`Failed to get release notes for user: ${notesError.message}`)
  }

  if (!notes || notes.length === 0) {
    return []
  }

  // Get read status for these notes
  const noteIds = notes.map((n) => n.id)
  const { data: reads, error: readsError } = await supabase
    .from('release_note_reads')
    .select('*')
    .eq('user_id', userId)
    .in('release_note_id', noteIds)

  if (readsError) {
    throw new Error(`Failed to get read status: ${readsError.message}`)
  }

  const readMap = new Map(reads?.map((r) => [r.release_note_id, r.read_at]) ?? [])

  // Combine notes with read status
  return notes.map((note) => ({
    ...note,
    is_read: readMap.has(note.id),
    read_at: readMap.get(note.id) ?? null,
  })) as ReleaseNoteWithReadStatus[]
}

/**
 * Mark a release note as read for a user
 */
export async function markReleaseNoteRead(
  releaseNoteId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('release_note_reads')
    .upsert(
      {
        release_note_id: releaseNoteId,
        user_id: userId,
        read_at: new Date().toISOString(),
      },
      {
        onConflict: 'release_note_id,user_id',
      }
    )

  if (error) {
    throw new Error(`Failed to mark release note as read: ${error.message}`)
  }
}

/**
 * Get unread release notes count for a user
 */
export async function getUnreadReleaseNotesCount(userId: string): Promise<number> {
  // Get all published notes the user can see
  const { data: notes, error: notesError } = await supabase
    .from('release_notes')
    .select('id')
    .eq('is_published', true)

  if (notesError) {
    throw new Error(`Failed to get release notes: ${notesError.message}`)
  }

  if (!notes || notes.length === 0) {
    return 0
  }

  // Get read notes for this user
  const { data: reads, error: readsError } = await supabase
    .from('release_note_reads')
    .select('release_note_id')
    .eq('user_id', userId)

  if (readsError) {
    throw new Error(`Failed to get read status: ${readsError.message}`)
  }

  const readNoteIds = new Set(reads?.map((r) => r.release_note_id) ?? [])
  const unreadCount = notes.filter((n) => !readNoteIds.has(n.id)).length

  return unreadCount
}

// ============================================================================
// Release Note Targeting Functions
// ============================================================================

/**
 * Set targets for a release note
 * Replaces all existing targets with new ones
 */
export async function setReleaseNoteTargets(
  releaseNoteId: string,
  targets: Array<{ type: 'group' | 'user'; id: string }>
): Promise<void> {
  // Delete existing targets
  const { error: deleteError } = await supabase
    .from('release_note_targets')
    .delete()
    .eq('release_note_id', releaseNoteId)

  if (deleteError) {
    throw new Error(`Failed to clear existing targets: ${deleteError.message}`)
  }

  // Insert new targets if any
  if (targets.length > 0) {
    const targetRecords = targets.map((t) => ({
      release_note_id: releaseNoteId,
      target_type: t.type,
      target_id: t.id,
    }))

    const { error: insertError } = await supabase
      .from('release_note_targets')
      .insert(targetRecords)

    if (insertError) {
      throw new Error(`Failed to set targets: ${insertError.message}`)
    }
  }
}

/**
 * Get targets for a release note
 */
export async function getReleaseNoteTargets(
  releaseNoteId: string
): Promise<ReleaseNoteTarget[]> {
  const { data, error } = await supabase
    .from('release_note_targets')
    .select('*')
    .eq('release_note_id', releaseNoteId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get release note targets: ${error.message}`)
  }

  return data as ReleaseNoteTarget[]
}

/**
 * Add a single target to a release note
 */
export async function addReleaseNoteTarget(
  releaseNoteId: string,
  targetType: 'group' | 'user',
  targetId: string
): Promise<void> {
  const { error } = await supabase
    .from('release_note_targets')
    .insert({
      release_note_id: releaseNoteId,
      target_type: targetType,
      target_id: targetId,
    })

  if (error) {
    // Ignore duplicate errors (unique constraint)
    if (error.code !== '23505') {
      throw new Error(`Failed to add target: ${error.message}`)
    }
  }
}

/**
 * Remove a target from a release note
 */
export async function removeReleaseNoteTarget(
  releaseNoteId: string,
  targetType: 'group' | 'user',
  targetId: string
): Promise<void> {
  const { error } = await supabase
    .from('release_note_targets')
    .delete()
    .eq('release_note_id', releaseNoteId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)

  if (error) {
    throw new Error(`Failed to remove target: ${error.message}`)
  }
}


