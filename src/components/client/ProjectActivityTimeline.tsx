/**
 * ProjectActivityTimeline component
 * Shows activity log for a specific project in timeline format
 */

import {
  CheckCircle,
  PlayCircle,
  FileText,
  Paperclip,
  FolderPlus,
  Trophy,
  Edit,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityLogEntry, ActivityLogEventType } from '@/lib/db/types/dashboard'

interface ProjectActivityTimelineProps {
  activities: ActivityLogEntry[]
  isLoading?: boolean
}

const eventTypeConfig: Record<
  ActivityLogEventType,
  { icon: typeof Activity; color: string; bgColor: string }
> = {
  phase_completed: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  phase_started: {
    icon: PlayCircle,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  task_updated: {
    icon: Edit,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  note_added: {
    icon: FileText,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
  file_uploaded: {
    icon: Paperclip,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  project_created: {
    icon: FolderPlus,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
  },
  project_completed: {
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
}

function formatDateTime(dateStr: string): { date: string; time: string } {
  const date = new Date(dateStr)
  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function getEventTitle(event: ActivityLogEntry): string {
  const data = event.event_data || {}

  switch (event.event_type) {
    case 'phase_completed':
      return `Phase "${data.phase_name || 'Unknown'}" completed`
    case 'phase_started':
      return `Phase "${data.phase_name || 'Unknown'}" started`
    case 'task_updated':
      return `Task "${data.task_name || 'Unknown'}" updated`
    case 'note_added':
      return 'Developer note added'
    case 'file_uploaded':
      return `File "${data.file_name || 'Unknown'}" uploaded`
    case 'project_created':
      return 'Project created'
    case 'project_completed':
      return 'Project marked as complete'
    default:
      return 'Activity recorded'
  }
}

export default function ProjectActivityTimeline({
  activities,
  isLoading,
}: ProjectActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
          <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-zinc-800 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-zinc-800 rounded mb-2" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400 mb-4">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-medium">Project Timeline</h3>
        </div>
        <p className="text-sm text-zinc-500">No activity recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 text-zinc-400 mb-6">
        <Activity className="w-5 h-5" />
        <h3 className="text-sm font-medium">Project Timeline</h3>
        <span className="text-xs text-zinc-600">({activities.length} events)</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800" />

        <div className="space-y-6">
          {activities.map((activity, index) => {
            const config = eventTypeConfig[activity.event_type]
            const Icon = config?.icon || Activity
            const { date, time } = formatDateTime(activity.created_at)
            const isLast = index === activities.length - 1

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                    config?.bgColor || 'bg-zinc-800',
                    config?.color || 'text-zinc-400'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                  <p className="text-sm font-medium text-zinc-200">
                    {getEventTitle(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <span>{date}</span>
                    <span>•</span>
                    <span>{time}</span>
                  </div>
                  {activity.event_data?.description && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {activity.event_data.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

