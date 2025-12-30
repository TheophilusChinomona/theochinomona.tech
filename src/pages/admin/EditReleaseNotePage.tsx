/**
 * EditReleaseNotePage
 * Page for editing an existing release note
 */

import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { updateReleaseNote, setReleaseNoteTargets, getReleaseNoteTargets } from '@/lib/db/releaseNotes'
import ReleaseNoteForm, { type ReleaseNoteFormData } from '@/components/admin/ReleaseNoteForm'
import { toast } from 'sonner'
import type { ReleaseNote, ReleaseNoteTarget } from '@/lib/db/types/dashboard'

export default function EditReleaseNotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch release note with targets
  const { data: releaseNoteData, isLoading } = useQuery({
    queryKey: ['release-notes', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided')

      // Fetch release note
      const { data: note, error } = await supabase
        .from('release_notes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Fetch targets
      const targets = await getReleaseNoteTargets(id)

      return { ...note, targets } as ReleaseNote & { targets: ReleaseNoteTarget[] }
    },
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ReleaseNoteFormData) => {
      if (!id) throw new Error('No ID provided')

      // Update the release note
      const releaseNote = await updateReleaseNote(id, {
        title: data.title,
        content: data.content,
        target_type: data.target_type,
        is_published: data.is_published,
      })

      // Update targets
      await setReleaseNoteTargets(id, data.targets)

      return releaseNote
    },
    onSuccess: () => {
      toast.success('Release note updated successfully')
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      navigate('/admin/release-notes')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update release note')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  if (!releaseNoteData) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Release note not found.</p>
        <Link
          to="/admin/release-notes"
          className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
        >
          Back to release notes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/admin/release-notes"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to release notes
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Edit Release Note</h1>
        <p className="text-zinc-400 mt-1">Update the release note content and targets.</p>
      </div>

      {/* Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <ReleaseNoteForm
          initialData={releaseNoteData}
          onSubmit={(data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
        />
      </div>
    </div>
  )
}

