/**
 * NotificationDropdown component
 * Full notification dropdown with notifications and release notes
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Megaphone, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useReleaseNotes,
  useMarkReleaseNoteRead,
} from '@/hooks/useNotifications'
import NotificationItem from './NotificationItem'
import ReleaseNoteModal from './ReleaseNoteModal'
import type { ReleaseNote } from '@/lib/db/types/dashboard'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [selectedReleaseNote, setSelectedReleaseNote] = useState<ReleaseNote | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: notifications, isLoading: notificationsLoading } = useNotifications(10)
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: releaseNotes, isLoading: releaseNotesLoading } = useReleaseNotes()
  const markNotificationRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const markReleaseNoteRead = useMarkReleaseNoteRead()

  const displayCount = unreadCount > 9 ? '9+' : unreadCount

  const handleMarkAllRead = () => {
    markAllRead.mutate()
  }

  const handleNotificationRead = (id: string) => {
    markNotificationRead.mutate(id)
  }

  const handleReleaseNoteClick = (releaseNote: ReleaseNote) => {
    setSelectedReleaseNote(releaseNote)
    setModalOpen(true)
    setOpen(false) // Close dropdown
  }

  const handleReleaseNoteRead = (id: string) => {
    markReleaseNoteRead.mutate(id)
  }

  // Get unread release notes
  const unreadReleaseNotes = releaseNotes?.filter(
    (rn) => !(rn as any).is_read
  ) || []

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  'absolute -top-1 -right-1 flex items-center justify-center',
                  'min-w-[18px] h-[18px] px-1 text-xs font-bold',
                  'bg-indigo-500 text-white rounded-full',
                  'animate-in fade-in zoom-in duration-200'
                )}
              >
                {displayCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-96 bg-zinc-900 border-zinc-800 p-0 max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                {markAllRead.isPending ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Notifications Section */}
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="p-2">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={handleNotificationRead}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-sm text-zinc-500">No notifications</p>
              </div>
            )}

            {/* What's New Section */}
            {releaseNotes && releaseNotes.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                    <Megaphone className="w-3 h-3" />
                    What's New
                    {unreadReleaseNotes.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full">
                        {unreadReleaseNotes.length}
                      </span>
                    )}
                  </h4>
                </div>
                <div className="p-2">
                  {releaseNotes.slice(0, 3).map((releaseNote) => (
                    <button
                      key={releaseNote.id}
                      onClick={() => handleReleaseNoteClick(releaseNote)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        'hover:bg-zinc-800/50',
                        !(releaseNote as any).is_read && 'bg-zinc-800/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Megaphone className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                              {releaseNote.title}
                            </p>
                            {!(releaseNote as any).is_read && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-pink-500" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {releaseNote.published_at
                              ? new Date(releaseNote.published_at).toLocaleDateString(
                                  'en-US',
                                  { month: 'short', day: 'numeric' }
                                )
                              : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 p-2">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              View all notifications
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Release Note Modal */}
      <ReleaseNoteModal
        releaseNote={selectedReleaseNote}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRead={handleReleaseNoteRead}
      />
    </>
  )
}

