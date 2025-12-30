/**
 * Notification Opt-In Component
 * Allows clients to subscribe to email notifications for project updates
 */

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, BellOff, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { upsertNotificationPreference } from '@/lib/db/tracking'

const notificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  optedIn: z.boolean(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface NotificationOptInProps {
  trackingCodeId: string
}

export default function NotificationOptIn({ trackingCodeId }: NotificationOptInProps) {
  const [success, setSuccess] = useState(false)
  const [savedEmail, setSavedEmail] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email: '',
      optedIn: true,
    },
  })

  const optedIn = watch('optedIn')

  const mutation = useMutation({
    mutationFn: (data: NotificationFormData) =>
      upsertNotificationPreference(trackingCodeId, data.email, data.optedIn),
    onSuccess: (_, variables) => {
      setSuccess(true)
      setSavedEmail(variables.email)
    },
  })

  const onSubmit = (data: NotificationFormData) => {
    mutation.mutate(data)
  }

  // Success state
  if (success) {
    return (
      <Card className="bg-zinc-900/80 border-zinc-800">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              {optedIn ? 'Notifications Enabled!' : 'Preferences Saved'}
            </h3>
            <p className="text-sm text-zinc-400">
              {optedIn
                ? `We'll send updates to ${savedEmail} when phases are completed.`
                : `You've opted out of notifications for ${savedEmail}.`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-zinc-500"
              onClick={() => {
                setSuccess(false)
                setSavedEmail('')
              }}
            >
              Update preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Get Project Updates</CardTitle>
            <CardDescription>
              Receive email notifications when phases are completed
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="space-y-2">
            <Label htmlFor="notification-email" className="text-zinc-300">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                id="notification-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Opt-in checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="notification-optin"
              checked={optedIn}
              onCheckedChange={(checked) => setValue('optedIn', checked === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label
                htmlFor="notification-optin"
                className="text-sm font-medium text-zinc-200 cursor-pointer"
              >
                {optedIn ? (
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-400" />
                    Send me email notifications
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <BellOff className="h-4 w-4 text-zinc-500" />
                    Don't send me notifications
                  </span>
                )}
              </Label>
              <p className="text-xs text-zinc-500">
                {optedIn
                  ? 'You will receive an email when each phase is completed.'
                  : 'Your preference will be saved but you won\'t receive emails.'}
              </p>
            </div>
          </div>

          {/* Error message */}
          {mutation.error && (
            <p className="text-sm text-red-400">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Failed to save preferences. Please try again.'}
            </p>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

