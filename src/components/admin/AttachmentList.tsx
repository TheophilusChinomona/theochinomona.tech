/**
 * Attachment List Component
 * Displays a list of attachments with preview and delete functionality
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileImage, FileText, Video, Trash2, ExternalLink, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteAttachment as deleteAttachmentRecord } from '@/lib/db/attachments'
import { deleteAttachment as deleteAttachmentFile } from '@/lib/attachmentStorage'
import { toast } from 'sonner'
import type { ProjectAttachment } from '@/lib/db/tracking'

interface AttachmentListProps {
  attachments: ProjectAttachment[]
  showDelete?: boolean
}

export default function AttachmentList({
  attachments,
  showDelete = true,
}: AttachmentListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ProjectAttachment | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (attachment: ProjectAttachment) => {
      // Delete file from storage (skip for video embeds)
      if (attachment.file_type !== 'video_embed') {
        try {
          await deleteAttachmentFile(attachment.file_url)
        } catch (error) {
          console.warn('Could not delete file from storage:', error)
        }
      }

      // Delete record from database
      await deleteAttachmentRecord(attachment.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      toast.success('Attachment deleted')
      setDeleteTarget(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attachment')
    },
  })

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-4">No attachments yet.</p>
    )
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-5 w-5 text-indigo-400" />
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />
      case 'video_embed':
        return <Video className="h-5 w-5 text-blue-400" />
      default:
        return <FileText className="h-5 w-5 text-zinc-400" />
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden"
          >
            {/* Preview area */}
            <div className="aspect-video bg-zinc-900 flex items-center justify-center relative group">
              {attachment.file_type === 'image' ? (
                <img
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreviewImage(attachment.file_url)}
                />
              ) : attachment.file_type === 'video_embed' ? (
                <iframe
                  src={attachment.file_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 text-red-400" />
                  <span className="text-xs text-zinc-400">PDF</span>
                </div>
              )}

              {/* Overlay actions for images */}
              {attachment.file_type === 'image' && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewImage(attachment.file_url)}
                  >
                    View
                  </Button>
                </div>
              )}
            </div>

            {/* Info bar */}
            <div className="p-2 flex items-center gap-2">
              {getFileIcon(attachment.file_type)}
              <span className="text-sm text-zinc-300 truncate flex-1" title={attachment.file_name}>
                {attachment.file_name}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {attachment.file_type === 'pdf' && (
                  <a
                    href={attachment.file_url}
                    download={attachment.file_name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {attachment.file_type !== 'pdf' && (
                  <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {showDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setDeleteTarget(attachment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setPreviewImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-zinc-300">"{deleteTarget?.file_name}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


