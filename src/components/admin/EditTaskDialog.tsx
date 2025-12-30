/**
 * Edit Task Dialog Component
 * Dialog for editing an existing task
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateTask } from '@/lib/db/tasks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { ProjectTask } from '@/lib/db/tracking'

const editTaskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  completion_percentage: z.coerce.number().min(0).max(100),
  developer_notes: z.string().optional(),
})

type EditTaskFormData = z.infer<typeof editTaskSchema>

interface EditTaskDialogProps {
  task: ProjectTask
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditTaskDialog({
  task,
  projectId,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || '',
      completion_percentage: task.completion_percentage,
      developer_notes: task.developer_notes || '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: task.name,
        description: task.description || '',
        completion_percentage: task.completion_percentage,
        developer_notes: task.developer_notes || '',
      })
    }
  }, [task, open, reset])

  const updateTaskMutation = useMutation({
    mutationFn: (data: EditTaskFormData) =>
      updateTask(task.id, {
        name: data.name,
        description: data.description || null,
        completion_percentage: data.completion_percentage,
        developer_notes: data.developer_notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task')
    },
  })

  const onSubmit = async (data: EditTaskFormData) => {
    updateTaskMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Edit Task</DialogTitle>
          <DialogDescription className="text-zinc-400">Update task details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Task Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-zinc-300">
              Description
            </Label>
            <Input
              id="description"
              {...register('description')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion_percentage" className="text-zinc-300">
              Completion Percentage
            </Label>
            <Input
              id="completion_percentage"
              type="number"
              min={0}
              max={100}
              {...register('completion_percentage')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.completion_percentage && (
              <p className="text-sm text-red-400">{errors.completion_percentage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="developer_notes" className="text-zinc-300">
              Developer Notes
            </Label>
            <Textarea
              id="developer_notes"
              {...register('developer_notes')}
              placeholder="Notes for the client about this task..."
              className="bg-zinc-950 border-zinc-800 text-zinc-100 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTaskMutation.isPending}>
              {updateTaskMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


