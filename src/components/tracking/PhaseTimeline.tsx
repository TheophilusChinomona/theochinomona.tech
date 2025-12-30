/**
 * Phase Timeline Component
 * Visual timeline of project phases with status indicators (public view)
 */

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  PlayCircle,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TaskList from './TaskList'
import AttachmentGallery from './AttachmentGallery'
import type { ProjectPhase, ProjectTask, ProjectAttachment } from '@/lib/db/tracking'

interface PhaseTimelineProps {
  phases: (ProjectPhase & { tasks: ProjectTask[] })[]
  attachments: ProjectAttachment[]
}

export default function PhaseTimeline({ phases, attachments }: PhaseTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    // Expand in-progress phases by default
    new Set(phases.filter((p) => p.status === 'in_progress').map((p) => p.id))
  )

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  // Get attachments for a specific phase
  const getPhaseAttachments = (phaseId: string) => {
    return attachments.filter((a) => a.phase_id === phaseId && !a.task_id)
  }

  // Get attachments for a specific task
  const getTaskAttachments = (taskId: string) => {
    return attachments.filter((a) => a.task_id === taskId)
  }

  // Status icons and colors
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-400" />
      case 'in_progress':
        return <PlayCircle className="h-6 w-6 text-blue-400" />
      default:
        return <Circle className="h-6 w-6 text-zinc-600" />
    }
  }

  const statusColors = {
    pending: 'bg-zinc-700 text-zinc-300',
    in_progress: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    completed: 'bg-green-600/20 text-green-400 border-green-600/30',
  }

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  }

  // Format dates
  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateRange = (start: string | null, end: string | null, useActual: boolean) => {
    if (!start && !end) return null
    const prefix = useActual ? '' : 'Est. '
    return `${prefix}${formatDate(start) || 'TBD'} – ${formatDate(end) || 'TBD'}`
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-700 via-zinc-700 to-transparent" />

      {/* Phases */}
      <div className="space-y-6">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhases.has(phase.id)
          const phaseAttachments = getPhaseAttachments(phase.id)
          
          // Calculate phase progress from tasks
          const progress =
            phase.tasks.length > 0
              ? Math.round(
                  phase.tasks.reduce((sum, t) => sum + t.completion_percentage, 0) /
                    phase.tasks.length
                )
              : 0

          // Determine if using actual or estimated dates
          const hasActualDates = phase.actual_start_date || phase.actual_end_date
          const dateRange = hasActualDates
            ? formatDateRange(phase.actual_start_date, phase.actual_end_date, true)
            : formatDateRange(phase.estimated_start_date, phase.estimated_end_date, false)

          return (
            <div key={phase.id} className="relative pl-10">
              {/* Timeline node */}
              <div className="absolute left-0 top-6 z-10">
                {getStatusIcon(phase.status)}
              </div>

              <Card
                className={`bg-zinc-900/80 border-zinc-800 transition-all ${
                  phase.status === 'in_progress'
                    ? 'ring-1 ring-blue-500/30'
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="flex items-start gap-3 w-full text-left group"
                  >
                    {/* Expand/collapse indicator */}
                    <span className="mt-1.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Phase number */}
                        <span className="text-xs text-zinc-500 font-medium">
                          Phase {index + 1}
                        </span>
                        {/* Status badge */}
                        <Badge
                          variant="outline"
                          className={statusColors[phase.status]}
                        >
                          {statusLabels[phase.status]}
                        </Badge>
                      </div>

                      {/* Phase name */}
                      <h3 className="text-xl font-semibold text-zinc-100 mt-1.5 group-hover:text-white transition-colors">
                        {phase.name}
                      </h3>

                      {/* Meta info */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {/* Date range */}
                        {dateRange && (
                          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {dateRange}
                          </span>
                        )}
                        {/* Task count */}
                        <span className="text-sm text-zinc-500">
                          {phase.tasks.length} task{phase.tasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-24 shrink-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">Progress</span>
                        <span
                          className={
                            progress === 100 ? 'text-green-400' : 'text-zinc-300'
                          }
                        >
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress === 100
                              ? 'bg-green-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                </CardHeader>

                {/* Expanded content */}
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="border-t border-zinc-800 pt-4">
                      {/* Phase description */}
                      {phase.description && (
                        <p className="text-zinc-400 mb-6">{phase.description}</p>
                      )}

                      {/* Phase attachments */}
                      {phaseAttachments.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-zinc-300 mb-3">
                            Phase Files
                          </h4>
                          <AttachmentGallery attachments={phaseAttachments} />
                        </div>
                      )}

                      {/* Tasks list */}
                      <TaskList
                        tasks={phase.tasks}
                        getTaskAttachments={getTaskAttachments}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

