/**
 * ReleaseNoteForm component
 * Form for creating and editing release notes
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Globe, Users, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getAllClientGroups } from '@/lib/db/clientGroups'
import { getClientUsers } from '@/lib/db/users'
import type { ReleaseNote, ReleaseNoteTargetType, ReleaseNoteTarget } from '@/lib/db/types/dashboard'

interface ReleaseNoteFormProps {
  initialData?: ReleaseNote & { targets?: ReleaseNoteTarget[] }
  onSubmit: (data: ReleaseNoteFormData) => void
  isSubmitting?: boolean
}

export interface ReleaseNoteFormData {
  title: string
  content: string
  target_type: ReleaseNoteTargetType
  targets: { type: 'group' | 'user'; id: string }[]
  is_published: boolean
}

const targetTypes: { value: ReleaseNoteTargetType; label: string; icon: typeof Globe }[] = [
  { value: 'all', label: 'All Clients', icon: Globe },
  { value: 'group', label: 'Specific Groups', icon: Users },
  { value: 'specific', label: 'Specific Users', icon: User },
]

export default function ReleaseNoteForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ReleaseNoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [targetType, setTargetType] = useState<ReleaseNoteTargetType>(
    initialData?.target_type || 'all'
  )
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false)

  // Load initial targets
  useEffect(() => {
    if (initialData?.targets) {
      const groups = initialData.targets
        .filter((t) => t.target_type === 'group')
        .map((t) => t.target_id)
      const users = initialData.targets
        .filter((t) => t.target_type === 'user')
        .map((t) => t.target_id)
      setSelectedGroups(groups)
      setSelectedUsers(users)
    }
  }, [initialData])

  // Fetch client groups
  const { data: clientGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['client-groups'],
    queryFn: getAllClientGroups,
    enabled: targetType === 'group',
  })

  // Fetch client users
  const { data: clientUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'clients'],
    queryFn: getClientUsers,
    enabled: targetType === 'specific',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const targets: { type: 'group' | 'user'; id: string }[] = []

    if (targetType === 'group') {
      selectedGroups.forEach((id) => targets.push({ type: 'group', id }))
    } else if (targetType === 'specific') {
      selectedUsers.forEach((id) => targets.push({ type: 'user', id }))
    }

    onSubmit({
      title,
      content,
      target_type: targetType,
      targets,
      is_published: isPublished,
    })
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-300">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., New Feature: Dashboard Analytics"
          required
          className="bg-zinc-900 border-zinc-800 text-zinc-100"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-zinc-300">
          Content (Markdown supported)
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your release note content here..."
          required
          rows={10}
          className="bg-zinc-900 border-zinc-800 text-zinc-100 font-mono text-sm"
        />
        <p className="text-xs text-zinc-500">
          Use # for headings, - for lists, and standard Markdown syntax.
        </p>
      </div>

      {/* Target Type */}
      <div className="space-y-3">
        <Label className="text-zinc-300">Target Audience</Label>
        <div className="grid grid-cols-3 gap-3">
          {targetTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setTargetType(type.value)}
                className={cn(
                  'p-4 rounded-lg border transition-all text-center',
                  targetType === type.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                )}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Group Selection */}
      {targetType === 'group' && (
        <div className="space-y-3">
          <Label className="text-zinc-300">Select Groups</Label>
          {groupsLoading ? (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading groups...</span>
            </div>
          ) : clientGroups && clientGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {clientGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                    selectedGroups.includes(group.id)
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  {group.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No client groups available. Create groups first.
            </p>
          )}
        </div>
      )}

      {/* User Selection */}
      {targetType === 'specific' && (
        <div className="space-y-3">
          <Label className="text-zinc-300">Select Users</Label>
          {usersLoading ? (
            <div className="flex items-center gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : clientUsers && clientUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {clientUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                    selectedUsers.includes(user.id)
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  {user.name || user.email}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No client users available.</p>
          )}
        </div>
      )}

      {/* Publish Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-lg border border-zinc-800">
        <input
          type="checkbox"
          id="is_published"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500"
        />
        <Label htmlFor="is_published" className="text-zinc-300 cursor-pointer">
          Publish immediately
        </Label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || !title || !content}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            'Update Release Note'
          ) : (
            'Create Release Note'
          )}
        </Button>
      </div>
    </form>
  )
}

