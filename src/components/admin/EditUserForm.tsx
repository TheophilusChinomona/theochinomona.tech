/**
 * Edit User Form Component
 * Form for editing user information (name, surname, email, phone)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateUser, type User } from '@/lib/db/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

type EditUserFormData = z.infer<typeof editUserSchema>

interface EditUserFormProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditUserForm({
  user,
  open,
  onOpenChange,
}: EditUserFormProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone || '',
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<EditUserFormData> }) =>
      updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('User updated successfully')
      onOpenChange(false)
      reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  const onSubmit = async (data: EditUserFormData) => {
    updateUserMutation.mutate({
      userId: user.id,
      updates: {
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone || undefined,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Edit User</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update user information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              Name
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname" className="text-zinc-300">
              Surname
            </Label>
            <Input
              id="surname"
              {...register('surname')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.surname && (
              <p className="text-sm text-red-400">{errors.surname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-300">
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
            />
            {errors.phone && (
              <p className="text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateUserMutation.isPending}
            >
              {(isSubmitting || updateUserMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

