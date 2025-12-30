/**
 * PrivateNotesSection component
 * Displays developer notes marked as private-to-client
 */

import { useState } from 'react'
import { FileText, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  content: string
  created_at: string
  phase_name?: string
}

interface PrivateNotesSectionProps {
  notes: Note[]
  isLoading?: boolean
}

export default function PrivateNotesSection({ notes, isLoading }: PrivateNotesSectionProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const toggleNote = (noteId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) {
        next.delete(noteId)
      } else {
        next.add(noteId)
      }
      return next
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
          <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="text-sm font-medium">Developer Notes</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 ml-auto">
            <Lock className="w-3 h-3" />
            For Client
          </span>
        </div>
        <p className="text-sm text-zinc-500">No developer notes yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 text-zinc-400 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="text-sm font-medium">Developer Notes</h3>
        <span className="text-xs text-zinc-600">({notes.length})</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 ml-auto">
          <Lock className="w-3 h-3" />
          For Client
        </span>
      </div>

      <div className="space-y-3">
        {notes.map((note) => {
          const isExpanded = expandedNotes.has(note.id)
          const isLongNote = note.content.length > 200

          return (
            <div
              key={note.id}
              className="border border-zinc-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => isLongNote && toggleNote(note.id)}
                className={cn(
                  'w-full text-left p-4 transition-colors',
                  isLongNote && 'hover:bg-zinc-800/50 cursor-pointer'
                )}
                disabled={!isLongNote}
              >
                <div className="flex items-start gap-2">
                  {isLongNote && (
                    <span className="text-zinc-500 mt-0.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.phase_name && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                          {note.phase_name}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-sm text-zinc-300 whitespace-pre-wrap',
                        !isExpanded && isLongNote && 'line-clamp-2'
                      )}
                    >
                      {note.content}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

