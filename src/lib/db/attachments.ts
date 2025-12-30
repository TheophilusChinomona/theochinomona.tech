/**
 * Database helper functions for project attachments
 * These functions interact with Supabase to manage attachment records
 */

import { supabase } from '@/lib/supabase'
import type { AttachmentType, ProjectAttachment } from './tracking'

export interface CreateAttachmentInput {
  project_id: string
  phase_id?: string | null
  task_id?: string | null
  file_url: string
  file_type: AttachmentType
  file_name: string
}

/**
 * Get all attachments for a project
 */
export async function getAttachmentsByProjectId(
  projectId: string
): Promise<ProjectAttachment[]> {
  const { data, error } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as ProjectAttachment[]
}

/**
 * Get attachments for a specific phase
 */
export async function getAttachmentsByPhaseId(
  phaseId: string
): Promise<ProjectAttachment[]> {
  const { data, error } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('phase_id', phaseId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as ProjectAttachment[]
}

/**
 * Get attachments for a specific task
 */
export async function getAttachmentsByTaskId(
  taskId: string
): Promise<ProjectAttachment[]> {
  const { data, error } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as ProjectAttachment[]
}

/**
 * Get a single attachment by ID
 */
export async function getAttachmentById(
  id: string
): Promise<ProjectAttachment | null> {
  const { data, error } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as ProjectAttachment
}

/**
 * Create a new attachment record
 * Note: File upload to storage should be done separately using attachmentStorage.ts
 */
export async function createAttachment(
  input: CreateAttachmentInput
): Promise<ProjectAttachment> {
  // Validate required fields
  if (!input.project_id) {
    throw new Error('Project ID is required')
  }

  if (!input.file_url || input.file_url.trim() === '') {
    throw new Error('File URL is required')
  }

  if (!input.file_type) {
    throw new Error('File type is required')
  }

  if (!input.file_name || input.file_name.trim() === '') {
    throw new Error('File name is required')
  }

  // Validate file type
  const validTypes: AttachmentType[] = ['image', 'pdf', 'video_embed']
  if (!validTypes.includes(input.file_type)) {
    throw new Error(`Invalid file type. Must be one of: ${validTypes.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('project_attachments')
    .insert({
      project_id: input.project_id,
      phase_id: input.phase_id || null,
      task_id: input.task_id || null,
      file_url: input.file_url.trim(),
      file_type: input.file_type,
      file_name: input.file_name.trim(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as ProjectAttachment
}

/**
 * Delete an attachment record
 * Note: File deletion from storage should be done separately using attachmentStorage.ts
 */
export async function deleteAttachment(id: string): Promise<void> {
  const { error } = await supabase
    .from('project_attachments')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Attachment not found')
    }
    throw error
  }
}

/**
 * Delete all attachments for a project
 * Useful for cleanup when deleting a project
 */
export async function deleteAttachmentsByProjectId(
  projectId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_attachments')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    throw error
  }
}

/**
 * Delete all attachments for a phase
 */
export async function deleteAttachmentsByPhaseId(
  phaseId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_attachments')
    .delete()
    .eq('phase_id', phaseId)

  if (error) {
    throw error
  }
}

/**
 * Delete all attachments for a task
 */
export async function deleteAttachmentsByTaskId(
  taskId: string
): Promise<void> {
  const { error } = await supabase
    .from('project_attachments')
    .delete()
    .eq('task_id', taskId)

  if (error) {
    throw error
  }
}

/**
 * Count attachments for a phase
 */
export async function countAttachmentsByPhaseId(
  phaseId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('project_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('phase_id', phaseId)

  if (error) {
    throw error
  }

  return count || 0
}

/**
 * Count attachments for a task
 */
export async function countAttachmentsByTaskId(
  taskId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('project_attachments')
    .select('*', { count: 'exact', head: true })
    .eq('task_id', taskId)

  if (error) {
    throw error
  }

  return count || 0
}


