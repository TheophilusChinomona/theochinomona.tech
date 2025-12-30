/**
 * ClientProjectCard component
 * Displays project info in a card format for the My Projects page
 */

import { Link } from 'react-router-dom'
import { Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/db/projects'

interface ClientProjectCardProps {
  project: Project
  phaseCount?: number
  completedPhases?: number
  lastActivityDate?: string
}

export default function ClientProjectCard({
  project,
  phaseCount = 0,
  completedPhases = 0,
  lastActivityDate,
}: ClientProjectCardProps) {
  const progress = phaseCount > 0 ? Math.round((completedPhases / phaseCount) * 100) : 0
  const isCompleted = phaseCount > 0 && completedPhases === phaseCount

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      )
    }
    if (completedPhases > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-400">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    )
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Link
      to={`/dashboard/projects/${project.id}`}
      className="block bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/50 hover:bg-zinc-900 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-white truncate">
            {project.title}
          </h3>
          <p className="text-sm text-zinc-400 mt-1">{project.category}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-zinc-500">
          {completedPhases} of {phaseCount} phases complete
        </div>
        {lastActivityDate && (
          <div className="text-zinc-600 text-xs">
            Last activity: {formatDate(lastActivityDate)}
          </div>
        )}
      </div>

      {/* View Arrow */}
      <div className="mt-4 flex items-center gap-1 text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">
        View details
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

