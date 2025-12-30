/**
 * Set Password Page
 * Allows invited users to set their password after clicking the invite link
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isInvited = searchParams.get('invited') === 'true'
  const isRecovery = searchParams.get('type') === 'recovery'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Check for recovery/invite tokens in URL hash
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken) {
        // Set the session from the tokens
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          setError('Invalid or expired link. Please request a new invitation.')
        }
      }
    }

    handleAuthCallback()
  }, [])

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        if (user?.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Password Set Successfully!</h2>
            <p className="text-zinc-400">
              Redirecting you to the dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading if not authenticated yet (waiting for token processing)
  if (!isAuthenticated && (isInvited || isRecovery || window.location.hash)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Verifying your invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
            <Lock className="h-7 w-7 text-indigo-400" />
          </div>
          <CardTitle className="text-2xl text-zinc-100">
            {isRecovery ? 'Reset Your Password' : 'Set Your Password'}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {isRecovery
              ? 'Enter a new password for your account'
              : 'Welcome! Please create a password to secure your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="text-xs text-zinc-500 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside pl-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </form>

          {user && (
            <p className="text-center text-sm text-zinc-500 mt-4">
              Logged in as <span className="text-zinc-400">{user.email}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

