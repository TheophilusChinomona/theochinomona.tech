/**
 * ReleaseNotesPage
 * Admin page for managing release notes
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Megaphone,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Globe,
  User,
  Loader2,
} from 'lucide-react'
import { getAllReleaseNotes, deleteReleaseNote, publishReleaseNote, updateReleaseNote } from '@/lib/db/releaseNotes'
import { cn } from '@/lib/utils'
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
import type { ReleaseNote } from '@/lib/db/types/dashboard'

function getTargetIcon(targetType: string) {
  switch (targetType) {
    case 'all':
      return Globe
    case 'group':
      return Users
    case 'specific':
      return User
    default:
      return Globe
  }
}

function getTargetLabel(targetType: string) {
  switch (targetType) {
    case 'all':
      return 'All Clients'
    case 'group':
      return 'Groups'
    case 'specific':
      return 'Specific Users'
    default:
      return targetType
  }
}

export default function ReleaseNotesPage() {
  const [deleteTarget, setDeleteTarget] = useState<ReleaseNote | null>(null)
  const queryClient = useQueryClient()

  const { data: releaseNotes, isLoading } = useQuery({
    queryKey: ['release-notes', 'all'],
    queryFn: getAllReleaseNotes,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReleaseNote(id),
    onSuccess: () => {
      toast.success('Release note deleted')
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      setDeleteTarget(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete release note')
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: async (note: ReleaseNote) => {
      if (note.is_published) {
        return updateReleaseNote(note.id, { is_published: false })
      } else {
        return publishReleaseNote(note.id)
      }
    },
    onSuccess: (_, note) => {
      toast.success(note.is_published ? 'Release note unpublished' : 'Release note published')
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update release note')
    },
  })

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Draft'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Release Notes</h1>
          <p className="text-zinc-400 mt-1">
            Manage announcements and updates for your clients.
          </p>
        </div>
        <Link to="/admin/release-notes/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Release Note
          </Button>
        </Link>
      </div>

      {/* Release Notes List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-zinc-500 animate-spin" />
            <p className="text-zinc-400">Loading release notes...</p>
          </div>
        ) : releaseNotes && releaseNotes.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {releaseNotes.map((note) => {
              const TargetIcon = getTargetIcon(note.target_type)

              return (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        note.is_published
                          ? 'bg-pink-500/10 text-pink-400'
                          : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-zinc-100 truncate">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                            note.is_published
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-500'
                          )}
                        >
                          {note.is_published ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {note.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <TargetIcon className="w-3 h-3" />
                          {getTargetLabel(note.target_type)}
                        </span>
                        <span>
                          {note.is_published
                            ? `Published ${formatDate(note.published_at)}`
                            : `Created ${formatDate(note.created_at)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublishMutation.mutate(note)}
                      disabled={togglePublishMutation.isPending}
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      {note.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Link to={`/admin/release-notes/${note.id}/edit`}>
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
                      onClick={() => setDeleteTarget(note)}
                      className="text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              No release notes yet
            </h3>
            <p className="text-zinc-400 max-w-sm mx-auto mb-4">
              Create your first release note to keep clients informed about updates.
            </p>
            <Link to="/admin/release-notes/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Release Note
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
              Delete Release Note
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{deleteTarget?.title}"? This action
              cannot be undone.
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

