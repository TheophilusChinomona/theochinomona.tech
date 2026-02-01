/**
 * MyProjectsPage
 * Unified project management page showing all client projects in separate sections
 * Task Group 12: Unified My Projects Page
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Filter, Search, Plus, Trash2, Copy } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getProjectsByClientId } from '@/lib/db/clientProjects'
import { softDeleteProject, cloneProject } from '@/lib/db/projects'
import { supabase } from '@/lib/supabase'
import ClientProjectCard from '@/components/client/ClientProjectCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import type { Project, ProjectStatus } from '@/lib/db/projects'

type StatusFilterGroup = 'all' | 'pending' | 'active' | 'completed'
type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

// Status badge colors
const getStatusBadge = (status: ProjectStatus) => {
  const badges: Record<ProjectStatus, { label: string; className: string }> = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    pending_payment: {
      label: 'Pending Payment',
      className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    pending_info: {
      label: 'Pending Info',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    in_testing: {
      label: 'In Testing',
      className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  }

  const badge = badges[status]
  return (
    <Badge
      variant="outline"
      className={`${badge.className} text-xs font-medium px-2 py-1`}
    >
      {badge.label}
    </Badge>
  )
}

export default function MyProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StatusFilterGroup>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Debug: Log user object to verify structure
  if (user) {
    console.log('[MyProjectsPage] User object:', {
      id: user.id,
      auth_user_id: user.auth_user_id,
      email: user.email,
      role: user.role,
    })
  }

  // Fetch projects with phases
  const { data: projectsData, isLoading, error: projectsError } = useQuery({
    queryKey: ['client', 'projects-with-phases', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[MyProjectsPage] No user ID available')
        return []
      }

      console.log('[MyProjectsPage] Fetching projects for user:', user.id)
      try {
        const projects = await getProjectsByClientId(user.id)
        console.log('[MyProjectsPage] Fetched projects:', projects.length)

        // Fetch phases for all projects
        const { data: phases } = await supabase
          .from('project_phases')
          .select('id, project_id, status')
          .in(
            'project_id',
            projects.map((p) => p.id)
          )

        // Create phase counts map
        const phaseCounts = new Map<string, { total: number; completed: number }>()
        for (const phase of phases || []) {
          const current = phaseCounts.get(phase.project_id) || { total: 0, completed: 0 }
          current.total += 1
          if (phase.status === 'completed') {
            current.completed += 1
          }
          phaseCounts.set(phase.project_id, current)
        }

        return projects.map((project) => ({
          project,
          phaseCount: phaseCounts.get(project.id)?.total ?? 0,
          completedPhases: phaseCounts.get(project.id)?.completed ?? 0,
        }))
      } catch (error) {
        console.error('[MyProjectsPage] Error fetching projects:', error)
        throw error
      }
    },
    enabled: !!user?.id,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => softDeleteProject(projectId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', 'projects-with-phases'] })
      toast.success('Project cancelled successfully')
      setDeleteDialogOpen(false)
      setSelectedProject(null)
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel project: ${error.message}`)
    },
  })

  // Clone mutation
  const cloneMutation = useMutation({
    mutationFn: (projectId: string) => cloneProject(projectId, user!.id),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['client', 'projects-with-phases'] })
      toast.success('Project cloned successfully')
      setCloneDialogOpen(false)
      setSelectedProject(null)
      navigate(`/dashboard/projects/${newProject.id}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to clone project: ${error.message}`)
    },
  })

  // Separate projects into active and pending
  const { activeProjects, pendingProjects } = useMemo(() => {
    if (!projectsData) return { activeProjects: [], pendingProjects: [] }

    const active: typeof projectsData = []
    const pending: typeof projectsData = []

    for (const item of projectsData) {
      const status = item.project.status
      if (['in_progress', 'in_testing', 'completed'].includes(status)) {
        active.push(item)
      } else if (['pending', 'pending_payment', 'pending_info'].includes(status)) {
        pending.push(item)
      }
    }

    return { activeProjects: active, pendingProjects: pending }
  }, [projectsData])

  // Filter projects by status group
  const filterProjects = (projects: typeof projectsData) => {
    if (!projects) return []

    let filtered = projects

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        ({ project }) =>
          project.title.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query)
      )
    }

    // Status group filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(({ project }) => {
        switch (statusFilter) {
          case 'pending':
            return ['pending', 'pending_payment', 'pending_info'].includes(project.status)
          case 'active':
            return ['in_progress', 'in_testing'].includes(project.status)
          case 'completed':
            return project.status === 'completed'
          default:
            return true
        }
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return (
            new Date(b.project.created_at).getTime() -
            new Date(a.project.created_at).getTime()
          )
        case 'date-asc':
          return (
            new Date(a.project.created_at).getTime() -
            new Date(b.project.created_at).getTime()
          )
        case 'name-asc':
          return a.project.title.localeCompare(b.project.title)
        case 'name-desc':
          return b.project.title.localeCompare(a.project.title)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredActiveProjects = useMemo(
    () => filterProjects(activeProjects),
    [activeProjects, statusFilter, sortBy, searchQuery]
  )
  const filteredPendingProjects = useMemo(
    () => filterProjects(pendingProjects),
    [pendingProjects, statusFilter, sortBy, searchQuery]
  )

  const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const handleCloneClick = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProject(project)
    setCloneDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id)
    }
  }

  const handleCloneConfirm = () => {
    if (selectedProject) {
      cloneMutation.mutate(selectedProject.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Projects</h1>
          <p className="text-zinc-400 mt-1">
            View and track all your projects in one place.
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/projects/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilterGroup)}
          >
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <Filter className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {projectsError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium mb-2">Error loading projects</p>
          <p className="text-red-500/80 text-sm">
            {projectsError instanceof Error ? projectsError.message : 'Unknown error'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 w-48 bg-zinc-800 rounded mb-4" />
              <div className="h-4 w-32 bg-zinc-800 rounded mb-4" />
              <div className="h-2 w-full bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Active Projects Section */}
      {!isLoading && (statusFilter === 'all' || statusFilter === 'active' || statusFilter === 'completed') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-zinc-100">Active Projects</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredActiveProjects.length}
            </Badge>
          </div>
          {filteredActiveProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActiveProjects.map(({ project, phaseCount, completedPhases }) => (
                <div key={project.id} className="relative group">
                  <ClientProjectCard
                    project={project}
                    phaseCount={phaseCount}
                    completedPhases={completedPhases}
                    lastActivityDate={project.updated_at}
                    statusBadge={getStatusBadge(project.status)}
                  />
                  {project.created_by === user?.id && !project.deleted_at && (
                    <div className="absolute bottom-6 right-6 flex gap-1 z-20">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCloneClick(project, e)
                        }}
                        title="Clone project"
                      >
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-400">No active projects found.</p>
            </div>
          )}
        </div>
      )}

      {/* Pending Projects Section */}
      {!isLoading && (statusFilter === 'all' || statusFilter === 'pending') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-zinc-100">Pending Projects</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredPendingProjects.length}
            </Badge>
          </div>
          {filteredPendingProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPendingProjects.map(({ project, phaseCount, completedPhases }) => (
                <div key={project.id} className="relative group">
                  <ClientProjectCard
                    project={project}
                    phaseCount={phaseCount}
                    completedPhases={completedPhases}
                    lastActivityDate={project.updated_at}
                    statusBadge={getStatusBadge(project.status)}
                  />
                  {project.created_by === user?.id && !project.deleted_at && (
                    <div className="absolute bottom-6 right-6 flex gap-1 z-20">
                      {['pending', 'pending_payment', 'pending_info'].includes(project.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-zinc-900/90 hover:bg-red-900/50 border border-zinc-800"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteClick(project, e)
                          }}
                          title="Delete project"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCloneClick(project, e)
                        }}
                        title="Clone project"
                      >
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-400">No pending projects found.</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        filteredActiveProjects.length === 0 &&
        filteredPendingProjects.length === 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No matching projects'
                : 'No projects yet'}
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : "You don't have any projects yet. Create your first project to get started."}
            </p>
          </div>
        )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Cancel Project</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to cancel this project? This will remove it from your
              dashboard. You can contact admin to restore it if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Cancelling...' : 'Cancel Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clone Confirmation Dialog */}
      <AlertDialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Clone Project</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Create a new project based on this one? This will copy the project details but
              create a new project with 'Pending' status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloneConfirm}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={cloneMutation.isPending}
            >
              {cloneMutation.isPending ? 'Cloning...' : 'Clone Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
