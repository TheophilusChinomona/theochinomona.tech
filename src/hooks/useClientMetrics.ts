/**
 * Custom hooks for client dashboard metrics
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  getClientProjectMetrics,
  getNextMilestone,
  getProjectsByClientId,
} from '@/lib/db/clientProjects'
import { getActivityLogForUser } from '@/lib/db/activityLog'

/**
 * Hook to get client project metrics
 */
export function useClientMetrics() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['client', 'metrics', user?.id],
    queryFn: () => (user?.id ? getClientProjectMetrics(user.id) : Promise.reject('No user')),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Hook to get the next upcoming milestone
 */
export function useNextMilestone() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['client', 'next-milestone', user?.id],
    queryFn: () => (user?.id ? getNextMilestone(user.id) : Promise.reject('No user')),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to get recent activity for the client
 */
export function useRecentActivity(limit: number = 10) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['client', 'activity', user?.id, limit],
    queryFn: () => (user?.id ? getActivityLogForUser(user.id, limit) : Promise.reject('No user')),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get client's projects
 */
export function useClientProjects() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['client', 'projects', user?.id],
    queryFn: () => (user?.id ? getProjectsByClientId(user.id) : Promise.reject('No user')),
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  })
}

