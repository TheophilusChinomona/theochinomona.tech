/**
 * Database helper functions for project phases
 * These functions interact with Supabase to manage phase records
 */

import { supabase } from '@/lib/supabase'
import type { PhaseStatus, ProjectPhase } from './tracking'

export interface CreatePhaseInput {
  project_id: string
  name: string
  description?: string
  estimated_start_date?: string | null
  estimated_end_date?: string | null
  actual_start_date?: string | null
  actual_end_date?: string | null
  status?: PhaseStatus
  notify_on_complete?: boolean
}

export interface UpdatePhaseInput {
  name?: string
  description?: string
  estimated_start_date?: string | null
  estimated_end_date?: string | null
  actual_start_date?: string | null
  actual_end_date?: string | null
  status?: PhaseStatus
  notify_on_complete?: boolean
}

/**
 * Get all phases for a project, ordered by sort_order
 */
export async function getPhasesByProjectId(
  projectId: string
): Promise<ProjectPhase[]> {
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data as ProjectPhase[]
}

/**
 * Get a single phase by ID
 */
export async function getPhaseById(id: string): Promise<ProjectPhase | null> {
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as ProjectPhase
}

/**
 * Create a new phase
 * Automatically sets sort_order to be last in the project
 */
export async function createPhase(
  input: CreatePhaseInput
): Promise<ProjectPhase> {
  // Validate required fields
  if (!input.project_id) {
    throw new Error('Project ID is required')
  }

  if (!input.name || input.name.trim() === '') {
    throw new Error('Phase name is required')
  }

  // Get the current max sort_order for this project
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from('project_phases')
    .select('sort_order')
    .eq('project_id', input.project_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  let nextSortOrder = 0
  if (!maxOrderError && maxOrderData) {
    nextSortOrder = maxOrderData.sort_order + 1
  }

  const { data, error } = await supabase
    .from('project_phases')
    .insert({
      project_id: input.project_id,
      name: input.name.trim(),
      description: input.description || '',
      sort_order: nextSortOrder,
      estimated_start_date: input.estimated_start_date || null,
      estimated_end_date: input.estimated_end_date || null,
      actual_start_date: input.actual_start_date || null,
      actual_end_date: input.actual_end_date || null,
      status: input.status || 'pending',
      notify_on_complete: input.notify_on_complete ?? true,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as ProjectPhase
}

/**
 * Update an existing phase
 */
export async function updatePhase(
  id: string,
  updates: UpdatePhaseInput
): Promise<ProjectPhase> {
  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim() === '') {
    throw new Error('Phase name cannot be empty')
  }

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  // Trim name if provided
  if (updates.name) {
    updateData.name = updates.name.trim()
  }

  const { data, error } = await supabase
    .from('project_phases')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Phase not found')
    }
    throw error
  }

  return data as ProjectPhase
}

/**
 * Delete a phase
 * Also deletes all associated tasks via CASCADE
 */
export async function deletePhase(id: string): Promise<void> {
  const { error } = await supabase.from('project_phases').delete().eq('id', id)

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Phase not found')
    }
    throw error
  }
}

/**
 * Update the order of phases within a project
 * Accepts an array of phase IDs in the desired order
 */
export async function updatePhaseOrder(
  projectId: string,
  orderedPhaseIds: string[]
): Promise<void> {
  if (!orderedPhaseIds || orderedPhaseIds.length === 0) {
    return
  }

  // Update each phase with its new sort_order
  const updates = orderedPhaseIds.map((phaseId, index) => ({
    id: phaseId,
    sort_order: index,
    updated_at: new Date().toISOString(),
  }))

  // Use a transaction-like approach by updating all at once
  // Note: Supabase doesn't have true transactions via client, but we can batch
  for (const update of updates) {
    const { error } = await supabase
      .from('project_phases')
      .update({
        sort_order: update.sort_order,
        updated_at: update.updated_at,
      })
      .eq('id', update.id)
      .eq('project_id', projectId) // Extra safety check

    if (error) {
      throw new Error(`Failed to update phase order: ${error.message}`)
    }
  }
}

/**
 * Mark a phase as completed
 * Convenience function that updates status and sets actual_end_date
 */
export async function completePhase(id: string): Promise<ProjectPhase> {
  const { data, error } = await supabase
    .from('project_phases')
    .update({
      status: 'completed',
      actual_end_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Phase not found')
    }
    throw error
  }

  return data as ProjectPhase
}

/**
 * Start a phase
 * Convenience function that updates status and sets actual_start_date
 */
export async function startPhase(id: string): Promise<ProjectPhase> {
  const { data, error } = await supabase
    .from('project_phases')
    .update({
      status: 'in_progress',
      actual_start_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Phase not found')
    }
    throw error
  }

  return data as ProjectPhase
}


