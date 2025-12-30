/**
 * Attachment Gallery Component
 * Displays attachments with lightbox preview (public read-only view)
 */

import { useState } from 'react'
import { FileText, Download, ExternalLink, X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectAttachment } from '@/lib/db/tracking'

interface AttachmentGalleryProps {
  attachments: ProjectAttachment[]
}

export default function AttachmentGallery({ attachments }: AttachmentGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  if (attachments.length === 0) {
    return null
  }

  // Group attachments by type
  const images = attachments.filter((a) => a.file_type === 'image')
  const pdfs = attachments.filter((a) => a.file_type === 'pdf')
  const videos = attachments.filter((a) => a.file_type === 'video_embed')

  return (
    <>
      <div className="space-y-6">
        {/* Images grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 group cursor-pointer"
                onClick={() => setLightboxImage(image.file_url)}
              >
                <img
                  src={image.file_url}
                  alt={image.file_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDFs list */}
        {pdfs.length > 0 && (
          <div className="space-y-2">
            {pdfs.map((pdf) => (
              <a
                key={pdf.id}
                href={pdf.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white">
                    {pdf.file_name}
                  </p>
                  <p className="text-xs text-zinc-500">PDF Document</p>
                </div>
                <Download className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </a>
            ))}
          </div>
        )}

        {/* Video embeds */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="rounded-lg overflow-hidden border border-zinc-700/50"
              >
                <div className="aspect-video">
                  <iframe
                    src={video.file_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.file_name}
                  />
                </div>
                <div className="bg-zinc-800/50 px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-400 truncate">{video.file_name}</span>
                  <a
                    href={video.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image */}
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Download link */}
          <a
            href={lightboxImage}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Original
            </Button>
          </a>
        </div>
      )}
    </>
  )
}

