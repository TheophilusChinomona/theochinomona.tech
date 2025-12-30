/**
 * NextMilestoneCard component
 * Shows the nearest upcoming phase deadline
 */

import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NextMilestone } from '@/lib/db/clientProjects'

interface NextMilestoneCardProps {
  milestone: NextMilestone | null | undefined
  isLoading?: boolean
}

export default function NextMilestoneCard({
  milestone,
  isLoading,
}: NextMilestoneCardProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
        <div className="h-6 w-48 bg-zinc-800 rounded mb-2" />
        <div className="h-4 w-24 bg-zinc-800 rounded" />
      </div>
    )
  }

  if (!milestone) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400 mb-4">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Next Milestone</span>
        </div>
        <p className="text-zinc-500 text-sm">No upcoming milestones</p>
      </div>
    )
  }

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-rose-400 bg-rose-500/10'
    if (days <= 3) return 'text-amber-400 bg-amber-500/10'
    if (days <= 7) return 'text-yellow-400 bg-yellow-500/10'
    return 'text-emerald-400 bg-emerald-500/10'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return '1 day remaining'
    return `${days} days remaining`
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Next Milestone</span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-lg font-semibold text-zinc-100">{milestone.phaseName}</p>
          <p className="text-sm text-zinc-500">{milestone.projectTitle}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-4 h-4" />
            <span>{formatDate(milestone.estimatedEndDate)}</span>
          </div>
          <span
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              getUrgencyColor(milestone.daysRemaining)
            )}
          >
            {getDaysText(milestone.daysRemaining)}
          </span>
        </div>

        <Link
          to={`/dashboard/projects/${milestone.projectId}`}
          className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
        >
          View project
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

