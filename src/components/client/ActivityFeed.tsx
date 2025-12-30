/**
 * ActivityFeed component
 * Displays recent activity log entries for the client
 */

import { Link } from 'react-router-dom'
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

interface ActivityFeedProps {
  activities: ActivityLogEntry[] | undefined
  isLoading?: boolean
}

const eventTypeConfig: Record<
  ActivityLogEventType,
  { icon: typeof Activity; color: string; label: string }
> = {
  phase_completed: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    label: 'Phase completed',
  },
  phase_started: {
    icon: PlayCircle,
    color: 'text-indigo-400',
    label: 'Phase started',
  },
  task_updated: {
    icon: Edit,
    color: 'text-amber-400',
    label: 'Task updated',
  },
  note_added: {
    icon: FileText,
    color: 'text-sky-400',
    label: 'Note added',
  },
  file_uploaded: {
    icon: Paperclip,
    color: 'text-violet-400',
    label: 'File uploaded',
  },
  project_created: {
    icon: FolderPlus,
    color: 'text-teal-400',
    label: 'Project created',
  },
  project_completed: {
    icon: Trophy,
    color: 'text-yellow-400',
    label: 'Project completed',
  },
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getEventDescription(event: ActivityLogEntry): string {
  const data = event.event_data || {}

  switch (event.event_type) {
    case 'phase_completed':
      return data.phase_name ? `"${data.phase_name}" was completed` : 'A phase was completed'
    case 'phase_started':
      return data.phase_name ? `"${data.phase_name}" is now in progress` : 'A phase was started'
    case 'task_updated':
      return data.task_name ? `Task "${data.task_name}" updated` : 'A task was updated'
    case 'note_added':
      return 'A new note was added'
    case 'file_uploaded':
      return data.file_name ? `"${data.file_name}" was uploaded` : 'A file was uploaded'
    case 'project_created':
      return 'Project was created'
    case 'project_completed':
      return 'Project was marked as complete'
    default:
      return 'Activity recorded'
  }
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-zinc-800 rounded-full" />
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

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h3>
        <div className="py-8 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm text-zinc-500">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const config = eventTypeConfig[activity.event_type]
          const Icon = config?.icon || Activity

          return (
            <Link
              key={activity.id}
              to={`/dashboard/projects/${activity.project_id}`}
              className="flex gap-3 group hover:bg-zinc-800/30 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors',
                  config?.color || 'text-zinc-400'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                  {getEventDescription(activity)}
                </p>
                <p className="text-xs text-zinc-500">{getTimeAgo(activity.created_at)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

