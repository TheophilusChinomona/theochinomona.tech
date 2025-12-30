/**
 * Database helper functions for project tasks
 * These functions interact with Supabase to manage task records
 */

import { supabase } from '@/lib/supabase'
import type { ProjectTask } from './tracking'

export interface CreateTaskInput {
  phase_id: string
  name: string
  description?: string | null
  completion_percentage?: number
  developer_notes?: string | null
}

export interface UpdateTaskInput {
  name?: string
  description?: string | null
  completion_percentage?: number
  developer_notes?: string | null
}

/**
 * Get all tasks for a phase, ordered by sort_order
 */
export async function getTasksByPhaseId(
  phaseId: string
): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('phase_id', phaseId)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data as ProjectTask[]
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<ProjectTask | null> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as ProjectTask
}

/**
 * Create a new task
 * Automatically sets sort_order to be last in the phase
 */
export async function createTask(input: CreateTaskInput): Promise<ProjectTask> {
  // Validate required fields
  if (!input.phase_id) {
    throw new Error('Phase ID is required')
  }

  if (!input.name || input.name.trim() === '') {
    throw new Error('Task name is required')
  }

  // Validate completion percentage if provided
  if (input.completion_percentage !== undefined) {
    if (
      input.completion_percentage < 0 ||
      input.completion_percentage > 100
    ) {
      throw new Error('Completion percentage must be between 0 and 100')
    }
  }

  // Get the current max sort_order for this phase
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from('project_tasks')
    .select('sort_order')
    .eq('phase_id', input.phase_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  let nextSortOrder = 0
  if (!maxOrderError && maxOrderData) {
    nextSortOrder = maxOrderData.sort_order + 1
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .insert({
      phase_id: input.phase_id,
      name: input.name.trim(),
      description: input.description || null,
      sort_order: nextSortOrder,
      completion_percentage: input.completion_percentage ?? 0,
      developer_notes: input.developer_notes || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as ProjectTask
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  updates: UpdateTaskInput
): Promise<ProjectTask> {
  // Validate name if provided
  if (updates.name !== undefined && updates.name.trim() === '') {
    throw new Error('Task name cannot be empty')
  }

  // Validate completion percentage if provided
  if (updates.completion_percentage !== undefined) {
    if (
      updates.completion_percentage < 0 ||
      updates.completion_percentage > 100
    ) {
      throw new Error('Completion percentage must be between 0 and 100')
    }
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
    .from('project_tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Task not found')
    }
    throw error
  }

  return data as ProjectTask
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('project_tasks').delete().eq('id', id)

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Task not found')
    }
    throw error
  }
}

/**
 * Update the order of tasks within a phase
 * Accepts an array of task IDs in the desired order
 */
export async function updateTaskOrder(
  phaseId: string,
  orderedTaskIds: string[]
): Promise<void> {
  if (!orderedTaskIds || orderedTaskIds.length === 0) {
    return
  }

  // Update each task with its new sort_order
  for (let index = 0; index < orderedTaskIds.length; index++) {
    const taskId = orderedTaskIds[index]
    const { error } = await supabase
      .from('project_tasks')
      .update({
        sort_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('phase_id', phaseId) // Extra safety check

    if (error) {
      throw new Error(`Failed to update task order: ${error.message}`)
    }
  }
}

/**
 * Update task completion percentage
 * Convenience function for quick progress updates
 */
export async function updateTaskCompletion(
  taskId: string,
  percentage: number
): Promise<ProjectTask> {
  // Validate percentage
  if (percentage < 0 || percentage > 100) {
    throw new Error('Completion percentage must be between 0 and 100')
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update({
      completion_percentage: Math.round(percentage),
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Task not found')
    }
    throw error
  }

  return data as ProjectTask
}

/**
 * Mark a task as complete (100%)
 * Convenience function
 */
export async function completeTask(taskId: string): Promise<ProjectTask> {
  return updateTaskCompletion(taskId, 100)
}

/**
 * Get tasks by multiple phase IDs
 * Useful for fetching all tasks for a project at once
 */
export async function getTasksByPhaseIds(
  phaseIds: string[]
): Promise<ProjectTask[]> {
  if (!phaseIds || phaseIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .in('phase_id', phaseIds)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return data as ProjectTask[]
}


