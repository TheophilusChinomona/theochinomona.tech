/**
 * View User Dialog Component
 * Displays user details in a read-only dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/lib/db/users'
import { formatDistanceToNow } from 'date-fns'

interface ViewUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">User Details</DialogTitle>
          <DialogDescription className="text-zinc-400">
            View complete user information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">Name</label>
              <p className="text-zinc-100 mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400">
                Surname
              </label>
              <p className="text-zinc-100 mt-1">{user.surname}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <p className="text-zinc-100 mt-1">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Phone</label>
            <p className="text-zinc-100 mt-1">{user.phone || '-'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Role</label>
            <div className="mt-1">
              {user.role === 'admin' ? (
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  Admin
                </Badge>
              ) : (
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                  Client
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">
                Created At
              </label>
              <p className="text-zinc-100 mt-1">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(user.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400">
                Updated At
              </label>
              <p className="text-zinc-100 mt-1">
                {new Date(user.updated_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(user.updated_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">User ID</label>
            <p className="text-zinc-500 text-xs font-mono mt-1 break-all">
              {user.id}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

