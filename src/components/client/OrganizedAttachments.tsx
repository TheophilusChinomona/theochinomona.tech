/**
 * OrganizedAttachments component
 * Groups and displays attachments by phase/task with previews
 */

import { useState } from 'react'
import { Paperclip, Image, FileText, Video, Download, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'

interface Attachment {
  id: string
  file_name: string
  file_url: string
  file_type: string
  phase_name?: string
  task_name?: string
  created_at: string
}

interface AttachmentGroup {
  name: string
  attachments: Attachment[]
}

interface OrganizedAttachmentsProps {
  attachments: Attachment[]
  isLoading?: boolean
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return Image
  if (fileType.startsWith('video/')) return Video
  if (fileType.includes('pdf')) return FileText
  return Paperclip
}

function isImageFile(fileType: string) {
  return fileType.startsWith('image/')
}

function isVideoFile(fileType: string) {
  return fileType.startsWith('video/')
}

export default function OrganizedAttachments({ attachments, isLoading }: OrganizedAttachmentsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Ungrouped']))

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  // Group attachments by phase
  const groupedAttachments: AttachmentGroup[] = (() => {
    const groups = new Map<string, Attachment[]>()

    for (const attachment of attachments) {
      const groupName = attachment.phase_name || 'Ungrouped'
      const existing = groups.get(groupName) || []
      existing.push(attachment)
      groups.set(groupName, existing)
    }

    return Array.from(groups.entries()).map(([name, attachments]) => ({
      name,
      attachments,
    }))
  })()

  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
          <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (attachments.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400 mb-4">
          <Paperclip className="w-5 h-5" />
          <h3 className="text-sm font-medium">Attachments</h3>
        </div>
        <p className="text-sm text-zinc-500">No attachments yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        <Paperclip className="w-5 h-5" />
        <h3 className="text-sm font-medium">Attachments</h3>
        <span className="text-xs text-zinc-600">({attachments.length})</span>
      </div>

      <div className="space-y-4">
        {groupedAttachments.map((group) => {
          const isExpanded = expandedGroups.has(group.name)

          return (
            <div key={group.name} className="border border-zinc-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-200">{group.name}</span>
                  <span className="text-xs text-zinc-600">({group.attachments.length})</span>
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 pt-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {group.attachments.map((attachment) => {
                    const Icon = getFileIcon(attachment.file_type)
                    const isImage = isImageFile(attachment.file_type)
                    const isVideo = isVideoFile(attachment.file_type)

                    return (
                      <div
                        key={attachment.id}
                        className="group relative rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        {isImage ? (
                          <div className="aspect-square bg-zinc-800">
                            <img
                              src={attachment.file_url}
                              alt={attachment.file_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : isVideo ? (
                          <div className="aspect-square bg-zinc-800 flex items-center justify-center">
                            <video
                              src={attachment.file_url}
                              className="w-full h-full object-cover"
                              controls={false}
                            />
                            <Video className="absolute w-8 h-8 text-zinc-400" />
                          </div>
                        ) : (
                          <div className="aspect-square bg-zinc-800 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-zinc-400" />
                          </div>
                        )}

                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                            title="Open"
                          >
                            <ExternalLink className="w-4 h-4 text-zinc-300" />
                          </a>
                          <a
                            href={attachment.file_url}
                            download={attachment.file_name}
                            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-zinc-300" />
                          </a>
                        </div>

                        {/* File name */}
                        <div className="p-2 bg-zinc-900">
                          <p className="text-xs text-zinc-400 truncate">{attachment.file_name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

