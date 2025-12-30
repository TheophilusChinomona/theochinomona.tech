/**
 * Login Page
 * Displays the auth modal for login/signup
 */

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthModal from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if there's a redirect location from ProtectedRoute
      const from = (location.state as { from?: string })?.from
      
      if (from) {
        navigate(from, { replace: true })
      } else if (user.role === 'admin') {
        // Redirect admins to admin dashboard
        navigate('/admin', { replace: true })
      } else {
        // Redirect regular users to home
        navigate('/', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, location])

  const handleClose = () => {
    setIsOpen(false)
    // Navigate back to home after closing
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <AuthModal open={isOpen} onOpenChange={handleClose} defaultTab="login" />
    </div>
  )
}

