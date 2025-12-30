/**
 * Delete Task Dialog Component
 * Confirmation dialog for deleting a task
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteTask } from '@/lib/db/tasks'
import { toast } from 'sonner'
import type { ProjectTask } from '@/lib/db/tracking'

interface DeleteTaskDialogProps {
  task: ProjectTask
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
}: DeleteTaskDialogProps) {
  const queryClient = useQueryClient()

  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })

  const handleConfirm = () => {
    deleteTaskMutation.mutate()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400">Delete Task</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete the task{' '}
            <span className="font-semibold text-zinc-300">"{task.name}"</span>? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            disabled={deleteTaskMutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={deleteTaskMutation.isPending}
          >
            {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete Task'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


