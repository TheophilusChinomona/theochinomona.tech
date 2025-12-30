/**
 * Project Form Component
 * Reusable form component for creating and editing projects
 */

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadProjectThumbnail, checkStorageAvailability } from '@/lib/storage'
import { type Project, type CreateProjectInput, type UpdateProjectInput } from '@/lib/db/projects'
import { getClientUsers } from '@/lib/db/users'

const projectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be at most 2000 characters'),
  tech: z.array(z.string().min(2, 'Each tech item must be at least 2 characters')).min(1, 'At least one technology is required'),
  category: z.enum(['Web', 'Mobile', 'Full-Stack', 'Design']).refine((val) => val !== undefined, {
    message: 'Category is required',
  }),
  thumbnail: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
  thumbnailFile: z.instanceof(File).optional(),
  client_name: z.string().optional(),
  client_id: z.string().optional(),
  project_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
  github_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Must be a valid URL',
  }),
  completion_date: z.string().optional(),
  featured: z.boolean().default(false),
  notifications_enabled: z.boolean().default(true),
  status: z.enum(['draft', 'published']).default('draft'),
})

type ProjectFormData = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) {
  const [storageAvailable, setStorageAvailable] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    project?.thumbnail || null
  )
  const [techInput, setTechInput] = useState('')

  // Fetch client users for the dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['client-users'],
    queryFn: getClientUsers,
  })

  const form = useForm<ProjectFormData>({
    // @ts-expect-error - zodResolver type inference issue with defaults
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      tech: project?.tech || [],
      category: (project?.category as 'Web' | 'Mobile' | 'Full-Stack' | 'Design') || undefined,
      thumbnail: project?.thumbnail || '',
      client_name: project?.client_name || '',
      client_id: project?.client_id || '',
      project_url: project?.project_url || '',
      github_url: project?.github_url || '',
      completion_date: project?.completion_date || '',
      featured: project?.featured || false,
      notifications_enabled: project?.notifications_enabled ?? true,
      status: project?.status || 'draft',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error - Type inference issue with zodResolver and useFieldArray
    name: 'tech',
  })

  useEffect(() => {
    // Check if storage is available
    checkStorageAvailability().then(setStorageAvailable)
  }, [])

  const handleAddTech = () => {
    const trimmed = techInput.trim()
    if (trimmed && !form.getValues('tech').includes(trimmed)) {
      append(trimmed)
      setTechInput('')
    }
  }

  const handleImageFileChange = async (file: File | null) => {
    if (!file) {
      form.setValue('thumbnailFile', undefined)
      setThumbnailPreview(null)
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      form.setError('thumbnailFile', {
        type: 'manual',
        message: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      form.setError('thumbnailFile', {
        type: 'manual',
        message: 'File size must be less than 5MB',
      })
      return
    }

    form.setValue('thumbnailFile', file)
    form.clearErrors('thumbnailFile')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      let thumbnailUrl = data.thumbnail || null

      // If a file was uploaded, upload it first
      if (data.thumbnailFile && storageAvailable) {
        setUploadingImage(true)
        try {
          // Generate a temporary ID for new projects (will be replaced with actual ID after creation)
          const tempId = project?.id || `temp-${Date.now()}`
          thumbnailUrl = await uploadProjectThumbnail(data.thumbnailFile, tempId)
        } catch (error) {
          form.setError('thumbnailFile', {
            type: 'manual',
            message: error instanceof Error ? error.message : 'Failed to upload image',
          })
          setUploadingImage(false)
          return
        } finally {
          setUploadingImage(false)
        }
      }

      // Prepare submission data
      const submitData: CreateProjectInput | UpdateProjectInput = {
        title: data.title,
        description: data.description,
        tech: data.tech,
        category: data.category,
        thumbnail: thumbnailUrl,
        client_name: data.client_name || null,
        client_id: data.client_id || null,
        project_url: data.project_url || null,
        github_url: data.github_url || null,
        completion_date: data.completion_date || null,
        featured: data.featured,
        notifications_enabled: data.notifications_enabled,
        status: data.status,
      }

      await onSubmit(submitData)
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error)
    }
  }

  const { register, handleSubmit: handleFormSubmit, formState: { errors, isSubmitting: formIsSubmitting }, watch, setValue } = form

  return (
    <form onSubmit={handleFormSubmit(handleSubmit as any)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-zinc-300">
          Title *
        </Label>
        <Input
          id="title"
          {...register('title')}
          className="bg-zinc-950 border-zinc-800 text-zinc-100"
          placeholder="Project title"
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-300">
          Description *
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          className="bg-zinc-950 border-zinc-800 text-zinc-100 min-h-[100px]"
          placeholder="Project description"
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label className="text-zinc-300">Technologies *</Label>
        <div className="space-y-2">
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
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              placeholder="Add technology (press Enter)"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTech}
              disabled={!techInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {fields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fields.map((field, index) => (
                <Badge key={field.id} variant="secondary" className="text-xs">
                  {watch(`tech.${index}`)}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        {errors.tech && (
          <p className="text-sm text-red-400">{errors.tech.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-zinc-300">
          Category *
        </Label>
        <Select
          onValueChange={(value) => setValue('category', value as 'Web' | 'Mobile' | 'Full-Stack' | 'Design')}
          defaultValue={watch('category')}
        >
          <SelectTrigger id="category" className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Web">Web</SelectItem>
            <SelectItem value="Mobile">Mobile</SelectItem>
            <SelectItem value="Full-Stack">Full-Stack</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-400">{errors.category.message}</p>
        )}
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail" className="text-zinc-300">
          Thumbnail
        </Label>
        <p className="text-sm text-zinc-400">
          {storageAvailable
            ? 'Upload an image file or provide a URL'
            : 'Provide an image URL'}
        </p>
        <div className="space-y-2">
          {storageAvailable && (
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  handleImageFileChange(file)
                }}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>
          )}
          <Input
            id="thumbnail"
            {...register('thumbnail', {
              onChange: (e) => {
                const url = e.target.value
                if (url) {
                  setThumbnailPreview(url)
                } else if (!form.getValues('thumbnailFile')) {
                  setThumbnailPreview(null)
                }
              },
            })}
            type="url"
            className="bg-zinc-950 border-zinc-800 text-zinc-100"
            placeholder="Image URL"
          />
          {thumbnailPreview && (
            <div className="mt-2">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-32 w-full object-cover rounded-md border border-zinc-800"
              />
            </div>
          )}
        </div>
        {errors.thumbnail && (
          <p className="text-sm text-red-400">{errors.thumbnail.message}</p>
        )}
        {errors.thumbnailFile && (
          <p className="text-sm text-red-400">{errors.thumbnailFile.message}</p>
        )}
      </div>

      {/* Assign to Client User */}
      <div className="space-y-2">
        <Label htmlFor="client_id" className="text-zinc-300">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assign to Client
          </div>
        </Label>
        <Select
          onValueChange={(value) => {
            setValue('client_id', value === 'none' ? '' : value)
            // Auto-fill client name when selecting a user
            if (value && value !== 'none') {
              const selectedClient = clients.find(c => c.id === value)
              if (selectedClient) {
                setValue('client_name', `${selectedClient.name} ${selectedClient.surname}`)
              }
            }
          }}
          defaultValue={watch('client_id') || 'none'}
        >
          <SelectTrigger id="client_id" className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Select a client (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No client assigned</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} {client.surname} ({client.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-zinc-400">
          Assign a registered client to receive project updates
        </p>
      </div>

      {/* Client Name (display name, can override) */}
      <div className="space-y-2">
        <Label htmlFor="client_name" className="text-zinc-300">
          Client Display Name
        </Label>
        <Input
          id="client_name"
          {...register('client_name')}
          className="bg-zinc-950 border-zinc-800 text-zinc-100"
          placeholder="Client name for display (optional)"
        />
        <p className="text-sm text-zinc-400">
          This name is shown on the project. Auto-filled when assigning a client.
        </p>
        {errors.client_name && (
          <p className="text-sm text-red-400">{errors.client_name.message}</p>
        )}
      </div>

      {/* Project URL */}
      <div className="space-y-2">
        <Label htmlFor="project_url" className="text-zinc-300">
          Project URL
        </Label>
        <Input
          id="project_url"
          {...register('project_url')}
          type="url"
          className="bg-zinc-950 border-zinc-800 text-zinc-100"
          placeholder="https://example.com"
        />
        {errors.project_url && (
          <p className="text-sm text-red-400">{errors.project_url.message}</p>
        )}
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="github_url" className="text-zinc-300">
          GitHub URL
        </Label>
        <Input
          id="github_url"
          {...register('github_url')}
          type="url"
          className="bg-zinc-950 border-zinc-800 text-zinc-100"
          placeholder="https://github.com/user/repo"
        />
        {errors.github_url && (
          <p className="text-sm text-red-400">{errors.github_url.message}</p>
        )}
      </div>

      {/* Completion Date */}
      <div className="space-y-2">
        <Label htmlFor="completion_date" className="text-zinc-300">
          Completion Date
        </Label>
        <Input
          id="completion_date"
          {...register('completion_date')}
          type="date"
          className="bg-zinc-950 border-zinc-800 text-zinc-100"
        />
        {errors.completion_date && (
          <p className="text-sm text-red-400">{errors.completion_date.message}</p>
        )}
      </div>

      {/* Featured */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="featured"
          checked={watch('featured')}
          onCheckedChange={(checked) => setValue('featured', checked as boolean)}
          className="bg-zinc-950 border-zinc-800 mt-1"
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="featured" className="text-zinc-300 cursor-pointer">
            Featured
          </Label>
          <p className="text-sm text-zinc-400">Highlight this project on the portfolio page</p>
        </div>
      </div>

      {/* Notifications Enabled */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="notifications_enabled"
          checked={watch('notifications_enabled')}
          onCheckedChange={(checked) => setValue('notifications_enabled', checked as boolean)}
          className="bg-zinc-950 border-zinc-800 mt-1"
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="notifications_enabled" className="text-zinc-300 cursor-pointer">
            Email Notifications
          </Label>
          <p className="text-sm text-zinc-400">Send email notifications to clients when phases are completed</p>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status" className="text-zinc-300">
          Status
        </Label>
        <Select
          onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
          defaultValue={watch('status')}
        >
          <SelectTrigger id="status" className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-400">{errors.status.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || uploadingImage || formIsSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || uploadingImage || formIsSubmitting}>
          {(isSubmitting || uploadingImage || formIsSubmitting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubmitting ? 'Saving...' : uploadingImage ? 'Uploading...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}

