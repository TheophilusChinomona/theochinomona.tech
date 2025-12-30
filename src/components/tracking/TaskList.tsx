/**
 * Task List Component
 * Displays tasks within a phase (read-only public view)
 */

import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import AttachmentGallery from './AttachmentGallery'
import type { ProjectTask, ProjectAttachment } from '@/lib/db/tracking'

interface TaskListProps {
  tasks: ProjectTask[]
  getTaskAttachments: (taskId: string) => ProjectAttachment[]
}

export default function TaskList({ tasks, getTaskAttachments }: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-4">
        No tasks have been added to this phase yet.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-zinc-300 mb-3">Tasks</h4>
      
      {tasks.map((task) => {
        const isCompleted = task.completion_percentage === 100
        const isExpanded = expandedTasks.has(task.id)
        const attachments = getTaskAttachments(task.id)
        const hasContent = task.description || task.developer_notes || attachments.length > 0

        // Count attachment types
        const imageCount = attachments.filter((a) => a.file_type === 'image').length
        const pdfCount = attachments.filter((a) => a.file_type === 'pdf').length
        const videoCount = attachments.filter((a) => a.file_type === 'video_embed').length

        return (
          <div
            key={task.id}
            className={`rounded-lg border transition-all ${
              isCompleted
                ? 'bg-green-950/20 border-green-900/30'
                : 'bg-zinc-800/50 border-zinc-700/50'
            }`}
          >
            {/* Task header */}
            <button
              onClick={() => hasContent && toggleTask(task.id)}
              disabled={!hasContent}
              className={`w-full text-left p-3 flex items-center gap-3 ${
                hasContent ? 'cursor-pointer hover:bg-zinc-800/50' : 'cursor-default'
              }`}
            >
              {/* Completion icon */}
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
              ) : (
                <div className="relative h-5 w-5 shrink-0">
                  <Circle className="h-5 w-5 text-zinc-600" />
                  {task.completion_percentage > 0 && (
                    <svg
                      className="absolute inset-0 h-5 w-5 -rotate-90"
                      viewBox="0 0 20 20"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-indigo-500"
                        strokeDasharray={`${(task.completion_percentage / 100) * 50.26} 50.26`}
                      />
                    </svg>
                  )}
                </div>
              )}

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <span
                  className={`font-medium ${
                    isCompleted ? 'text-green-300' : 'text-zinc-200'
                  }`}
                >
                  {task.name}
                </span>
                
                {/* Attachment indicators */}
                {(imageCount > 0 || pdfCount > 0 || videoCount > 0) && (
                  <div className="flex items-center gap-2 mt-1">
                    {imageCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Image className="h-3 w-3" />
                        {imageCount}
                      </span>
                    )}
                    {pdfCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <FileText className="h-3 w-3" />
                        {pdfCount}
                      </span>
                    )}
                    {videoCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Video className="h-3 w-3" />
                        {videoCount}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress badge */}
              <Badge
                variant="outline"
                className={
                  isCompleted
                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                    : 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
                }
              >
                {task.completion_percentage}%
              </Badge>

              {/* Expand indicator */}
              {hasContent && (
                <span className="text-zinc-500">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </button>

            {/* Expanded content */}
            {isExpanded && hasContent && (
              <div className="px-3 pb-3 pt-0 space-y-4">
                <div className="border-t border-zinc-700/50 pt-3 ml-8">
                  {/* Task description */}
                  {task.description && (
                    <p className="text-sm text-zinc-400 mb-4">{task.description}</p>
                  )}

                  {/* Developer notes */}
                  {task.developer_notes && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <h5 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                        Developer Notes
                      </h5>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                        {task.developer_notes}
                      </p>
                    </div>
                  )}

                  {/* Task attachments */}
                  {attachments.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                        Attachments
                      </h5>
                      <AttachmentGallery attachments={attachments} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

