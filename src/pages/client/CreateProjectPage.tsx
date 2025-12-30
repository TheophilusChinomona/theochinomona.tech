/**
 * CreateProjectPage
 * Page for clients to create new projects
 */

import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ClientProjectForm from '@/components/client/ClientProjectForm'

export default function CreateProjectPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/dashboard/projects')
  }

  const handleCancel = () => {
    navigate('/dashboard/projects')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Create New Project</h1>
        <p className="text-zinc-400 mt-1">
          Submit a new project request. It will be reviewed by an admin before approval.
        </p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your project request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientProjectForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  )
}

