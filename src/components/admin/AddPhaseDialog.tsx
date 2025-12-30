/**
 * Add Phase Dialog Component
 * Dialog for creating a new project phase
 */

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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPhase } from '@/lib/db/phases'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const addPhaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  estimated_start_date: z.string().optional(),
  estimated_end_date: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  notify_on_complete: z.boolean(),
})

type AddPhaseFormData = z.infer<typeof addPhaseSchema>

interface AddPhaseDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddPhaseDialog({
  projectId,
  open,
  onOpenChange,
}: AddPhaseDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddPhaseFormData>({
    resolver: zodResolver(addPhaseSchema),
    defaultValues: {
      name: '',
      description: '',
      estimated_start_date: '',
      estimated_end_date: '',
      status: 'pending',
      notify_on_complete: true,
    },
  })

  const status = watch('status')
  const notifyOnComplete = watch('notify_on_complete')

  const createPhaseMutation = useMutation({
    mutationFn: createPhase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases', projectId] })
      toast.success('Phase created successfully')
      onOpenChange(false)
      reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create phase')
    },
  })

  const onSubmit = async (data: AddPhaseFormData) => {
    createPhaseMutation.mutate({
      project_id: projectId,
      name: data.name,
      description: data.description || '',
      estimated_start_date: data.estimated_start_date || null,
      estimated_end_date: data.estimated_end_date || null,
      status: data.status,
      notify_on_complete: data.notify_on_complete,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add New Phase</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a new phase for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Phase Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Design Phase"
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
              placeholder="Brief description of this phase"
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_start_date" className="text-zinc-300">
                Estimated Start
              </Label>
              <Input
                id="estimated_start_date"
                type="date"
                {...register('estimated_start_date')}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_end_date" className="text-zinc-300">
                Estimated End
              </Label>
              <Input
                id="estimated_end_date"
                type="date"
                {...register('estimated_end_date')}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Status</Label>
            <Select value={status} onValueChange={(v) => setValue('status', v as typeof status)}>
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify_on_complete"
              checked={notifyOnComplete}
              onCheckedChange={(checked) => setValue('notify_on_complete', checked as boolean)}
            />
            <Label htmlFor="notify_on_complete" className="text-zinc-300 cursor-pointer">
              Send notification when this phase is completed
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPhaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPhaseMutation.isPending}>
              {createPhaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Phase
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


