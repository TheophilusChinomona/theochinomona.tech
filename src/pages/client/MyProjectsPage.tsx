/**
 * MyProjectsPage
 * Lists all projects assigned to the client with filtering options
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Filter, Search, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { getProjectsByClientId } from '@/lib/db/clientProjects'
import { supabase } from '@/lib/supabase'
import ClientProjectCard from '@/components/client/ClientProjectCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type StatusFilter = 'all' | 'in-progress' | 'completed'
type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

export default function MyProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch projects with phases
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['client', 'projects-with-phases', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const projects = await getProjectsByClientId(user.id)

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
    },
    enabled: !!user?.id,
  })

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projectsData) return []

    let filtered = projectsData

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        ({ project }) =>
          project.title.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(({ phaseCount, completedPhases }) => {
        const isCompleted = phaseCount > 0 && completedPhases === phaseCount
        if (statusFilter === 'completed') return isCompleted
        return !isCompleted
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
  }, [projectsData, statusFilter, sortBy, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">My Projects</h1>
          <p className="text-zinc-400 mt-1">
            View and track all projects assigned to you.
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
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100">
              <Filter className="w-4 h-4 mr-2 text-zinc-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
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

      {/* Projects Grid */}
      {!isLoading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(({ project, phaseCount, completedPhases }) => (
            <ClientProjectCard
              key={project.id}
              project={project}
              phaseCount={phaseCount}
              completedPhases={completedPhases}
              lastActivityDate={project.updated_at}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
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
              : "You don't have any projects assigned to you yet."}
          </p>
        </div>
      )}
    </div>
  )
}

