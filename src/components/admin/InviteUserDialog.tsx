/**
 * Invite User Dialog Component
 * Dialog for inviting new users and assigning them a role
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Loader2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  role: z.enum(['admin', 'client']).refine((val) => val !== undefined, {
    message: 'Role is required',
  }),
})

type InviteUserFormData = z.infer<typeof inviteUserSchema>

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: InviteUserFormData) => Promise<void>
  isSubmitting?: boolean
}

export default function InviteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: InviteUserDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: 'client',
    },
  })

  const onSubmit = async (data: InviteUserFormData) => {
    await onConfirm(data)
    reset()
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite User
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Send an invitation email to a new user. They will be able to set their password and
            access the system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">
              First Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              placeholder="John"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname" className="text-zinc-300">
              Last Name *
            </Label>
            <Input
              id="surname"
              {...register('surname')}
              className="bg-zinc-950 border-zinc-800 text-zinc-100"
              placeholder="Doe"
            />
            {errors.surname && (
              <p className="text-sm text-red-400">{errors.surname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-zinc-300">
              Role *
            </Label>
            <Select
              value={watch('role')}
              onValueChange={(value) => setValue('role', value as 'admin' | 'client')}
            >
              <SelectTrigger
                id="role"
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-400">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

