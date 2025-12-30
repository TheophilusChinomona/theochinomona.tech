/**
 * Video Embed Input Component
 * Input for YouTube/Vimeo embed URLs with validation and preview
 */

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Video, Plus, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidVideoEmbedUrl, getVideoEmbedUrl } from '@/lib/attachmentStorage'
import { createAttachment } from '@/lib/db/attachments'
import { toast } from 'sonner'

interface VideoEmbedInputProps {
  projectId: string
  phaseId?: string | null
  taskId?: string | null
  onAddComplete?: () => void
}

export default function VideoEmbedInput({
  projectId,
  phaseId,
  taskId,
  onAddComplete,
}: VideoEmbedInputProps) {
  const [url, setUrl] = useState('')
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const queryClient = useQueryClient()

  // Validate URL on change
  useEffect(() => {
    if (!url.trim()) {
      setIsValid(false)
      setEmbedUrl(null)
      return
    }

    const valid = isValidVideoEmbedUrl(url)
    setIsValid(valid)

    if (valid) {
      const embed = getVideoEmbedUrl(url)
      setEmbedUrl(embed)
    } else {
      setEmbedUrl(null)
    }
  }, [url])

  const addVideoMutation = useMutation({
    mutationFn: async () => {
      if (!embedUrl) throw new Error('Invalid video URL')

      await createAttachment({
        project_id: projectId,
        phase_id: phaseId || null,
        task_id: taskId || null,
        file_url: embedUrl,
        file_type: 'video_embed',
        file_name: url, // Store original URL as name
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] })
      toast.success('Video embed added successfully')
      setUrl('')
      setEmbedUrl(null)
      onAddComplete?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add video embed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && embedUrl) {
      addVideoMutation.mutate()
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label className="text-zinc-300 flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Embed URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="bg-zinc-950 border-zinc-800 text-zinc-100 flex-1"
            />
            <Button
              type="submit"
              disabled={!isValid || addVideoMutation.isPending}
              size="icon"
            >
              {addVideoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            Supported: YouTube, Vimeo links
          </p>
        </div>
      </form>

      {/* Preview */}
      {embedUrl && (
        <div className="rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
          <div className="p-2 border-b border-zinc-700 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Preview</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Validation message */}
      {url && !isValid && (
        <p className="text-sm text-amber-400">
          Please enter a valid YouTube or Vimeo URL
        </p>
      )}
    </div>
  )
}


