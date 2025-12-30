/**
 * View Project Dialog Component
 * Displays project details in a read-only dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/db/projects'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Github } from 'lucide-react'

interface ViewProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ViewProjectDialog({
  project,
  open,
  onOpenChange,
}: ViewProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{project.title}</DialogTitle>
          <DialogDescription className="text-zinc-400">View complete project information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-zinc-400">Description</label>
            <p className="text-zinc-100 mt-1">{project.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">Category</label>
              <div className="mt-1">
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                  {project.category}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400">Status</label>
              <div className="mt-1">
                {project.status === 'published' ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Published
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Draft
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Technologies</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <Badge key={tech} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {project.thumbnail && (
            <div>
              <label className="text-sm font-medium text-zinc-400">Thumbnail</label>
              <div className="mt-1">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full max-w-md h-auto rounded-lg border border-zinc-800"
                />
              </div>
            </div>
          )}

          {project.client_name && (
            <div>
              <label className="text-sm font-medium text-zinc-400">Client Name</label>
              <p className="text-zinc-100 mt-1">{project.client_name}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {project.project_url && (
              <div>
                <label className="text-sm font-medium text-zinc-400">Project URL</label>
                <div className="mt-1">
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Project
                  </a>
                </div>
              </div>
            )}
            {project.github_url && (
              <div>
                <label className="text-sm font-medium text-zinc-400">GitHub URL</label>
                <div className="mt-1">
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Github className="h-4 w-4" />
                    View Code
                  </a>
                </div>
              </div>
            )}
          </div>

          {project.completion_date && (
            <div>
              <label className="text-sm font-medium text-zinc-400">Completion Date</label>
              <p className="text-zinc-100 mt-1">
                {new Date(project.completion_date).toLocaleDateString()}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-zinc-400">Featured</label>
            <div className="mt-1">
              {project.featured ? (
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  Featured
                </Badge>
              ) : (
                <span className="text-zinc-500 text-sm">Not featured</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400">Created At</label>
              <p className="text-zinc-100 mt-1">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(project.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400">Updated At</label>
              <p className="text-zinc-100 mt-1">
                {new Date(project.updated_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {formatDistanceToNow(new Date(project.updated_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Project ID</label>
            <p className="text-zinc-500 text-xs font-mono mt-1 break-all">{project.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

