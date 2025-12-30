/**
 * Create Project Page
 * Page for creating new projects
 */

import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject, type CreateProjectInput, type UpdateProjectInput } from '@/lib/db/projects'
import { toast } from 'sonner'
import ProjectForm from '@/components/admin/ProjectForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['published-projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Project created successfully')
      navigate('/admin/projects')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })

  const handleSubmit = async (data: CreateProjectInput | UpdateProjectInput) => {
    if (!('title' in data) || !data.title) {
      throw new Error('Title is required')
    }
    const projectData = data as CreateProjectInput
    await createProjectMutation.mutateAsync(projectData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Create Project</h1>
        <p className="text-zinc-400 mt-1">Add a new project to your portfolio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Fill in the information for your new project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/projects')}
            isSubmitting={createProjectMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

