/**
 * Database helper functions for project_templates table
 * Task Group 9: Project Templates API
 */

import { supabase } from '@/lib/supabase'
import { logActivity } from './activityLog'
import { createProject, type CreateProjectInput } from './projects'

export interface ProjectTemplate {
  id: string
  user_id: string
  name: string
  title: string
  description: string
  category: string
  tech: string[]
  budget_range: string | null
  timeline: string | null
  special_requirements: string | null
  is_hiring_request: boolean
  created_at: string
  updated_at: string
}

export interface ProjectTemplateAttachment {
  id: string
  template_id: string
  file_url: string
  file_name: string
  file_type: 'pdf' | 'image'
  file_size: number
  created_at: string
}

export interface ProjectTemplateWithAttachments extends ProjectTemplate {
  attachments: ProjectTemplateAttachment[]
}

export interface CreateTemplateInput {
  userId: string
  templateName: string
  projectData: {
    title: string
    description: string
    category: string
    tech: string[]
    budget_range?: string | null
    timeline?: string | null
    special_requirements?: string | null
    is_hiring_request?: boolean
  }
}

/**
 * Create a template from project data
 */
export async function createTemplate(
  input: CreateTemplateInput
): Promise<ProjectTemplateWithAttachments> {
  const { userId, templateName, projectData } = input

  if (!templateName || templateName.trim().length === 0) {
    throw new Error('Template name is required')
  }

  // Create template
  const { data: template, error } = await supabase
    .from('project_templates')
    .insert({
      user_id: userId,
      name: templateName.trim(),
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      tech: projectData.tech,
      budget_range: projectData.budget_range || null,
      timeline: projectData.timeline || null,
      special_requirements: projectData.special_requirements || null,
      is_hiring_request: projectData.is_hiring_request ?? false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create template: ${error.message}`)
  }

  // Log activity (we need a project_id, but templates aren't linked to projects)
  // We'll skip activity logging for templates or create a separate event type

  return {
    ...template,
    attachments: [],
  } as ProjectTemplateWithAttachments
}

/**
 * Get all templates for a user
 */
export async function getTemplatesForUser(
  userId: string
): Promise<ProjectTemplateWithAttachments[]> {
  const { data: templates, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get templates: ${error.message}`)
  }

  // Get attachments for all templates
  const templateIds = templates.map((t) => t.id)
  const { data: attachments, error: attachmentsError } = await supabase
    .from('project_template_attachments')
    .select('*')
    .in('template_id', templateIds)

  if (attachmentsError) {
    throw new Error(`Failed to get attachments: ${attachmentsError.message}`)
  }

  // Group attachments by template_id
  const attachmentsByTemplateId = new Map<string, ProjectTemplateAttachment[]>()
  if (attachments) {
    for (const att of attachments) {
      const templateId = att.template_id
      if (!attachmentsByTemplateId.has(templateId)) {
        attachmentsByTemplateId.set(templateId, [])
      }
      attachmentsByTemplateId.get(templateId)!.push(att as ProjectTemplateAttachment)
    }
  }

  // Combine templates with attachments
  return templates.map((template) => ({
    ...template,
    attachments: attachmentsByTemplateId.get(template.id) || [],
  })) as ProjectTemplateWithAttachments[]
}

/**
 * Get a single template by ID (validates ownership)
 */
export async function getTemplateById(
  templateId: string,
  userId: string
): Promise<ProjectTemplateWithAttachments | null> {
  const { data: template, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get template: ${error.message}`)
  }

  // Get attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from('project_template_attachments')
    .select('*')
    .eq('template_id', templateId)

  if (attachmentsError) {
    throw new Error(`Failed to get attachments: ${attachmentsError.message}`)
  }

  return {
    ...template,
    attachments: (attachments || []) as ProjectTemplateAttachment[],
  } as ProjectTemplateWithAttachments
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  updates: {
    name?: string
    title?: string
    description?: string
    category?: string
    tech?: string[]
    budget_range?: string | null
    timeline?: string | null
    special_requirements?: string | null
    is_hiring_request?: boolean
  }
): Promise<ProjectTemplate> {
  // Verify ownership
  const template = await getTemplateById(templateId, userId)
  if (!template) {
    throw new Error('Template not found or unauthorized')
  }

  const { data, error } = await supabase
    .from('project_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update template: ${error.message}`)
  }

  return data as ProjectTemplate
}

/**
 * Delete a template and its attachments
 */
export async function deleteTemplate(
  templateId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const template = await getTemplateById(templateId, userId)
  if (!template) {
    throw new Error('Template not found or unauthorized')
  }

  // Delete template (CASCADE will delete attachments)
  const { error } = await supabase
    .from('project_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete template: ${error.message}`)
  }
}

/**
 * Use a template to create a new project
 */
export async function useTemplateToCreateProject(
  templateId: string,
  userId: string,
  overrides?: Partial<CreateProjectInput>
): Promise<{ id: string; title: string }> {
  // Get template
  const template = await getTemplateById(templateId, userId)
  if (!template) {
    throw new Error('Template not found or unauthorized')
  }

  // Create project from template data
  const projectData: CreateProjectInput = {
    title: overrides?.title || template.title,
    description: overrides?.description || template.description,
    category: overrides?.category || template.category,
    tech: overrides?.tech || template.tech,
    is_hiring_request: overrides?.is_hiring_request ?? template.is_hiring_request,
    status: 'pending',
    created_by: userId,
    ...overrides,
  }

  const project = await createProject(projectData)

  // Log activity
  try {
    await logActivity(
      project.id,
      'template_used',
      {
        template_id: templateId,
        template_name: template.name,
        project_id: project.id,
      },
      userId
    )
  } catch (e) {
    console.error('Failed to log template usage activity:', e)
  }

  return {
    id: project.id,
    title: project.title,
  }
}

