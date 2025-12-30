/**
 * Project Tracking Management Page
 * Admin page for managing project phases, tasks, and tracking codes
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ArrowLeft, Copy, RefreshCw, Plus, Check, Bell, BellOff, ExternalLink, User } from 'lucide-react'
import { getProjectById, updateProject } from '@/lib/db/projects'
import { getTrackingCodeByProjectId, regenerateTrackingCode } from '@/lib/db/tracking'
import { getPhasesByProjectId, updatePhaseOrder } from '@/lib/db/phases'
import { getTasksByPhaseIds, updateTaskOrder } from '@/lib/db/tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import PhaseCard from '@/components/admin/PhaseCard'
import AddPhaseDialog from '@/components/admin/AddPhaseDialog'
import type { ProjectTask } from '@/lib/db/tracking'

export default function ProjectTrackingPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [copiedCode, setCopiedCode] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [addPhaseDialogOpen, setAddPhaseDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch project details
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  })

  // Fetch tracking code
  const { data: trackingCode, isLoading: trackingCodeLoading } = useQuery({
    queryKey: ['tracking-code', projectId],
    queryFn: () => getTrackingCodeByProjectId(projectId!),
    enabled: !!projectId,
  })

  // Fetch phases
  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ['phases', projectId],
    queryFn: () => getPhasesByProjectId(projectId!),
    enabled: !!projectId,
  })

  // Fetch all tasks for all phases
  const phaseIds = phases.map((p) => p.id)
  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', phaseIds],
    queryFn: () => getTasksByPhaseIds(phaseIds),
    enabled: phaseIds.length > 0,
  })

  // Group tasks by phase
  const tasksByPhase = allTasks.reduce(
    (acc, task) => {
      if (!acc[task.phase_id]) {
        acc[task.phase_id] = []
      }
      const phaseTasks = acc[task.phase_id]
      if (phaseTasks) {
        phaseTasks.push(task)
      }
      return acc
    },
    {} as Record<string, ProjectTask[]>
  )

  // Regenerate tracking code mutation
  const regenerateMutation = useMutation({
    mutationFn: () => regenerateTrackingCode(projectId!),
    onSuccess: (newCode) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-code', projectId] })
      toast.success(`New tracking code generated: ${newCode}`)
      setRegenerateDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to regenerate tracking code')
    },
  })

  // Toggle notifications mutation
  const toggleNotificationsMutation = useMutation({
    mutationFn: (enabled: boolean) => updateProject(projectId!, { notifications_enabled: enabled }),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success(updatedProject.notifications_enabled ? 'Email notifications enabled' : 'Email notifications disabled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update notification settings')
    },
  })

  // Update phase order mutation
  const updatePhaseOrderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => updatePhaseOrder(projectId!, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phases', projectId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update phase order')
    },
  })

  const handleCopyCode = async () => {
    if (!trackingCode?.code) return
    try {
      await navigator.clipboard.writeText(trackingCode.code)
      setCopiedCode(true)
      toast.success('Tracking code copied to clipboard')
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      toast.error('Failed to copy tracking code')
    }
  }

  const handlePhaseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = phases.findIndex((p) => p.id === active.id)
    const newIndex = phases.findIndex((p) => p.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(phases, oldIndex, newIndex)
      updatePhaseOrderMutation.mutate(newOrder.map((p) => p.id))
    }
  }

  const handleTaskOrderChange = async (phaseId: string, orderedTaskIds: string[]) => {
    try {
      await updateTaskOrder(phaseId, orderedTaskIds)
      queryClient.invalidateQueries({ queryKey: ['tasks', phaseIds] })
    } catch (error) {
      toast.error('Failed to update task order')
    }
  }

  const isLoading = projectLoading || trackingCodeLoading || phasesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Project</CardTitle>
            <CardDescription>
              {projectError instanceof Error ? projectError.message : 'Project not found'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Calculate overall progress
  const totalTasks = allTasks.length
  const completedPercentage =
    totalTasks > 0
      ? Math.round(
          allTasks.reduce((sum, t) => sum + t.completion_percentage, 0) / totalTasks
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">{project.title}</h1>
            <p className="text-zinc-400 mt-1">Project Tracking Management</p>
          </div>
        </div>
      </div>

      {/* Tracking Code & Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Tracking</CardTitle>
              <CardDescription>
                Share this code with clients to give them access to track project progress
              </CardDescription>
            </div>
            {project.client_name && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <User className="h-3 w-3" />
                {project.client_name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tracking Code Display */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <Label className="text-xs text-zinc-500 mb-1 block">Tracking Code</Label>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-mono font-bold text-indigo-400 bg-zinc-800 px-4 py-2 rounded-lg">
                  {trackingCode?.code || 'No code generated'}
                </code>
                {trackingCode?.code && (
                  <>
                    <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copy code">
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="Open public tracking page"
                    >
                      <a href={`/track/${trackingCode.code}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-2">
                Public URL: <span className="text-indigo-400">{window.location.origin}/track/{trackingCode?.code}</span>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(true)}
              disabled={regenerateMutation.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${regenerateMutation.isPending ? 'animate-spin' : ''}`}
              />
              Regenerate Code
            </Button>
          </div>

          {/* Email Notifications Toggle */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {project.notifications_enabled ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <BellOff className="h-5 w-5 text-zinc-500" />
                  </div>
                )}
                <div>
                  <Label className="text-zinc-100 font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-zinc-400">
                    {project.notifications_enabled
                      ? 'Clients will receive emails when phases are completed'
                      : 'Email notifications are disabled for this project'}
                  </p>
                </div>
              </div>
              <Switch
                checked={project.notifications_enabled}
                onCheckedChange={(checked) => toggleNotificationsMutation.mutate(checked)}
                disabled={toggleNotificationsMutation.isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {phases.length} phases, {totalTasks} tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Completion</span>
              <span className="text-zinc-100 font-medium">{completedPercentage}%</span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-100">Phases</h2>
          <Button onClick={() => setAddPhaseDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </div>

        {phases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-zinc-400">No phases yet. Add your first phase to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handlePhaseDragEnd}
          >
            <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <PhaseCard
                    key={phase.id}
                    phase={phase}
                    tasks={tasksByPhase[phase.id] || []}
                    projectId={projectId!}
                    onTaskOrderChange={handleTaskOrderChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Regenerate Code Dialog */}
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-400">Regenerate Tracking Code</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will deactivate the current tracking code and generate a new one. Clients using
              the old code will no longer be able to view this project. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => regenerateMutation.mutate()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Regenerate Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Phase Dialog */}
      <AddPhaseDialog
        projectId={projectId!}
        open={addPhaseDialogOpen}
        onOpenChange={setAddPhaseDialogOpen}
      />
    </div>
  )
}


