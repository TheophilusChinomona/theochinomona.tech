/**
 * Bulk Delete Projects Dialog Component
 * Confirmation dialog for deleting multiple projects
 */

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

interface BulkDeleteProjectsDialogProps {
  projectCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export default function BulkDeleteProjectsDialog({
  projectCount,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: BulkDeleteProjectsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400">Delete Multiple Projects</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete <span className="font-semibold text-zinc-300">{projectCount}</span>{' '}
            project{projectCount !== 1 ? 's' : ''}? This action cannot be undone. All selected
            project data will be permanently removed from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete ${projectCount} Project${projectCount !== 1 ? 's' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

