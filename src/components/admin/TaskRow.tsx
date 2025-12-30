/**
 * Task Row Component
 * Displays a task with drag-and-drop, inline completion editing, and CRUD actions
 */

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GripVertical, Edit, Trash2, MessageSquare, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { updateTaskCompletion } from '@/lib/db/tasks'
import { toast } from 'sonner'
import EditTaskDialog from './EditTaskDialog'
import DeleteTaskDialog from './DeleteTaskDialog'
import type { ProjectTask } from '@/lib/db/tracking'

interface TaskRowProps {
  task: ProjectTask
  projectId: string
}

export default function TaskRow({ task, projectId }: TaskRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [localPercentage, setLocalPercentage] = useState(task.completion_percentage)
  const queryClient = useQueryClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const updateCompletionMutation = useMutation({
    mutationFn: (percentage: number) => updateTaskCompletion(task.id, percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task completion')
      setLocalPercentage(task.completion_percentage)
    },
  })

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0]
    if (newValue !== undefined) {
      setLocalPercentage(newValue)
    }
  }

  const handleSliderCommit = (value: number[]) => {
    const newValue = value[0]
    if (newValue !== undefined && newValue !== task.completion_percentage) {
      updateCompletionMutation.mutate(newValue)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 ${
          isDragging ? 'ring-2 ring-indigo-500' : ''
        }`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Task name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 truncate">{task.name}</span>
            {task.developer_notes && (
              <MessageSquare
                className="h-4 w-4 text-zinc-500 flex-shrink-0"
                aria-label="Has developer notes"
              />
            )}
          </div>
          {task.description && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Attachment indicator (placeholder - will be integrated in Task Group 7) */}
        <div className="flex items-center gap-1 text-zinc-500">
          <Paperclip className="h-4 w-4" />
        </div>

        {/* Completion slider */}
        <div className="w-32 flex items-center gap-2">
          <Slider
            value={[localPercentage]}
            min={0}
            max={100}
            step={5}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="flex-1"
            disabled={updateCompletionMutation.isPending}
          />
          <span className="text-xs text-zinc-400 w-8 text-right">{localPercentage}%</span>
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

      {/* Dialogs */}
      <EditTaskDialog
        task={task}
        projectId={projectId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <DeleteTaskDialog task={task} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </>
  )
}


