/**
 * ReleaseNoteModal component
 * Full-screen modal for displaying release note content
 */

import { useEffect } from 'react'
import { X, Calendar, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ReleaseNote } from '@/lib/db/types/dashboard'

interface ReleaseNoteModalProps {
  releaseNote: ReleaseNote | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRead?: (id: string) => void
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Simple markdown-like renderer for basic formatting
function renderContent(content: string): JSX.Element {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []

  lines.forEach((line, index) => {
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-semibold text-zinc-100 mt-6 mb-2">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl font-semibold text-zinc-100 mt-6 mb-3">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl font-bold text-zinc-100 mt-4 mb-4">
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="text-zinc-300 ml-4 list-disc">
          {line.slice(2)}
        </li>
      )
    } else if (line.startsWith('* ')) {
      elements.push(
        <li key={index} className="text-zinc-300 ml-4 list-disc">
          {line.slice(2)}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<br key={index} />)
    } else {
      elements.push(
        <p key={index} className="text-zinc-300 leading-relaxed">
          {line}
        </p>
      )
    }
  })

  return <>{elements}</>
}

export default function ReleaseNoteModal({
  releaseNote,
  open,
  onOpenChange,
  onRead,
}: ReleaseNoteModalProps) {
  // Mark as read when modal opens
  useEffect(() => {
    if (open && releaseNote && onRead) {
      onRead(releaseNote.id)
    }
  }, [open, releaseNote, onRead])

  if (!releaseNote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'bg-zinc-900 border-zinc-800 text-zinc-100',
          'max-w-2xl max-h-[90vh] overflow-hidden flex flex-col',
          'p-0'
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Megaphone className="w-6 h-6 text-pink-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-zinc-100">
                {releaseNote.title}
              </DialogTitle>
              {releaseNote.published_at && (
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(releaseNote.published_at)}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="prose prose-invert prose-zinc max-w-none">
            {renderContent(releaseNote.content)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

