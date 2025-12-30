/**
 * Edit Project Page
 * Page for editing existing projects
 */

import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjectById, updateProject, type UpdateProjectInput } from '@/lib/db/projects'
import { toast } from 'sonner'
import ProjectForm from '@/components/admin/ProjectForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  })

  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: UpdateProjectInput }) =>
      updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['published-projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Project updated successfully')
      navigate('/admin/projects')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project')
    },
  })

  const handleSubmit = async (data: UpdateProjectInput) => {
    if (!id) return
    await updateProjectMutation.mutateAsync({ projectId: id, updates: data })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Edit Project</h1>
          <p className="text-zinc-400 mt-1">Update project information</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Project</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Project not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-indigo-400 hover:text-indigo-300"
            >
              ← Back to Projects
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Edit Project</h1>
        <p className="text-zinc-400 mt-1">Update project information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Update the information for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            project={project}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/projects')}
            isSubmitting={updateProjectMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

