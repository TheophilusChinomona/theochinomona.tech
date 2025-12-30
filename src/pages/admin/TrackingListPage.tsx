/**
 * Admin Tracking List Page
 * Shows all projects with their tracking codes for quick access
 */

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ClipboardList, 
  ExternalLink, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  FolderKanban,
  Bell,
  BellOff,
  User
} from 'lucide-react'
import { useState } from 'react'
import { getAllProjects } from '@/lib/db/projects'
import { getTrackingCodeByProjectId } from '@/lib/db/tracking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ProjectWithTracking {
  id: string
  title: string
  status: string
  trackingCode: string | null
  clientName: string | null
  clientId: string | null
  notificationsEnabled: boolean
}

export default function TrackingListPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['all-projects'],
    queryFn: getAllProjects,
  })

  // Fetch tracking codes for all projects
  const { data: projectsWithTracking, isLoading: trackingLoading } = useQuery({
    queryKey: ['projects-with-tracking', projects?.map(p => p.id)],
    queryFn: async (): Promise<ProjectWithTracking[]> => {
      if (!projects) return []
      
      const results = await Promise.all(
        projects.map(async (project) => {
          const trackingCode = await getTrackingCodeByProjectId(project.id)
          return {
            id: project.id,
            title: project.title,
            status: project.status,
            trackingCode: trackingCode?.code ?? null,
            clientName: project.client_name ?? null,
            clientId: project.client_id ?? null,
            notificationsEnabled: project.notifications_enabled ?? false,
          }
        })
      )
      
      return results
    },
    enabled: !!projects && projects.length > 0,
  })

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCopyTrackingUrl = async (code: string) => {
    const url = `${window.location.origin}/track/${code}`
    await navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const isLoading = projectsLoading || trackingLoading

  if (projectsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Project Tracking</h1>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">Failed to load projects</p>
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
          <h1 className="text-2xl font-bold text-zinc-100">Project Tracking</h1>
          <p className="text-zinc-400 mt-1">
            View and manage tracking codes for all projects
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading projects...</p>
          </CardContent>
        </Card>
      )}

      {/* Projects list */}
      {!isLoading && projectsWithTracking && (
        <div className="grid gap-4">
          {projectsWithTracking.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <FolderKanban className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No projects found</p>
                <Link to="/admin/projects/new">
                  <Button className="mt-4">Create Project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <TooltipProvider>
              {projectsWithTracking.map((project) => (
                <Card key={project.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-zinc-100 truncate">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant={project.status === 'published' ? 'default' : 'secondary'}
                            className={project.status === 'published' ? 'bg-green-500/10 text-green-400' : ''}
                          >
                            {project.status}
                          </Badge>
                          {project.clientName && (
                            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                              <User className="h-3 w-3 mr-1" />
                              {project.clientName}
                            </Badge>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center">
                                {project.notificationsEnabled ? (
                                  <Bell className="h-4 w-4 text-green-400" />
                                ) : (
                                  <BellOff className="h-4 w-4 text-zinc-500" />
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {project.notificationsEnabled 
                                ? 'Email notifications enabled' 
                                : 'Email notifications disabled'}
                            </TooltipContent>
                          </Tooltip>
                        </CardDescription>
                      </div>
                      <Link to={`/admin/projects/${project.id}/tracking`}>
                        <Button variant="outline" size="sm">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.trackingCode ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                          <code className="text-sm font-mono font-bold text-indigo-400">
                            {project.trackingCode}
                          </code>
                          <button
                            onClick={() => handleCopyCode(project.trackingCode!)}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors"
                            title="Copy tracking code"
                          >
                            {copiedCode === project.trackingCode ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-zinc-400" />
                            )}
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyTrackingUrl(project.trackingCode!)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Copy Tracking URL
                        </Button>
                        <a
                          href={`/track/${project.trackingCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View Public Page →
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        No tracking code generated yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  )
}

