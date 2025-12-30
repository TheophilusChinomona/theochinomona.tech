/**
 * Edit Phase Dialog Component
 * Dialog for editing an existing project phase
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updatePhase } from '@/lib/db/phases'
import { getTrackingCodeByProjectId } from '@/lib/db/tracking'
import { sendPhaseCompletionNotification } from '@/lib/db/notifications'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { ProjectPhase } from '@/lib/db/tracking'

const editPhaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  estimated_start_date: z.string().optional(),
  estimated_end_date: z.string().optional(),
  actual_start_date: z.string().optional(),
  actual_end_date: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  notify_on_complete: z.boolean(),
})

type EditPhaseFormData = z.infer<typeof editPhaseSchema>

interface EditPhaseDialogProps {
  phase: ProjectPhase
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPhaseDialog({
  phase,
  open,
  onOpenChange,
}: EditPhaseDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EditPhaseFormData>({
    resolver: zodResolver(editPhaseSchema),
    defaultValues: {
      name: phase.name,
      description: phase.description || '',
      estimated_start_date: phase.estimated_start_date || '',
      estimated_end_date: phase.estimated_end_date || '',
      actual_start_date: phase.actual_start_date || '',
      actual_end_date: phase.actual_end_date || '',
      status: phase.status,
      notify_on_complete: phase.notify_on_complete,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: phase.name,
        description: phase.description || '',
        estimated_start_date: phase.estimated_start_date || '',
        estimated_end_date: phase.estimated_end_date || '',
        actual_start_date: phase.actual_start_date || '',
        actual_end_date: phase.actual_end_date || '',
        status: phase.status,
        notify_on_complete: phase.notify_on_complete,
      })
    }
  }, [phase, open, reset])

  const status = watch('status')
  const notifyOnComplete = watch('notify_on_complete')

  const updatePhaseMutation = useMutation({
    mutationFn: async (data: EditPhaseFormData) => {
      const updatedPhase = await updatePhase(phase.id, {
        name: data.name,
        description: data.description || '',
        estimated_start_date: data.estimated_start_date || null,
        estimated_end_date: data.estimated_end_date || null,
        actual_start_date: data.actual_start_date || null,
        actual_end_date: data.actual_end_date || null,
        status: data.status,
        notify_on_complete: data.notify_on_complete,
      })

      // Check if phase was just completed and should send notification
      const wasCompleted = phase.status !== 'completed' && data.status === 'completed'
      if (wasCompleted && data.notify_on_complete) {
        try {
          const trackingCode = await getTrackingCodeByProjectId(phase.project_id)
          if (trackingCode) {
            const result = await sendPhaseCompletionNotification({
              projectId: phase.project_id,
              phaseId: phase.id,
              phaseName: data.name,
              trackingCode: trackingCode.code,
            })
            if (result.success && result.emailsSent && result.emailsSent > 0) {
              toast.info(`Notification sent to ${result.emailsSent} subscriber(s)`)
            }
          }
        } catch (notifError) {
          console.error('Failed to send notification:', notifError)
          // Don't fail the mutation if notification fails
        }
      }

      return updatedPhase
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] })
      toast.success('Phase updated successfully')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update phase')
    },
  })

  const onSubmit = async (data: EditPhaseFormData) => {
    updatePhaseMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Edit Phase</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update phase details and dates.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actual_start_date" className="text-zinc-300">
                Actual Start
              </Label>
              <Input
                id="actual_start_date"
                type="date"
                {...register('actual_start_date')}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_end_date" className="text-zinc-300">
                Actual End
              </Label>
              <Input
                id="actual_end_date"
                type="date"
                {...register('actual_end_date')}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
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
              disabled={updatePhaseMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePhaseMutation.isPending}>
              {updatePhaseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


