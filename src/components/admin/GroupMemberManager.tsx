/**
 * GroupMemberManager component
 * Manage members of a client group
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, X, Search, Loader2, Users } from 'lucide-react'
import { getGroupMembers, addUserToGroup, removeUserFromGroup } from '@/lib/db/clientGroups'
import { getClientUsers } from '@/lib/db/users'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { User } from '@/lib/db/users'

interface GroupMemberManagerProps {
  groupId: string
}

export default function GroupMemberManager({ groupId }: GroupMemberManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const queryClient = useQueryClient()

  // Fetch current group members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['client-groups', groupId, 'members'],
    queryFn: () => getGroupMembers(groupId),
  })

  // Fetch all client users for adding
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'clients'],
    queryFn: getClientUsers,
    enabled: showAddMenu,
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => addUserToGroup(groupId, userId),
    onSuccess: () => {
      toast.success('Member added to group')
      queryClient.invalidateQueries({ queryKey: ['client-groups', groupId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['client-groups'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add member')
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeUserFromGroup(groupId, userId),
    onSuccess: () => {
      toast.success('Member removed from group')
      queryClient.invalidateQueries({ queryKey: ['client-groups', groupId, 'members'] })
      queryClient.invalidateQueries({ queryKey: ['client-groups'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  // Filter available users (not already members)
  const memberIds = new Set(members?.map((m) => m.id) || [])
  const availableUsers = allUsers?.filter((u) => !memberIds.has(u.id)) || []
  const filteredUsers = availableUsers.filter((u) => {
    const query = searchQuery.toLowerCase()
    return (
      u.name?.toLowerCase().includes(query) ||
      u.surname?.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  })

  const getUserDisplayName = (user: User) => {
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`
    }
    if (user.name) {
      return user.name
    }
    return user.email
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Group Members ({members?.length || 0})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Add Member Panel */}
      {showAddMenu && (
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => addMemberMutation.mutate(user.id)}
                  disabled={addMemberMutation.isPending}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-lg text-left',
                    'hover:bg-zinc-700 transition-colors',
                    'disabled:opacity-50'
                  )}
                >
                  <div>
                    <p className="text-sm text-zinc-200">{getUserDisplayName(user)}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <UserPlus className="w-4 h-4 text-zinc-400" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">
              {searchQuery ? 'No matching users found' : 'All clients are already members'}
            </p>
          )}
        </div>
      )}

      {/* Current Members */}
      {membersLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      ) : members && members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {getUserDisplayName(member)}
                </p>
                <p className="text-xs text-zinc-500">{member.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMemberMutation.mutate(member.id)}
                disabled={removeMemberMutation.isPending}
                className="text-zinc-400 hover:text-rose-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center bg-zinc-800/20 rounded-lg border border-zinc-800 border-dashed">
          <Users className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm text-zinc-500">No members in this group yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Click "Add Member" to add clients to this group
          </p>
        </div>
      )}
    </div>
  )
}

