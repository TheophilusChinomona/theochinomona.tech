/**
 * ClientDashboardHome page
 * Main dashboard view for clients showing metrics and activity
 */

import { FolderKanban, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useClientMetrics, useNextMilestone, useRecentActivity } from '@/hooks/useClientMetrics'
import MetricCard from '@/components/client/MetricCard'
import NextMilestoneCard from '@/components/client/NextMilestoneCard'
import ActivityFeed from '@/components/client/ActivityFeed'
import BillingSummaryWidget from '@/components/client/BillingSummaryWidget'

export default function ClientDashboardHome() {
  const { data: metrics, isLoading: metricsLoading } = useClientMetrics()
  const { data: milestone, isLoading: milestoneLoading } = useNextMilestone()
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity(10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Welcome back! Here's an overview of your projects.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Projects"
          value={metricsLoading ? '...' : metrics?.totalProjects ?? 0}
          icon={FolderKanban}
          color="indigo"
          description="Projects assigned to you"
        />
        <MetricCard
          title="In Progress"
          value={metricsLoading ? '...' : metrics?.inProgressCount ?? 0}
          icon={Clock}
          color="amber"
          description="Active projects"
        />
        <MetricCard
          title="Completed"
          value={metricsLoading ? '...' : metrics?.completedCount ?? 0}
          icon={CheckCircle}
          color="emerald"
          description="Finished projects"
        />
        <MetricCard
          title="Overall Progress"
          value={metricsLoading ? '...' : `${metrics?.overallCompletionPercentage ?? 0}%`}
          icon={TrendingUp}
          color="default"
          description="Across all projects"
        />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Milestone */}
        <NextMilestoneCard milestone={milestone} isLoading={milestoneLoading} />

        {/* Billing Summary */}
        <BillingSummaryWidget />

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed activities={activities} isLoading={activitiesLoading} />
        </div>
      </div>

      {/* Empty State for new clients */}
      {!metricsLoading && metrics?.totalProjects === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">
            No projects yet
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            You don't have any projects assigned to you yet. Once a project is
            created and assigned to you, it will appear here.
          </p>
        </div>
      )}
    </div>
  )
}

