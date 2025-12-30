/**
 * TypeScript interfaces for Project Requests
 * Task Group 4: Project Requests Database Functions
 */

export type RequestStatus = 'pending' | 'approved' | 'denied' | 'needs_info'

export type AttachmentFileType = 'pdf' | 'image'

export interface ProjectRequest {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  budget_range: string | null
  timeline: string | null
  special_requirements: string | null
  status: RequestStatus
  admin_notes: string | null
  denial_reason: string | null
  project_id: string | null
  created_at: string
  updated_at: string
}

export interface ProjectRequestAttachment {
  id: string
  request_id: string
  file_url: string
  file_name: string
  file_type: AttachmentFileType
  file_size: number
  created_at: string
}

export interface ProjectRequestWithAttachments extends ProjectRequest {
  attachments: ProjectRequestAttachment[]
}

export interface CreateProjectRequestInput {
  title: string
  description: string
  category: string
  budget_range?: string | null
  timeline?: string | null
  special_requirements?: string | null
  attachments?: File[]
}

export interface UpdateProjectRequestInput {
  status?: RequestStatus
  admin_notes?: string | null
  denial_reason?: string | null
  project_id?: string | null
}

