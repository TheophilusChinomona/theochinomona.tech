/**
 * NotificationsPage
 * Full list of all notifications for the client
 */

import { useState } from 'react'
import { Bell, Filter } from 'lucide-react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'
import NotificationItem from '@/components/client/NotificationItem'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FilterOption = 'all' | 'unread'

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterOption>('all')

  const { data: notifications, isLoading } = useNotifications(50, filter === 'unread')
  const markNotificationRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const handleMarkAllRead = () => {
    markAllRead.mutate()
  }

  const handleNotificationRead = (id: string) => {
    markNotificationRead.mutate(id)
  }

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Notifications</h1>
          <p className="text-zinc-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <Filter className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              {markAllRead.isPending ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-zinc-800 rounded mb-2" />
                  <div className="h-3 w-32 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {notifications.map((notification) => (
              <div key={notification.id} className="px-2">
                <NotificationItem
                  notification={notification}
                  onRead={handleNotificationRead}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-zinc-400 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You've read all your notifications. Great job staying on top of things!"
                : "You don't have any notifications yet. They'll appear here when there's activity on your projects."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

