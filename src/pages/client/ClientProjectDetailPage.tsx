/**
 * ClientProjectDetailPage
 * Detailed view of a single project for the client
 */

import { useParams, Link, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getClientProjectWithPhases } from '@/lib/db/clientProjects'
import { getActivityLogForProject } from '@/lib/db/activityLog'
import { getTrackingCodeByProjectId } from '@/lib/db/tracking'
import { getInvoicesForClient } from '@/lib/db/invoices'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import PrivateNotesSection from '@/components/client/PrivateNotesSection'
import OrganizedAttachments from '@/components/client/OrganizedAttachments'
import ProjectActivityTimeline from '@/components/client/ProjectActivityTimeline'
import { PayInvoiceButton } from '@/components/client/PayInvoiceButton'
import { useNavigate } from 'react-router-dom'

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch project with phases
  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['client', 'project', id, user?.id],
    queryFn: () =>
      id && user?.id
        ? getClientProjectWithPhases(id, user.id)
        : Promise.reject('Missing params'),
    enabled: !!id && !!user?.id,
  })

  // Fetch activity log
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activity-log', 'project', id],
    queryFn: () => (id ? getActivityLogForProject(id, 20) : Promise.reject('Missing ID')),
    enabled: !!id,
  })

  // Fetch tracking code
  const { data: trackingCode } = useQuery({
    queryKey: ['tracking-code', id],
    queryFn: () => (id ? getTrackingCodeByProjectId(id) : Promise.reject('Missing ID')),
    enabled: !!id,
  })

  // Fetch project invoices
  const { data: projectInvoices = [] } = useQuery({
    queryKey: ['invoices', 'client', user?.id, 'project', id],
    queryFn: () => (user?.id ? getInvoicesForClient(user.id) : []),
    enabled: !!user?.id,
    select: (invoices) => invoices.filter((inv) => inv.project_id === id),
  })

  // Calculate progress
  const phases = project?.project_phases || []
  const completedPhases = phases.filter((p) => p.status === 'completed').length
  const progress = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0
  const isCompleted = phases.length > 0 && completedPhases === phases.length

  const copyTrackingCode = () => {
    if (trackingCode?.code) {
      navigator.clipboard.writeText(trackingCode.code)
      toast.success('Tracking code copied to clipboard')
    }
  }

  if (!id) {
    return <Navigate to="/dashboard/projects" replace />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Project not found or access denied.</p>
        <Link to="/dashboard/projects" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard/projects"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Loading State */}
      {isLoading && (
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-2 w-full bg-zinc-800 rounded" />
        </div>
      )}

      {/* Project Header */}
      {project && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{project.title}</h1>
              <p className="text-zinc-400 mt-1">{project.category}</p>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400">
                  <Clock className="w-4 h-4" />
                  In Progress
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-200">Overall Progress</span>
              <span className="text-sm text-zinc-400">
                {completedPhases} of {phases.length} phases complete
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-2xl font-bold text-zinc-100">{progress}%</span>
            </div>
          </div>

          {/* Tracking Code */}
          {trackingCode ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                    Public Tracking Code
                  </p>
                  <p className="text-sm font-mono text-zinc-300">{trackingCode.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTrackingCode}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Link
                    to={`/track/${trackingCode.code}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Public Page
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-500">
                No tracking code generated yet. Contact your project manager for access.
              </p>
            </div>
          )}

          {/* Phases List */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Project Phases</h3>
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const phaseProgress =
                  phase.status === 'completed'
                    ? 100
                    : phase.status === 'in_progress'
                    ? 50
                    : 0

                return (
                  <div
                    key={phase.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        phase.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : phase.status === 'in_progress'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-zinc-800 text-zinc-500'
                      )}
                    >
                      {phase.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{phase.name}</p>
                      {phase.description && (
                        <p className="text-xs text-zinc-500 truncate">{phase.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {phase.estimated_end_date && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(phase.estimated_end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            phase.status === 'completed'
                              ? 'bg-emerald-500'
                              : phase.status === 'in_progress'
                              ? 'bg-amber-500'
                              : 'bg-zinc-700'
                          )}
                          style={{ width: `${phaseProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Two Column Layout for Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Private Notes */}
            <PrivateNotesSection notes={[]} isLoading={false} />

            {/* Attachments */}
            <OrganizedAttachments attachments={[]} isLoading={false} />
          </div>

          {/* Activity Timeline */}
          <ProjectActivityTimeline
            activities={activities || []}
            isLoading={activitiesLoading}
          />

          {/* Billing Section */}
          {projectInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Invoices</CardTitle>
                    <CardDescription>
                      {projectInvoices.length} invoice{projectInvoices.length !== 1 ? 's' : ''} for this project
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/billing')}
                  >
                    View All Invoices
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/billing/${invoice.id}`)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <Badge
                            className={
                              invoice.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : invoice.status === 'overdue'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                            }
                          >
                            {invoice.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400">
                          ${(invoice.total / 100).toFixed(2)}
                          {invoice.due_date &&
                            ` • Due: ${new Date(invoice.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(invoice.status === 'sent' ||
                          invoice.status === 'draft' ||
                          invoice.status === 'partially_paid') && (
                          <PayInvoiceButton
                            invoice={invoice}
                            variant="default"
                            size="sm"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/dashboard/billing/${invoice.id}`)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coming Soon Placeholder */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-xl p-6 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-5 h-5 text-zinc-600" />
              <h3 className="text-sm font-medium text-zinc-500">Direct Messaging</h3>
            </div>
            <p className="text-xs text-zinc-600">
              Real-time chat with your developer coming soon...
            </p>
          </div>
        </>
      )}
    </div>
  )
}

