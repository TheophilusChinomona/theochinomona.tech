/**
 * Delete Phase Dialog Component
 * Confirmation dialog for deleting a phase
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
import { deletePhase } from '@/lib/db/phases'
import { toast } from 'sonner'
import type { ProjectPhase } from '@/lib/db/tracking'

interface DeletePhaseDialogProps {
  phase: ProjectPhase
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeletePhaseDialog({
  phase,
  open,
  onOpenChange,
}: DeletePhaseDialogProps) {
  const queryClient = useQueryClient()

  const deletePhaseMutation = useMutation({
    mutationFn: () => deletePhase(phase.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Phase deleted successfully')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete phase')
    },
  })

  const handleConfirm = () => {
    deletePhaseMutation.mutate()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400">Delete Phase</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete the phase{' '}
            <span className="font-semibold text-zinc-300">"{phase.name}"</span>? This action cannot
            be undone. All tasks within this phase will also be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            disabled={deletePhaseMutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={deletePhaseMutation.isPending}
          >
            {deletePhaseMutation.isPending ? 'Deleting...' : 'Delete Phase'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


