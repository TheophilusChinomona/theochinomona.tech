/**
 * Admin Dashboard Overview Page
 * Displays statistics and recent activity for admin users
 */

import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Users, UserCheck, UserX, UserPlus } from 'lucide-react'
import { getDashboardStats } from '@/lib/db/users'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-zinc-100">{value}</div>
        )}
        {description && (
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-32 mt-1" />
      </CardContent>
    </Card>
  )
}

export default function DashboardOverview() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Dashboard</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Overview of your application and user base
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isRefetching}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              description="All registered users"
              icon={Users}
            />
            <StatCard
              title="Total Admins"
              value={stats?.totalAdmins ?? 0}
              description="Administrator accounts"
              icon={UserCheck}
            />
            <StatCard
              title="Total Clients"
              value={stats?.totalClients ?? 0}
              description="Client accounts"
              icon={UserX}
            />
            <StatCard
              title="Recent Signups"
              value={stats?.recentSignups ?? 0}
              description="Last 7 days"
              icon={UserPlus}
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100">Recent Signups</CardTitle>
              <CardDescription>
                Latest user registrations in the system
              </CardDescription>
            </div>
            <Link to="/admin/users">
              <Button variant="outline" size="sm">
                View All Users
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                      {user.surname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100">
                        {user.name} {user.surname}
                      </div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-zinc-300">
                      {user.role === 'admin' ? (
                        <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-xs">
                          Client
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              No recent signups to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

