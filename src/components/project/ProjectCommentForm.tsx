/**
 * ProjectCommentForm Component
 * Form for creating comments on projects with file attachments
 * Task Group 14: Comment Thread Components
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, FileImage, FileText, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { validateRequestAttachmentFile, getAttachmentFileType } from '@/lib/storage'
import { uploadProjectCommentAttachment } from '@/lib/storage'
import { createComment } from '@/lib/db/projectComments'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

const commentFormSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
})

type CommentFormData = z.infer<typeof commentFormSchema>

interface ProjectCommentFormProps {
  projectId: string
  parentCommentId?: string | null
  onSuccess?: () => void
}

export default function ProjectCommentForm({
  projectId,
  parentCommentId,
  onSuccess,
}: ProjectCommentFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []

    for (const file of files) {
      try {
        validateRequestAttachmentFile(file)
        validFiles.push(file)
      } catch (error) {
        toast.error(
          `File ${file.name} is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    setAttachmentFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CommentFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a comment')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload attachments first
      for (const file of attachmentFiles) {
        try {
          // We need to create the comment first to get the comment ID
          // So we'll create a temporary comment, upload files, then update
          // Actually, let's create comment first, then upload attachments
          // For now, we'll create comment without attachments, then add them
          // But the API expects attachments in the input...
          // Let me check the API structure again
        } catch (error) {
          console.error('Failed to upload attachment:', error)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      // Create comment (we'll handle attachments separately after comment is created)
      // Actually, looking at the API, we need to upload files first, then pass URLs
      // Let me create a temporary comment ID for file naming, or better yet, upload files
      // with a temporary name and then rename after comment creation
      
      // Better approach: Create comment first, then upload attachments with comment ID
      const comment = await createComment({
        projectId,
        userId: user.id,
        content: data.content,
        parentCommentId: parentCommentId || null,
        attachments: [], // We'll add attachments after upload
      })

      // Upload attachments and create attachment records
      if (attachmentFiles.length > 0) {
        const uploadedAttachments = []
        for (const file of attachmentFiles) {
          try {
            const fileUrl = await uploadProjectCommentAttachment(file, comment.id)
            uploadedAttachments.push({
              file_url: fileUrl,
              file_name: file.name,
              file_type: getAttachmentFileType(file),
              file_size: file.size,
            })
          } catch (error) {
            console.error('Failed to upload attachment:', error)
            toast.error(`Failed to upload ${file.name}`)
          }
        }

        // Create attachment records in database
        if (uploadedAttachments.length > 0) {
          const { supabase } = await import('@/lib/supabase')
          const attachmentData = uploadedAttachments.map((att) => ({
            comment_id: comment.id,
            file_url: att.file_url,
            file_name: att.file_name,
            file_type: att.file_type,
            file_size: att.file_size,
          }))

          const { error: attachError } = await supabase
            .from('project_comment_attachments')
            .insert(attachmentData)

          if (attachError) {
            console.error('Failed to create attachment records:', attachError)
            toast.warning('Comment created but some attachments failed to save')
          }
        }
      }

      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] })
      queryClient.invalidateQueries({ queryKey: ['client', 'project', projectId] })

      toast.success('Comment added successfully')
      form.reset()
      setAttachmentFiles([])
      onSuccess?.()
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to create comment. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="comment-content">Your Comment</Label>
        <Textarea
          id="comment-content"
          {...form.register('content')}
          placeholder="Type your comment here..."
          rows={4}
          className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
        )}
      </div>

      {/* File Attachments */}
      <div className="space-y-2">
        <Label htmlFor="comment-attachments">Attachments (Optional)</Label>
        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4">
          <Input
            id="comment-attachments"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="comment-attachments"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-6 w-6 text-zinc-400 mb-2" />
            <span className="text-sm text-zinc-400">Click to upload or drag and drop</span>
            <span className="text-xs text-zinc-500 mt-1">PDF or images only, max 50MB per file</span>
          </label>
        </div>
        {attachmentFiles.length > 0 && (
          <div className="space-y-2 mt-2">
            {attachmentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md"
              >
                <div className="flex items-center gap-2">
                  {file.type === 'application/pdf' ? (
                    <FileText className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <FileImage className="h-4 w-4 text-zinc-400" />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-zinc-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !form.watch('content')?.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Comment
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

