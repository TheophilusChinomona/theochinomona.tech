/**
 * Admin Project List Page
 * Displays all projects in a table with management actions
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, MoreVertical, Edit, Trash2, Eye, Plus, ClipboardList } from 'lucide-react'
import { getAllProjects, deleteProject, bulkDeleteProjects, type Project } from '@/lib/db/projects'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import DeleteProjectDialog from '@/components/admin/DeleteProjectDialog'
import BulkDeleteProjectsDialog from '@/components/admin/BulkDeleteProjectsDialog'
import ViewProjectDialog from '@/components/admin/ViewProjectDialog'

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjects,
  })

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Project deleted successfully')
      setDeletingProject(null)
      setSelectedProjects(new Set())
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Projects deleted successfully')
      setBulkDeleteOpen(false)
      setSelectedProjects(new Set())
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete projects')
    },
  })

  const handleDelete = (project: Project) => {
    deleteProjectMutation.mutate(project.id)
  }

  const handleBulkDelete = () => {
    if (selectedProjects.size > 0) {
      bulkDeleteMutation.mutate(Array.from(selectedProjects))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked && projects) {
      setSelectedProjects(new Set(projects.map((p) => p.id)))
    } else {
      setSelectedProjects(new Set())
    }
  }

  const handleSelectProject = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjects)
    if (checked) {
      newSelected.add(projectId)
    } else {
      newSelected.delete(projectId)
    }
    setSelectedProjects(newSelected)
  }

  // Filter projects based on search query
  const filteredProjects = projects?.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const allSelected = projects && projects.length > 0 && selectedProjects.size === projects.length

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-zinc-100">Projects</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Projects</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Projects</h1>
          <p className="text-zinc-400 mt-1">Manage all portfolio projects</p>
        </div>
        <Button onClick={() => navigate('/admin/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Projects</CardTitle>
          <CardDescription>Search by title or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProjects.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-zinc-300">
                {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
              </p>
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {filteredProjects?.length ?? 0} project{filteredProjects?.length !== 1 ? 's' : ''}{' '}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all projects"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={(checked) =>
                            handleSelectProject(project.id, checked as boolean)
                          }
                          aria-label={`Select ${project.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 text-xs font-medium">
                          {project.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {project.status === 'published' ? (
                          <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-medium">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                            Draft
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {project.featured ? (
                          <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                            Featured
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm">
                        {formatDistanceToNow(new Date(project.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setViewingProject(project)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/projects/${project.id}/tracking`)}
                              className="cursor-pointer"
                            >
                              <ClipboardList className="h-4 w-4 mr-2" />
                              Tracking & Phases
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingProject(project)}
                              className="cursor-pointer text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              {searchQuery
                ? 'No projects found matching your search'
                : 'No projects found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {viewingProject && (
        <ViewProjectDialog
          project={viewingProject}
          open={!!viewingProject}
          onOpenChange={(open) => !open && setViewingProject(null)}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
          onConfirm={handleDelete}
        />
      )}

      {bulkDeleteOpen && (
        <BulkDeleteProjectsDialog
          projectCount={selectedProjects.size}
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
        />
      )}
    </div>
  )
}

