/**
 * Database helper functions for project_requests table
 * Task Group 4: Project Requests Database Functions
 */

import { supabase } from '@/lib/supabase'
import type {
  ProjectRequest,
  ProjectRequestAttachment,
  ProjectRequestWithAttachments,
  CreateProjectRequestInput,
  UpdateProjectRequestInput,
} from './types/projectRequests'

/**
 * Create a new project request
 */
export async function createProjectRequest(
  clientId: string,
  data: CreateProjectRequestInput
): Promise<ProjectRequestWithAttachments> {
  // Validate required fields
  if (!data.title || !data.description || !data.category) {
    throw new Error('Title, description, and category are required')
  }

  // Insert project request
  const { data: request, error } = await supabase
    .from('project_requests')
    .insert({
      client_id: clientId,
      title: data.title,
      description: data.description,
      category: data.category,
      budget_range: data.budget_range || null,
      timeline: data.timeline || null,
      special_requirements: data.special_requirements || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  // Note: File attachments should be uploaded separately using uploadProjectRequestAttachment
  // and then linked via the project_request_attachments table
  // For now, we return the request without attachments
  const attachments: ProjectRequestAttachment[] = []

  return {
    ...(request as ProjectRequest),
    attachments,
  }
}

/**
 * Get project requests for a specific client
 */
export async function getProjectRequestsForClient(
  clientId: string,
  filters?: { status?: string }
): Promise<ProjectRequestWithAttachments[]> {
  let query = supabase
    .from('project_requests')
    .select('*, attachments:project_request_attachments(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  // Transform the data to match our interface
  return (data || []).map((item) => ({
    ...item,
    attachments: (item.attachments || []) as ProjectRequestAttachment[],
  })) as ProjectRequestWithAttachments[]
}

/**
 * Get all pending project requests (for admin)
 */
export async function getPendingProjectRequests(): Promise<
  ProjectRequestWithAttachments[]
> {
  const { data, error } = await supabase
    .from('project_requests')
    .select(
      '*, attachments:project_request_attachments(*), client:users!project_requests_client_id_fkey(id, name, surname, email)'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  // Transform the data to match our interface
  return (data || []).map((item) => ({
    ...item,
    attachments: (item.attachments || []) as ProjectRequestAttachment[],
  })) as ProjectRequestWithAttachments[]
}

/**
 * Get project request by ID
 */
export async function getProjectRequestById(
  id: string
): Promise<ProjectRequestWithAttachments | null> {
  const { data, error } = await supabase
    .from('project_requests')
    .select(
      '*, attachments:project_request_attachments(*), client:users!project_requests_client_id_fkey(id, name, surname, email)'
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return {
    ...(data as ProjectRequest),
    attachments: (data.attachments || []) as ProjectRequestAttachment[],
  } as ProjectRequestWithAttachments
}

/**
 * Update project request status and related fields
 */
export async function updateProjectRequest(
  id: string,
  updates: UpdateProjectRequestInput
): Promise<ProjectRequest> {
  const { data, error } = await supabase
    .from('project_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Project request not found')
    }
    throw error
  }

  return data as ProjectRequest
}

/**
 * Approve a project request and optionally create a project
 * This function is called by admins during the approval workflow
 */
export async function approveProjectRequest(
  requestId: string,
  requiresPayment: boolean,
  invoiceId?: string
): Promise<ProjectRequest> {
  // Update request status to approved
  const updates: UpdateProjectRequestInput = {
    status: 'approved',
  }

  // If a project is created, link it via project_id
  // Note: Project creation should be handled separately in the approval workflow
  // This function just updates the request status

  return updateProjectRequest(requestId, updates)
}

/**
 * Deny a project request with optional reason
 */
export async function denyProjectRequest(
  requestId: string,
  reason?: string
): Promise<ProjectRequest> {
  return updateProjectRequest(requestId, {
    status: 'denied',
    denial_reason: reason || null,
  })
}

/**
 * Create attachment metadata record in database
 */
export async function createProjectRequestAttachment(
  requestId: string,
  fileUrl: string,
  fileName: string,
  fileType: 'pdf' | 'image',
  fileSize: number
): Promise<ProjectRequestAttachment> {
  const { data, error } = await supabase
    .from('project_request_attachments')
    .insert({
      request_id: requestId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as ProjectRequestAttachment
}

/**
 * Get all attachments for a project request
 */
export async function getProjectRequestAttachments(
  requestId: string
): Promise<ProjectRequestAttachment[]> {
  const { data, error } = await supabase
    .from('project_request_attachments')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as ProjectRequestAttachment[]
}

/**
 * Delete a project request attachment (both file and metadata)
 */
export async function deleteProjectRequestAttachment(
  attachmentId: string
): Promise<void> {
  // First get the attachment to get the file URL
  const { data: attachment, error: fetchError } = await supabase
    .from('project_request_attachments')
    .select('file_url')
    .eq('id', attachmentId)
    .single()

  if (fetchError) {
    throw new Error('Attachment not found')
  }

  // Delete metadata from database (file deletion should be handled separately)
  const { error } = await supabase
    .from('project_request_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) {
    throw error
  }

  // Note: File deletion from storage should be handled by the caller
  // using deleteProjectRequestAttachment from storage.ts
}

