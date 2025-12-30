/**
 * NotificationItem component
 * Single notification item for display in dropdown or list
 */

import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  CheckCircle,
  Edit,
  FileText,
  Paperclip,
  Megaphone,
  AlertCircle,
  CreditCard,
  Receipt,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/lib/db/types/dashboard'

interface NotificationItemProps {
  notification: Notification
  onRead?: (id: string) => void
  compact?: boolean
}

const notificationTypeConfig: Record<
  NotificationType,
  { icon: LucideIcon; color: string }
> = {
  project_update: { icon: FolderKanban, color: 'text-indigo-400' },
  phase_complete: { icon: CheckCircle, color: 'text-emerald-400' },
  task_update: { icon: Edit, color: 'text-amber-400' },
  note_added: { icon: FileText, color: 'text-sky-400' },
  file_uploaded: { icon: Paperclip, color: 'text-violet-400' },
  release_note: { icon: Megaphone, color: 'text-pink-400' },
  system: { icon: AlertCircle, color: 'text-zinc-400' },
  invoice_sent: { icon: FileText, color: 'text-blue-400' },
  payment_received: { icon: CreditCard, color: 'text-emerald-400' },
  payment_failed: { icon: AlertCircle, color: 'text-red-400' },
  invoice_overdue: { icon: AlertCircle, color: 'text-orange-400' },
  refund_processed: { icon: Receipt, color: 'text-zinc-400' },
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationItem({
  notification,
  onRead,
  compact = false,
}: NotificationItemProps) {
  const navigate = useNavigate()
  const config = notificationTypeConfig[notification.type]
  const Icon = config?.icon || AlertCircle

  const handleClick = () => {
    // Mark as read
    if (!notification.read && onRead) {
      onRead(notification.id)
    }

    // Navigate based on notification data
    const data = notification.data
    if (data?.invoice_id) {
      // Navigate to invoice detail
      navigate(`/dashboard/billing/${data.invoice_id}`)
    } else if (data?.project_id) {
      navigate(`/dashboard/projects/${data.project_id}`)
    } else if (data?.release_note_id) {
      // Release notes are handled differently (open modal)
      // The parent component should handle this case
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left flex gap-3 p-3 rounded-lg transition-colors',
        'hover:bg-zinc-800/50',
        !notification.read && 'bg-zinc-800/30'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800',
          config?.color || 'text-zinc-400'
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium',
              notification.read ? 'text-zinc-300' : 'text-zinc-100'
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500" />
          )}
        </div>
        {!compact && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-zinc-600 mt-1">
          {getTimeAgo(notification.created_at)}
        </p>
      </div>
    </button>
  )
}

