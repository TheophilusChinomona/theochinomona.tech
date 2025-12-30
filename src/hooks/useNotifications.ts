/**
 * Custom hooks for notifications and release notes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  getNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from '@/lib/db/notifications'
import {
  getReleaseNotesForUser,
  markReleaseNoteRead,
} from '@/lib/db/releaseNotes'

/**
 * Hook to get notifications for the current user
 */
export function useNotifications(limit: number = 10, unreadOnly: boolean = false) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', user?.id, limit, unreadOnly],
    queryFn: () =>
      user?.id
        ? getNotificationsForUser(user.id, limit, unreadOnly)
        : Promise.reject('No user'),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: () => (user?.id ? getUnreadCount(user.id) : Promise.resolve(0)),
    enabled: !!user?.id,
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count', user?.id],
      })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () =>
      user?.id ? markAllNotificationsRead(user.id) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count', user?.id],
      })
    },
  })
}

/**
 * Hook to get release notes for the current user
 */
export function useReleaseNotes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['release-notes', 'user', user?.id],
    queryFn: () =>
      user?.id ? getReleaseNotesForUser(user.id) : Promise.reject('No user'),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to mark a release note as read
 */
export function useMarkReleaseNoteRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (releaseNoteId: string) =>
      user?.id
        ? markReleaseNoteRead(releaseNoteId, user.id)
        : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release-notes', 'user', user?.id] })
    },
  })
}

