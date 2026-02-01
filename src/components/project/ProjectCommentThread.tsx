/**
 * ProjectCommentThread Component
 * Displays threaded comments for project communication
 * Task Group 14: Comment Thread Components
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Reply, Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { getCommentsForProject } from '@/lib/db/projectComments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ProjectCommentForm from './ProjectCommentForm'
import { useAuth } from '@/hooks/useAuth'
import type { ProjectCommentWithAttachments } from '@/lib/db/projectComments'
import type { ProjectStatus } from '@/lib/db/projects'

interface ProjectCommentThreadProps {
  projectId: string
  projectStatus: ProjectStatus
  canReply?: boolean
}

export default function ProjectCommentThread({
  projectId,
  projectStatus,
  canReply = false,
}: ProjectCommentThreadProps) {
  const { user } = useAuth()
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const { data: comments, isLoading } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: () => getCommentsForProject(projectId),
    enabled: !!projectId,
  })

  // Build threaded structure
  const buildThread = (
    allComments: ProjectCommentWithAttachments[]
  ): Array<ProjectCommentWithAttachments & { replies: ProjectCommentWithAttachments[] }> => {
    const topLevel = allComments.filter((c) => !c.parent_comment_id)
    const replies = allComments.filter((c) => c.parent_comment_id)

    return topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parent_comment_id === comment.id),
    }))
  }

  const threadedComments = comments ? buildThread(comments) : []

  const canAddComment =
    user?.role === 'admin' || (user?.role === 'client' && projectStatus === 'pending_info')

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId)
  }

  const handleCommentSuccess = () => {
    setReplyingTo(null)
  }

  const renderComment = (
    comment: ProjectCommentWithAttachments,
    isReply = false
  ) => {
    // Handle case where user data might be null due to RLS
    const userRole = comment.user?.role
    const isAdmin = userRole === 'admin'
    const isClient = userRole === 'client'
    const userName = comment.user?.name && comment.user?.surname
      ? `${comment.user.name} ${comment.user.surname}`
      : comment.user?.name || 'Unknown User'
    
    const canReplyToThis =
      user?.role === 'client' &&
      projectStatus === 'pending_info' &&
      isAdmin &&
      !isReply

    return (
      <div key={comment.id} className={isReply ? 'ml-8 mt-4' : ''}>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">
                      {userName}
                    </span>
                    {isAdmin ? (
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                    ) : isClient ? (
                      <Badge variant="secondary" className="text-xs">
                        Client
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Unknown
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-zinc-200 mb-3 whitespace-pre-wrap">{comment.content}</p>

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {comment.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 p-2 bg-zinc-800/50 rounded"
                  >
                    {attachment.file_type === 'pdf' ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    <span>{attachment.file_name}</span>
                    <Download className="h-3 w-3 ml-auto" />
                  </a>
                ))}
              </div>
            )}

            {/* Reply Button */}
            {canReplyToThis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReplyClick(comment.id)}
                className="text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <ProjectCommentForm
                  projectId={projectId}
                  parentCommentId={comment.id}
                  onSuccess={handleCommentSuccess}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-100">Comments</h3>
        {comments && comments.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {comments.length}
          </Badge>
        )}
      </div>

      {/* Comments List */}
      {threadedComments.length > 0 ? (
        <div className="space-y-4">
          {threadedComments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No comments yet.</p>
        </div>
      )}

      {/* Add Comment Form */}
      {canAddComment && !replyingTo && (
        <div className="pt-4 border-t border-zinc-800">
          <ProjectCommentForm projectId={projectId} onSuccess={handleCommentSuccess} />
        </div>
      )}
    </div>
  )
}

