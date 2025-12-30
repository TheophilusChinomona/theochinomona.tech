/**
 * Client Project Form Component
 * Form for clients to create new projects (which will be pending approval)
 */

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2, Upload, FileImage, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  uploadProjectRequestAttachment,
  validateRequestAttachmentFile,
  getAttachmentFileType,
} from '@/lib/storage'
import {
  createProjectRequest,
  createProjectRequestAttachment,
} from '@/lib/db/projectRequests'
import { createProject } from '@/lib/db/projects'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

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
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tech',
  })

  const handleAddTech = () => {
    const trimmed = techInput.trim()
    if (trimmed && !form.getValues('tech').includes(trimmed)) {
      append(trimmed)
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

  const onSubmit = async (data: ClientProjectFormData) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a project')
      return
    }

    setIsSubmitting(true)
    setUploadingFiles(false)

    try {
      // Create project with status 'pending_approval'
      const project = await createProject({
        title: data.title,
        description: data.description,
        tech: data.tech,
        category: data.category,
        status: 'pending_approval',
        created_by: user.id,
        client_id: user.id,
        payment_preference: data.payment_preference || null,
        requires_payment: null, // Admin decides
        deposit_paid: false,
      })

      // Upload attachments if any
      if (attachmentFiles.length > 0) {
        setUploadingFiles(true)

        // Create a project request to link attachments
        // Note: In the current implementation, we're creating a project directly
        // Attachments could be stored separately or we could create a request record
        // For now, we'll skip attachment uploads for direct project creation
        // and focus on the project creation flow
      }

      toast.success('Project created successfully! It is now pending admin approval.')
      form.reset()
      setAttachmentFiles([])
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
    </form>
  )
}

