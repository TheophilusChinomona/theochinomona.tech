/**
 * EditClientGroupPage
 * Page for editing an existing client group and managing members
 */

import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getClientGroupById, updateClientGroup } from '@/lib/db/clientGroups'
import ClientGroupForm, { type ClientGroupFormData } from '@/components/admin/ClientGroupForm'
import GroupMemberManager from '@/components/admin/GroupMemberManager'
import { toast } from 'sonner'

export default function EditClientGroupPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  // Fetch client group
  const { data: clientGroup, isLoading } = useQuery({
    queryKey: ['client-groups', id],
    queryFn: () => (id ? getClientGroupById(id) : Promise.reject('No ID')),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: ClientGroupFormData) =>
      id
        ? updateClientGroup(id, { name: data.name, description: data.description ?? undefined })
        : Promise.reject('No ID'),
    onSuccess: () => {
      toast.success('Client group updated successfully')
      queryClient.invalidateQueries({ queryKey: ['client-groups'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client group')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  if (!clientGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Client group not found.</p>
        <Link
          to="/admin/client-groups"
          className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
        >
          Back to client groups
        </Link>
      </div>
    )
  }

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
        <h1 className="text-2xl font-bold text-zinc-100">Edit Client Group</h1>
        <p className="text-zinc-400 mt-1">
          Update group details and manage members.
        </p>
      </div>

      {/* Group Details Form */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Group Details</h2>
        <ClientGroupForm
          initialData={clientGroup}
          onSubmit={(data) => updateMutation.mutate(data)}
          isSubmitting={updateMutation.isPending}
        />
      </div>

      {/* Member Management */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <GroupMemberManager groupId={id!} />
      </div>
    </div>
  )
}

