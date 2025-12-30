/**
 * Phase Card Component
 * Displays a project phase with drag-and-drop, expandable tasks, and CRUD actions
 */

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Bell,
  BellOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TaskRow from './TaskRow'
import EditPhaseDialog from './EditPhaseDialog'
import DeletePhaseDialog from './DeletePhaseDialog'
import AddTaskDialog from './AddTaskDialog'
import type { ProjectPhase, ProjectTask } from '@/lib/db/tracking'

interface PhaseCardProps {
  phase: ProjectPhase
  tasks: ProjectTask[]
  projectId: string
  onTaskOrderChange: (phaseId: string, orderedTaskIds: string[]) => void
}

export default function PhaseCard({
  phase,
  tasks,
  projectId,
  onTaskOrderChange,
}: PhaseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Calculate phase progress from tasks
  const progress =
    tasks.length > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.completion_percentage, 0) / tasks.length)
      : 0

  // Status badge color
  const statusColors = {
    pending: 'bg-zinc-600 text-zinc-200',
    in_progress: 'bg-blue-600 text-blue-100',
    completed: 'bg-green-600 text-green-100',
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
    })
  }

  const handleTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(tasks, oldIndex, newIndex)
      onTaskOrderChange(phase.id, newOrder.map((t) => t.id))
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`bg-zinc-900 border-zinc-800 ${isDragging ? 'ring-2 ring-indigo-500' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Expand/collapse button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-zinc-400 hover:text-zinc-200"
            >
              {expanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {/* Phase info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-zinc-100 truncate">{phase.name}</h3>
                <Badge className={statusColors[phase.status]}>{statusLabels[phase.status]}</Badge>
                {phase.notify_on_complete ? (
                  <Bell className="h-4 w-4 text-zinc-500" aria-label="Notifications enabled" />
                ) : (
                  <BellOff className="h-4 w-4 text-zinc-600" aria-label="Notifications disabled" />
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                {/* Date range */}
                {(phase.estimated_start_date || phase.estimated_end_date) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(phase.estimated_start_date)} -{' '}
                    {formatDate(phase.estimated_end_date)}
                  </span>
                )}
                {/* Task count */}
                <span>{tasks.length} tasks</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-32">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-500">Progress</span>
                <span className="text-zinc-300">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expanded content - Tasks */}
        {expanded && (
          <CardContent className="pt-0">
            <div className="border-t border-zinc-800 pt-4 space-y-3">
              {/* Description */}
              {phase.description && (
                <p className="text-sm text-zinc-400 mb-4">{phase.description}</p>
              )}

              {/* Tasks list */}
              {tasks.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No tasks yet. Add your first task.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleTaskDragEnd}
                >
                  <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskRow key={task.id} task={task} projectId={projectId} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Add task button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => setAddTaskDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dialogs */}
      <EditPhaseDialog phase={phase} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <DeletePhaseDialog
        phase={phase}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      <AddTaskDialog
        phaseId={phase.id}
        projectId={projectId}
        open={addTaskDialogOpen}
        onOpenChange={setAddTaskDialogOpen}
      />
    </>
  )
}


