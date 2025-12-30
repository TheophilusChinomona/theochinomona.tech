/**
 * CreateClientGroupPage
 * Page for creating a new client group
 */

import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createClientGroup } from '@/lib/db/clientGroups'
import ClientGroupForm, { type ClientGroupFormData } from '@/components/admin/ClientGroupForm'
import { toast } from 'sonner'

export default function CreateClientGroupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: ClientGroupFormData) =>
      createClientGroup(data.name, data.description),
    onSuccess: (group) => {
      toast.success('Client group created successfully')
      queryClient.invalidateQueries({ queryKey: ['client-groups'] })
      // Navigate to edit page to add members
      navigate(`/admin/client-groups/${group.id}/edit`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create client group')
    },
  })

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/admin/client-groups"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to client groups
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Create Client Group</h1>
        <p className="text-zinc-400 mt-1">
          Create a new group to organize your clients.
        </p>
      </div>

      {/* Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <ClientGroupForm
          onSubmit={(data) => createMutation.mutate(data)}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  )
}

