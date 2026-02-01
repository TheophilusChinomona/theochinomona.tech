/**
 * TemplateSelectorDialog Component
 * Dialog for selecting a project template to pre-fill the form
 * Task Group 13: Project Creation Form Updates
 */

import { useQuery } from '@tanstack/react-query'
import { Loader2, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getTemplatesForUser } from '@/lib/db/projectTemplates'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import type { ProjectTemplateWithAttachments } from '@/lib/db/projectTemplates'

interface TemplateSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: ProjectTemplateWithAttachments) => void
}

export default function TemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorDialogProps) {
  const { user } = useAuth()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['project-templates', user?.id],
    queryFn: () => (user?.id ? getTemplatesForUser(user.id) : []),
    enabled: open && !!user?.id,
  })

  const handleSelect = (template: ProjectTemplateWithAttachments) => {
    onSelectTemplate(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Select a Template</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Choose a template to pre-fill your project form. You can edit the fields after
            selecting.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        )}

        {!isLoading && (!templates || templates.length === 0) && (
          <div className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400">No templates found.</p>
            <p className="text-sm text-zinc-500 mt-2">
              Create a project and save it as a template to use it here.
            </p>
          </div>
        )}

        {!isLoading && templates && templates.length > 0 && (
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className="w-full text-left p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-indigo-500/50 hover:bg-zinc-800 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-100 mb-1">{template.name}</h3>
                    <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                      {template.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{template.category}</span>
                      <span>•</span>
                      <span>
                        {template.tech.length} tech
                        {template.tech.length !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>
                        Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(template)
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

