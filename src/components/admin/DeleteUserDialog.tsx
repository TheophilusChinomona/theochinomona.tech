/**
 * Delete User Dialog Component
 * Confirmation dialog for deleting users
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
import type { User } from '@/lib/db/users'

interface DeleteUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (user: User) => void
}

export default function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  const handleConfirm = () => {
    onConfirm(user)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-400">
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Are you sure you want to delete the account for{' '}
            <span className="font-semibold text-zinc-300">
              {user.name} {user.surname}
            </span>
            ? This action cannot be undone. All user data will be permanently
            removed from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

