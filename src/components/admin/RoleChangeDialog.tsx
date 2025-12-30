/**
 * Role Change Dialog Component
 * Confirmation dialog for changing user roles
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import type { User } from '@/lib/db/users'

interface RoleChangeDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (userId: string, newRole: 'admin' | 'client') => void
}

export default function RoleChangeDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
}: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'client'>(
    user.role
  )

  const handleConfirm = () => {
    if (selectedRole !== user.role) {
      onConfirm(user.id, selectedRole)
    } else {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-zinc-100">
            Change User Role
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            Select a new role for {user.name} {user.surname}. This will change
            their permissions in the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              New Role
            </label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as 'admin' | 'client')
              }
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            {selectedRole === user.role && (
              <p className="text-xs text-zinc-500 mt-1">
                This is the user's current role
              </p>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={selectedRole === user.role}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            Change Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

