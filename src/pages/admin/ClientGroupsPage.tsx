/**
 * ClientGroupsPage
 * Admin page for managing client groups
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, UsersRound, Edit, Trash2, Users, Loader2 } from 'lucide-react'
import { getAllClientGroups, deleteClientGroup } from '@/lib/db/clientGroups'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import type { ClientGroup } from '@/lib/db/types/dashboard'

export default function ClientGroupsPage() {
  const [deleteTarget, setDeleteTarget] = useState<ClientGroup | null>(null)
  const queryClient = useQueryClient()

  const { data: clientGroups, isLoading } = useQuery({
    queryKey: ['client-groups'],
    queryFn: getAllClientGroups,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClientGroup(id),
    onSuccess: () => {
      toast.success('Client group deleted')
      queryClient.invalidateQueries({ queryKey: ['client-groups'] })
      setDeleteTarget(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client group')
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Client Groups</h1>
          <p className="text-zinc-400 mt-1">
            Organize clients into groups for targeted communications.
          </p>
        </div>
        <Link to="/admin/client-groups/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Client Groups List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-zinc-500 animate-spin" />
            <p className="text-zinc-400">Loading client groups...</p>
          </div>
        ) : clientGroups && clientGroups.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {clientGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <UsersRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-zinc-100">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.member_count || 0} member{(group.member_count || 0) !== 1 ? 's' : ''}
                      </span>
                      {group.description && (
                        <span className="truncate max-w-xs">{group.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/admin/client-groups/${group.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(group)}
                    className="text-zinc-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <UsersRound className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              No client groups yet
            </h3>
            <p className="text-zinc-400 max-w-sm mx-auto mb-4">
              Create groups to organize your clients and target release notes.
            </p>
            <Link to="/admin/client-groups/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">
              Delete Client Group
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{deleteTarget?.name}"? Members will be
              removed from this group but their accounts will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

