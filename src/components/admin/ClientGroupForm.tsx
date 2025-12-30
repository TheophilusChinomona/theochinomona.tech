/**
 * ClientGroupForm component
 * Form for creating and editing client groups
 */

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ClientGroup } from '@/lib/db/types/dashboard'

interface ClientGroupFormProps {
  initialData?: ClientGroup
  onSubmit: (data: ClientGroupFormData) => void
  isSubmitting?: boolean
}

export interface ClientGroupFormData {
  name: string
  description: string | null
}

export default function ClientGroupForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ClientGroupFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-300">
          Group Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Premium Clients"
          required
          className="bg-zinc-900 border-zinc-800 text-zinc-100"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-300">
          Description (optional)
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this group..."
          rows={3}
          className="bg-zinc-900 border-zinc-800 text-zinc-100"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : initialData ? (
            'Update Group'
          ) : (
            'Create Group'
          )}
        </Button>
      </div>
    </form>
  )
}

