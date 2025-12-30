/**
 * CreateReleaseNotePage
 * Page for creating a new release note
 */

import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createReleaseNote, setReleaseNoteTargets, publishReleaseNote } from '@/lib/db/releaseNotes'
import ReleaseNoteForm, { type ReleaseNoteFormData } from '@/components/admin/ReleaseNoteForm'
import { toast } from 'sonner'

export default function CreateReleaseNotePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: ReleaseNoteFormData) => {
      // Create the release note
      const releaseNote = await createReleaseNote({
        title: data.title,
        content: data.content,
        target_type: data.target_type,
      })

      // Set targets if needed
      if (data.targets.length > 0) {
        await setReleaseNoteTargets(releaseNote.id, data.targets)
      }

      // Publish if requested
      if (data.is_published) {
        await publishReleaseNote(releaseNote.id)
      }

      return releaseNote
    },
    onSuccess: () => {
      toast.success('Release note created successfully')
      queryClient.invalidateQueries({ queryKey: ['release-notes'] })
      navigate('/admin/release-notes')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create release note')
    },
  })

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
        <h1 className="text-2xl font-bold text-zinc-100">Create Release Note</h1>
        <p className="text-zinc-400 mt-1">
          Create an announcement for your clients.
        </p>
      </div>

      {/* Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <ReleaseNoteForm
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  )
}

