/**
 * Public Project Tracking Page
 * Allows clients to view project progress using a tracking code (no authentication required)
 */

import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, Home, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { getProjectByTrackingCode } from '@/lib/db/tracking'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PhaseTimeline from '@/components/tracking/PhaseTimeline'
import NotificationOptIn from '@/components/tracking/NotificationOptIn'

export default function TrackingPage() {
  const { code } = useParams<{ code: string }>()
  const { isAuthenticated, user } = useAuth()

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tracking-project', code],
    queryFn: () => getProjectByTrackingCode(code!),
    enabled: !!code,
    retry: false,
  })

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (user?.role === 'admin') return '/admin'
    return '/dashboard'
  }

  // Navigation header component
  const TrackingHeader = () => (
    <div className="bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <img
              src="/images/logos-svg/theochinomona-logo-transparent-accent.svg"
              alt="theochinomona.tech"
              className="h-28 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to={getDashboardUrl()}>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
            <Link to="/track">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Track Another
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <TrackingHeader />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading project...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error or invalid code state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <TrackingHeader />
        <div className="flex items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <CardTitle className="text-red-400">Invalid or Expired Tracking Code</CardTitle>
              <CardDescription className="text-zinc-400">
                The tracking code you entered is not valid or has been deactivated. 
                Please check with your project manager for a valid tracking code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <code className="text-lg font-mono text-zinc-500 bg-zinc-800 px-4 py-2 rounded-lg">
                  {code}
                </code>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/track" className="w-full">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Try Another Code
                  </Button>
                </Link>
                <Link to="/" className="w-full">
                  <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate overall progress
  const allTasks = project.phases.flatMap((phase) => phase.tasks)
  const totalTasks = allTasks.length
  const overallProgress =
    totalTasks > 0
      ? Math.round(allTasks.reduce((sum, t) => sum + t.completion_percentage, 0) / totalTasks)
      : 0

  // Count completed phases
  const completedPhases = project.phases.filter((p) => p.status === 'completed').length

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation Header */}
      <TrackingHeader />

      {/* Hero header */}
      <div className="bg-gradient-to-b from-indigo-950/40 to-zinc-950 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Project title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
              {project.title}
            </h1>
            
            {/* Project description */}
            {project.description && (
              <p className="text-lg text-zinc-400 mb-8 max-w-2xl">
                {project.description}
              </p>
            )}

            {/* Progress overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {/* Overall progress */}
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500 mb-2">Overall Progress</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-zinc-100">{overallProgress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Phases completed */}
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500 mb-2">Phases Completed</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-zinc-100">{completedPhases}</span>
                    <span className="text-lg text-zinc-500 mb-1">/ {project.phases.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks completed */}
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur">
                <CardContent className="p-6">
                  <p className="text-sm text-zinc-500 mb-2">Tasks</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-zinc-100">
                      {allTasks.filter((t) => t.completion_percentage === 100).length}
                    </span>
                    <span className="text-lg text-zinc-500 mb-1">/ {totalTasks} complete</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {project.phases.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <p className="text-zinc-400">No phases have been added to this project yet.</p>
                <p className="text-zinc-500 text-sm mt-2">Check back soon for updates!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Phase Timeline */}
              <PhaseTimeline 
                phases={project.phases} 
                attachments={project.attachments}
              />

              {/* Email notification opt-in */}
              {project.tracking_code && (
                <div className="mt-12">
                  <NotificationOptIn trackingCodeId={project.tracking_code.id} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-zinc-500">
            Tracking Code: <code className="text-zinc-400">{code}</code>
          </p>
        </div>
      </footer>
    </div>
  )
}

