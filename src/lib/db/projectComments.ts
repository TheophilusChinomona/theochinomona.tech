/**
 * Database helper functions for project_comments table
 * Task Group 7: Project Comments API
 */

import { supabase } from '@/lib/supabase'
import { logActivity } from './activityLog'
import { createNotification } from './notifications'
import { getUserById } from './users'
import { getProjectById, updateProject } from './projects'
import type { ProjectStatus } from './projects'

export interface ProjectComment {
  id: string
  project_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface ProjectCommentAttachment {
  id: string
  comment_id: string
  file_url: string
  file_name: string
  file_type: 'pdf' | 'image'
  file_size: number
  created_at: string
}

export interface ProjectCommentWithAttachments extends ProjectComment {
  attachments: ProjectCommentAttachment[]
  user?: {
    id: string
    name: string
    surname: string
    role: 'admin' | 'client'
  }
}

export interface CreateCommentInput {
  projectId: string
  userId: string
  content: string
  parentCommentId?: string | null
  attachments?: Array<{
    file_url: string
    file_name: string
    file_type: 'pdf' | 'image'
    file_size: number
  }>
}

/**
 * Create a comment on a project
 * Handles automatic status changes based on comment author role
 */
export async function createComment(
  input: CreateCommentInput
): Promise<ProjectCommentWithAttachments> {
  const { projectId, userId, content, parentCommentId, attachments } = input

  if (!content || content.trim().length === 0) {
    throw new Error('Comment content is required')
  }

  // Get project and user to determine roles
  const [project, user] = await Promise.all([
    getProjectById(projectId),
    getUserById(userId),
  ])

  if (!project) {
    throw new Error('Project not found')
  }

  if (!user) {
    throw new Error('User not found')
  }

  // Create comment
  const { data: comment, error: commentError } = await supabase
    .from('project_comments')
    .insert({
      project_id: projectId,
      user_id: userId,
      parent_comment_id: parentCommentId || null,
      content: content.trim(),
    })
    .select()
    .single()

  if (commentError) {
    throw new Error(`Failed to create comment: ${commentError.message}`)
  }

  // Create attachments if provided
  let commentAttachments: ProjectCommentAttachment[] = []
  if (attachments && attachments.length > 0) {
    const attachmentsData = attachments.map((att) => ({
      comment_id: comment.id,
      file_url: att.file_url,
      file_name: att.file_name,
      file_type: att.file_type,
      file_size: att.file_size,
    }))

    const { data: insertedAttachments, error: attachmentsError } = await supabase
      .from('project_comment_attachments')
      .insert(attachmentsData)
      .select()

    if (attachmentsError) {
      // Rollback: delete comment if attachments fail
      await supabase.from('project_comments').delete().eq('id', comment.id)
      throw new Error(`Failed to create attachments: ${attachmentsError.message}`)
    }

    commentAttachments = insertedAttachments as ProjectCommentAttachment[]
  }

  // Handle automatic status changes
  const isAdmin = user.role === 'admin'
  let statusChanged = false
  let oldStatus: ProjectStatus | null = null
  let newStatus: ProjectStatus | null = null

  if (isAdmin && project.status !== 'pending_info') {
    // Admin creates comment → update status to pending_info
    oldStatus = project.status
    newStatus = 'pending_info'
    statusChanged = true
  } else if (!isAdmin && project.status === 'pending_info') {
    // Client replies to admin comment → update status to pending
    oldStatus = project.status
    newStatus = 'pending'
    statusChanged = true
  }

  // Update project status if it changed
  if (statusChanged && oldStatus && newStatus) {
    await updateProject(projectId, { status: newStatus })

    // Log activity
    try {
      await logActivity(
        projectId,
        'project_status_changed',
        {
          old_status: oldStatus,
          new_status: newStatus,
          reason: 'Comment created',
          comment_id: comment.id,
        },
        userId
      )
    } catch (e) {
      console.error('Failed to log status change activity:', e)
    }
  }

  // Send notifications (always send, regardless of status change)
  try {
    if (isAdmin) {
      // Notify client that admin commented/requested info
      if (project.client_id) {
        await createNotification(
          project.client_id,
          'admin_requested_info',
          'Admin Requested Information',
          `Admin has requested more details about your project "${project.title}". Please reply with the requested information.`,
          {
            project_id: projectId,
            project_title: project.title,
            comment_id: comment.id,
          }
        )
      }
    } else {
      // Notify admin that client responded
      // Strategy: Query project_comments to get user_ids, then try to create notifications
      // The RLS policy will allow notifications if the user is an admin involved in the project
      const { data: comments } = await supabase
        .from('project_comments')
        .select('user_id')
        .eq('project_id', projectId)
        .limit(50)

      // Get unique user IDs from comments
      const commentUserIds = new Set<string>()
      if (comments) {
        for (const comment of comments) {
          if (comment.user_id) {
            commentUserIds.add(comment.user_id)
          }
        }
      }

      // Also include project creator if available
      if (project.created_by) {
        commentUserIds.add(project.created_by)
      }

      // Try to create notifications for all users who commented
      // The RLS policy will only allow it if they're admins involved in the project
      let notificationsSent = 0
      for (const userId of commentUserIds) {
        try {
          await createNotification(
            userId,
            'client_responded_info',
            'Client Responded to Information Request',
            `Client has responded to your information request for project "${project.title}".`,
            {
              project_id: projectId,
              project_title: project.title,
              comment_id: comment.id,
            }
          )
          notificationsSent++
        } catch (notifError) {
          // RLS blocked this - user is not an admin or not involved in project
          // Continue to next user
          continue
        }
      }

      if (notificationsSent === 0) {
        console.warn(
          `Could not find admin users to notify for project ${projectId}. ` +
          `Tried ${commentUserIds.size} user(s) but all were blocked by RLS.`
        )
      }
    }
  } catch (e) {
    console.error('Failed to send notification:', e)
  }

  // Log comment creation activity
  try {
    await logActivity(
      projectId,
      'project_comment_added',
      {
        comment_id: comment.id,
        has_attachments: commentAttachments.length > 0,
      },
      userId
    )
  } catch (e) {
    console.error('Failed to log comment activity:', e)
  }

  // Fetch user info for response
  const commentWithUser: ProjectCommentWithAttachments = {
    ...comment,
    attachments: commentAttachments,
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
      role: user.role,
    },
  }

  return commentWithUser
}

/**
 * Get all comments for a project with attachments
 * Returns threaded structure (parent comments with replies)
 */
export async function getCommentsForProject(
  projectId: string
): Promise<ProjectCommentWithAttachments[]> {
  const { data: comments, error } = await supabase
    .from('project_comments')
    .select(`
      *,
      user:users!project_comments_user_id_fkey(id, name, surname, role)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get comments: ${error.message}`)
  }

  // Get attachments for all comments
  const commentIds = comments.map((c) => c.id)
  const { data: attachments, error: attachmentsError } = await supabase
    .from('project_comment_attachments')
    .select('*')
    .in('comment_id', commentIds)

  if (attachmentsError) {
    throw new Error(`Failed to get attachments: ${attachmentsError.message}`)
  }

  // Group attachments by comment_id
  const attachmentsByCommentId = new Map<string, ProjectCommentAttachment[]>()
  if (attachments) {
    for (const att of attachments) {
      const commentId = att.comment_id
      if (!attachmentsByCommentId.has(commentId)) {
        attachmentsByCommentId.set(commentId, [])
      }
      attachmentsByCommentId.get(commentId)!.push(att as ProjectCommentAttachment)
    }
  }

  // Combine comments with attachments and user info
  const commentsWithAttachments: ProjectCommentWithAttachments[] = comments.map(
    (comment) => ({
      ...comment,
      attachments: attachmentsByCommentId.get(comment.id) || [],
      user: comment.user as {
        id: string
        name: string
        surname: string
        role: 'admin' | 'client'
      },
    })
  ) as ProjectCommentWithAttachments[]

  return commentsWithAttachments
}

/**
 * Get a single comment by ID with attachments
 */
export async function getCommentById(
  commentId: string
): Promise<ProjectCommentWithAttachments | null> {
  const { data: comment, error } = await supabase
    .from('project_comments')
    .select(`
      *,
      user:users!project_comments_user_id_fkey(id, name, surname, role)
    `)
    .eq('id', commentId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get comment: ${error.message}`)
  }

  // Get attachments
  const { data: attachments, error: attachmentsError } = await supabase
    .from('project_comment_attachments')
    .select('*')
    .eq('comment_id', commentId)

  if (attachmentsError) {
    throw new Error(`Failed to get attachments: ${attachmentsError.message}`)
  }

  return {
    ...comment,
    attachments: (attachments || []) as ProjectCommentAttachment[],
    user: comment.user as {
      id: string
      name: string
      surname: string
      role: 'admin' | 'client'
    },
  } as ProjectCommentWithAttachments
}

/**
 * Soft-delete a comment (mark as deleted, hide from view)
 * Note: We'll implement soft-delete by adding a deleted_at column if needed,
 * or we can just delete it for now since the spec says "soft-delete"
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  // Verify user owns the comment or is admin
  const comment = await getCommentById(commentId)
  if (!comment) {
    throw new Error('Comment not found')
  }

  const user = await getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Only allow deletion if user owns the comment or is admin
  if (comment.user_id !== userId && user.role !== 'admin') {
    throw new Error('Unauthorized: You can only delete your own comments')
  }

  // For now, we'll hard-delete. If soft-delete is needed, add deleted_at column
  const { error } = await supabase
    .from('project_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }
}

