/**
 * Auth Modal Component
 * Unified login/signup modal with tabbed interface
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// Signup form schema
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Login form schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignupFormData = z.infer<typeof signupSchema>
type LoginFormData = z.infer<typeof loginSchema>

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'signup'
}

export default function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const { signIn, signUp } = useAuth()

  // Signup form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
    reset: resetSignup,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const handleSignup = async (data: SignupFormData) => {
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        surname: data.surname,
        phone: data.phone,
      })

      if (result.error) {
        setSubmitStatus('error')
        // Provide more helpful error messages
        let errorMessage = result.error.message || 'Failed to create account. Please try again.'
        
        // Handle specific error cases - check the actual error message first
        const errorStatus = 'status' in result.error ? (result.error as any).status : null
        const errorMsg = result.error.message?.toLowerCase() || ''
        
        if (errorMsg.includes('signup') && errorMsg.includes('disabled')) {
          errorMessage = 'Signup is not enabled. Please check your Supabase project settings or contact support.'
        } else if (errorMsg.includes('invalid api key') || errorMsg.includes('api key')) {
          errorMessage = 'Invalid API key. Please check your environment variables and restart the dev server.'
        } else if (errorStatus === 401 && errorMsg.includes('signup')) {
          errorMessage = 'Signup is not enabled. Please check your Supabase project settings or contact support.'
        } else if (errorStatus === 401) {
          // Generic 401 - show the actual error message from Supabase
          errorMessage = result.error.message || 'Authentication failed. Please check your Supabase configuration.'
        } else if (result.error.message?.includes('already registered') || errorMsg.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.'
        } else if (result.error.message?.includes('email') || errorMsg.includes('email')) {
          errorMessage = 'Invalid email address. Please check and try again.'
        } else if (result.error.message?.includes('password') || errorMsg.includes('password')) {
          errorMessage = 'Password does not meet requirements. Please use a stronger password.'
        }
        
        setSubmitMessage(errorMessage)
        console.error('Signup error details:', {
          status: 'status' in result.error ? (result.error as any).status : 'unknown',
          message: result.error.message,
          error: result.error,
        })
      } else {
        // Signup successful - email verification is typically required
        setSubmitStatus('success')
        setSubmitMessage(
          'Account created! Please check your email to verify your account before logging in.'
        )
        // Reset form but keep modal open to show message
        resetSignup()
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('An unexpected error occurred. Please try again.')
      console.error('Signup error:', error)
    }
  }

  const handleLogin = async (data: LoginFormData) => {
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        setSubmitStatus('error')
        // Provide user-friendly error messages
        if (result.error.message?.includes('Invalid login credentials')) {
          setSubmitMessage('Invalid email or password. Please try again.')
        } else if (result.error.message?.includes('Email not confirmed')) {
          setSubmitMessage(
            'Please verify your email address before logging in. Check your inbox for the verification link.'
          )
        } else {
          setSubmitMessage(
            result.error.message || 'Failed to sign in. Please try again.'
          )
        }
      } else {
        // Success
        setSubmitStatus('success')
        setSubmitMessage('Signed in successfully!')
        resetLogin()
        // Close modal after a brief delay
        setTimeout(() => {
          onOpenChange(false)
          setSubmitStatus('idle')
          setSubmitMessage('')
        }, 1500)
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('An unexpected error occurred. Please try again.')
      console.error('Login error:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset forms and status when closing
    setTimeout(() => {
      resetSignup()
      resetLogin()
      setSubmitStatus('idle')
      setSubmitMessage('')
      setActiveTab(defaultTab)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="login" className="text-zinc-400 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-zinc-400 data-[state=active]:text-white">
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-4">
            <form
              onSubmit={handleLoginSubmit(handleLogin)}
              className="space-y-4"
              noValidate
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  {...registerLogin('email')}
                  placeholder="your.email@example.com"
                  disabled={isLoginSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {loginErrors.email && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-zinc-300">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  {...registerLogin('password')}
                  placeholder="Enter your password"
                  disabled={isLoginSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {loginErrors.password && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full"
                size="lg"
              >
                {isLoginSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            <form
              onSubmit={handleSignupSubmit(handleSignup)}
              className="space-y-4"
              noValidate
            >
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-zinc-300">
                  Name
                </Label>
                <Input
                  id="signup-name"
                  {...registerSignup('name')}
                  placeholder="John"
                  disabled={isSignupSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {signupErrors.name && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupErrors.name.message}
                  </p>
                )}
              </div>

              {/* Surname Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-surname" className="text-zinc-300">
                  Surname
                </Label>
                <Input
                  id="signup-surname"
                  {...registerSignup('surname')}
                  placeholder="Doe"
                  disabled={isSignupSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {signupErrors.surname && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupErrors.surname.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-zinc-300">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  {...registerSignup('email')}
                  placeholder="your.email@example.com"
                  disabled={isSignupSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {signupErrors.email && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupErrors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-zinc-300">
                  Phone Number
                </Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  {...registerSignup('phone')}
                  placeholder="+1 555 123 4567"
                  disabled={isSignupSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {signupErrors.phone && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupErrors.phone.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-zinc-300">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...registerSignup('password')}
                  placeholder="At least 8 characters"
                  disabled={isSignupSubmitting}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                {signupErrors.password && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {signupErrors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSignupSubmitting}
                className="w-full"
                size="lg"
              >
                {isSignupSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitMessage}</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{submitMessage}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

