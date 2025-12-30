/**
 * Verify Email Page
 * Handles email verification callback from Supabase
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { verifyEmail } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmailToken = async () => {
      // Extract token_hash from URL (Supabase email verification uses token_hash)
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      // Check if we have the required parameters
      if (!tokenHash || type !== 'email') {
        setStatus('error')
        setMessage(
          'Verification link is missing required parameters. Please check your email for a valid verification link.'
        )
        return
      }

      try {
        const result = await verifyEmail(tokenHash)

        if (result.error) {
          setStatus('error')
          if (result.error.message?.includes('expired') || result.error.message?.includes('invalid')) {
            setMessage(
              'This verification link is invalid or has expired. Please request a new verification email.'
            )
          } else {
            setMessage(
              result.error.message || 'Failed to verify email. Please try again or request a new verification link.'
            )
          }
        } else if (result.user && result.session) {
          // Email verified successfully
          // Note: Auth state is automatically updated by onAuthStateChange listener
          setStatus('success')
          setMessage('Your email has been verified successfully! You can now log in to your account.')

          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Email verification completed, but no session was created. Please try logging in.')
        }
      } catch (error) {
        console.error('Email verification error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred during email verification. Please try again.')
      }
    }

    verifyEmailToken()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Verification successful!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-zinc-400 mb-4" />
              <p className="text-zinc-300 text-center">{message || 'Please wait...'}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-zinc-300 text-center mb-4">{message}</p>
              <p className="text-sm text-zinc-400 text-center">Redirecting to login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-zinc-300 text-center mb-4">{message}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/', { replace: true })}
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

