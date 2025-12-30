/**
 * Attachment Uploader Component
 * Handles file uploads for images and PDFs with drag-and-drop support
 */

import { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileImage, FileText, Loader2 } from 'lucide-react'
import { uploadAttachment, detectAttachmentType } from '@/lib/attachmentStorage'
import { createAttachment } from '@/lib/db/attachments'
import { toast } from 'sonner'

interface AttachmentUploaderProps {
  projectId: string
  phaseId?: string | null
  taskId?: string | null
  onUploadComplete?: () => void
}

export default function AttachmentUploader({
  projectId,
  phaseId,
  taskId,
  onUploadComplete,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileType = detectAttachmentType(file)
      if (!fileType) {
        throw new Error('Invalid file type. Only images and PDFs are allowed.')
      }

      setUploadProgress(`Uploading ${file.name}...`)

      // Upload to storage
      const fileUrl = await uploadAttachment(file, projectId, fileType)

      // Create attachment record
      await createAttachment({
        project_id: projectId,
        phase_id: phaseId || null,
        task_id: taskId || null,
        file_url: fileUrl,
        file_type: fileType,
        file_name: file.name,
      })

      return file.name
    },
    onSuccess: (fileName) => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      toast.success(`${fileName} uploaded successfully`)
      setUploadProgress(null)
      onUploadComplete?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file')
      setUploadProgress(null)
    },
  })

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      // Process each file
      Array.from(files).forEach((file) => {
        uploadMutation.mutate(file)
      })
    },
    [uploadMutation]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
          }
          ${uploadMutation.isPending ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-zinc-400">{uploadProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-zinc-500" />
            <div>
              <p className="text-sm text-zinc-300">
                Drag & drop files here, or <span className="text-indigo-400">browse</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1">Images (JPG, PNG, GIF, WebP) and PDFs up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* File type indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <FileImage className="h-4 w-4" />
          Images
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          PDFs
        </span>
      </div>
    </div>
  )
}


