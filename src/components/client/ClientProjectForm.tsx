/**
 * Client Project Form Component
 * Form for clients to create new projects (which will be pending approval)
 */

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'react-router-dom'
import { X, Plus, Loader2, Upload, FileImage, FileText, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  validateRequestAttachmentFile,
} from '@/lib/storage'
import { createProject } from '@/lib/db/projects'
import { createTemplate } from '@/lib/db/projectTemplates'
import { getProjectById } from '@/lib/db/projects'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import TemplateSelectorDialog from '@/components/project/TemplateSelectorDialog'
import type { ProjectTemplateWithAttachments } from '@/lib/db/projectTemplates'

const clientProjectFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  tech: z
    .array(z.string().min(2, 'Each tech item must be at least 2 characters'))
    .min(1, 'At least one technology is required'),
  category: z.enum(['Web', 'Mobile', 'Full-Stack', 'Design']).refine(
    (val) => val !== undefined,
    {
      message: 'Category is required',
    }
  ),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  special_requirements: z.string().optional(),
  payment_preference: z
    .enum(['upfront_deposit', 'milestone_based'])
    .optional()
    .nullable(),
  attachments: z.array(z.instanceof(File)).optional(),
  is_hiring_request: z.boolean().optional(),
  save_as_template: z.boolean().optional(),
})

type ClientProjectFormData = z.infer<typeof clientProjectFormSchema>

interface ClientProjectFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ClientProjectForm({
  onSuccess,
  onCancel,
}: ClientProjectFormProps) {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [isHiringRequest, setIsHiringRequest] = useState(false)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)

  const form = useForm<ClientProjectFormData>({
    resolver: zodResolver(clientProjectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tech: [],
      category: undefined,
      budget_range: '',
      timeline: '',
      special_requirements: '',
      payment_preference: null,
      attachments: [],
      is_hiring_request: false,
      save_as_template: false,
    },
  })

  // Pre-fill form from cloned project if clone_id is in URL
  useEffect(() => {
    const cloneId = searchParams.get('clone_id')
    if (cloneId && user?.id) {
      getProjectById(cloneId)
        .then((project) => {
          if (project && project.created_by === user.id) {
            form.setValue('title', project.title.replace(' (Copy)', ''))
            form.setValue('description', project.description)
            form.setValue('category', project.category as 'Web' | 'Mobile' | 'Full-Stack' | 'Design')
            form.setValue('tech', project.tech)
            setIsHiringRequest(project.is_hiring_request)
          }
        })
        .catch((error) => {
          console.error('Failed to load cloned project:', error)
        })
    }
  }, [searchParams, user?.id, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control as never,
    name: 'tech' as never,
  })

  const handleAddTech = () => {
    const trimmed = techInput.trim()
    if (trimmed && !form.getValues('tech').includes(trimmed)) {
      append(trimmed as never)
      setTechInput('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []

    for (const file of files) {
      try {
        validateRequestAttachmentFile(file)
        validFiles.push(file)
      } catch (error) {
        toast.error(
          `File ${file.name} is invalid: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    setAttachmentFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTemplateSelect = (template: ProjectTemplateWithAttachments) => {
    form.setValue('title', template.title)
    form.setValue('description', template.description)
    form.setValue('category', template.category as 'Web' | 'Mobile' | 'Full-Stack' | 'Design')
    form.setValue('tech', template.tech)
    form.setValue('budget_range', template.budget_range || '')
    form.setValue('timeline', template.timeline || '')
    form.setValue('special_requirements', template.special_requirements || '')
    setIsHiringRequest(template.is_hiring_request)
    toast.success('Template loaded. You can edit the fields before submitting.')
  }

  const onSubmit = async (data: ClientProjectFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a project')
      return
    }

    setIsSubmitting(true)
    setUploadingFiles(false)

    try {
      // Create project with status 'pending' (new unified status system)
      await createProject({
        title: data.title,
        description: data.description,
        tech: data.tech,
        category: data.category,
        status: 'pending',
        created_by: user.id,
        client_id: user.id,
        is_hiring_request: isHiringRequest,
        payment_preference: data.payment_preference || null,
        requires_payment: null, // Admin decides
        deposit_paid: false,
      })

      // Save as template if checkbox is checked
      if (saveAsTemplate) {
        try {
          await createTemplate({
            userId: user.id,
            templateName: `${data.title} Template`,
            projectData: {
              title: data.title,
              description: data.description,
              category: data.category,
              tech: data.tech,
              budget_range: data.budget_range || null,
              timeline: data.timeline || null,
              special_requirements: data.special_requirements || null,
              is_hiring_request: isHiringRequest,
            },
          })
          toast.success('Project and template created successfully!')
        } catch (templateError) {
          console.error('Failed to create template:', templateError)
          toast.warning('Project created, but failed to save template.')
        }
      }

      toast.success('Project created successfully! It is now pending admin review.')
      form.reset()
      setAttachmentFiles([])
      setIsHiringRequest(false)
      setSaveAsTemplate(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating project:', error)
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to create project. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
        // Check for common Supabase RLS errors
        if (error.message.includes('permission denied') || error.message.includes('new row violates')) {
          errorMessage = 'Permission denied. Please ensure you are logged in and have permission to create projects.'
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Invalid project data. Please check all required fields.'
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message)
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setUploadingFiles(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Project Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...form.register('title')}
          placeholder="e.g., E-commerce Website"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Describe your project in detail..."
          rows={6}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.watch('category') || ''}
          onValueChange={(value) =>
            form.setValue('category', value as 'Web' | 'Mobile' | 'Full-Stack' | 'Design')
          }
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Web">Web</SelectItem>
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Full-Stack">Full-Stack</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-red-500">
            {form.formState.errors.category.message}
          </p>
        )}
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Tech Stack <span className="text-red-500">*</span></Label>
        <div className="flex gap-2">
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTech()
              }
            }}
            placeholder="e.g., React, Node.js"
          />
          <Button type="button" onClick={handleAddTech} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {fields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-md"
              >
                <span className="text-sm">{form.watch(`tech.${index}`)}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {form.formState.errors.tech && (
          <p className="text-sm text-red-500">
            {form.formState.errors.tech.message}
          </p>
        )}
      </div>

      {/* Budget Range */}
      <div className="space-y-2">
        <Label htmlFor="budget_range">Budget Range (Optional)</Label>
        <Input
          id="budget_range"
          {...form.register('budget_range')}
          placeholder="e.g., $5,000 - $10,000"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline (Optional)</Label>
        <Input
          id="timeline"
          {...form.register('timeline')}
          placeholder="e.g., 3-6 months"
        />
      </div>

      {/* Special Requirements */}
      <div className="space-y-2">
        <Label htmlFor="special_requirements">Special Requirements (Optional)</Label>
        <Textarea
          id="special_requirements"
          {...form.register('special_requirements')}
          placeholder="Any special requirements or notes..."
          rows={4}
        />
      </div>

      {/* Payment Preference */}
      <div className="space-y-2">
        <Label htmlFor="payment_preference">Payment Preference (Optional)</Label>
        <Select
          value={form.watch('payment_preference') || ''}
          onValueChange={(value) =>
            form.setValue(
              'payment_preference',
              value === '' ? null : (value as 'upfront_deposit' | 'milestone_based')
            )
          }
        >
          <SelectTrigger id="payment_preference">
            <SelectValue placeholder="Select payment preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upfront_deposit">Upfront Deposit</SelectItem>
            <SelectItem value="milestone_based">Milestone-Based</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-zinc-400">
          This is just a preference. The admin will determine if payment is required.
        </p>
      </div>

      {/* Use Template Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setTemplateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <FileCheck className="h-4 w-4" />
          Use Template
        </Button>
      </div>

      {/* I'm Hiring You Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_hiring_request"
          checked={isHiringRequest}
          onCheckedChange={(checked) => setIsHiringRequest(checked === true)}
        />
        <Label
          htmlFor="is_hiring_request"
          className="text-sm font-normal cursor-pointer"
        >
          I'm hiring you for this project
        </Label>
      </div>

      {/* Save as Template Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="save_as_template"
          checked={saveAsTemplate}
          onCheckedChange={(checked) => setSaveAsTemplate(checked === true)}
        />
        <Label
          htmlFor="save_as_template"
          className="text-sm font-normal cursor-pointer"
        >
          Save as Template
        </Label>
      </div>

      {/* File Attachments */}
      <div className="space-y-2">
        <Label htmlFor="attachments">File Attachments (Optional)</Label>
        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4">
          <Input
            id="attachments"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="attachments"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
            <span className="text-sm text-zinc-400">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-zinc-500 mt-1">
              PDF or images only, max 50MB per file
            </span>
          </label>
        </div>
        {attachmentFiles.length > 0 && (
          <div className="space-y-2 mt-2">
            {attachmentFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-zinc-800 px-3 py-2 rounded-md"
              >
                <div className="flex items-center gap-2">
                  {file.type === 'application/pdf' ? (
                    <FileText className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <FileImage className="h-4 w-4 text-zinc-400" />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-zinc-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || uploadingFiles}
          className="min-w-[120px]"
        >
          {isSubmitting || uploadingFiles ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingFiles ? 'Uploading...' : 'Creating...'}
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelectorDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onSelectTemplate={handleTemplateSelect}
      />
    </form>
  )
}

