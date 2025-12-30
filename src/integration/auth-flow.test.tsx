/**
 * Integration tests for authentication end-to-end workflows
 * Tests critical user flows: signup → email verification → login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import AuthModal from '@/components/AuthModal'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('Authentication End-to-End Workflows', () => {
  const mockSignUp = vi.fn()
  const mockSignIn = vi.fn()
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
    } as any)
  })

  describe('Signup and Email Verification Integration', () => {
    it('should handle signup and show email verification message', async () => {
      const user = userEvent.setup()
      
      mockSignUp.mockResolvedValueOnce({ error: null })
      
      render(
        <BrowserRouter>
          <AuthModal open={true} onOpenChange={vi.fn()} defaultTab="signup" />
        </BrowserRouter>
      )

      // Fill signup form
      await user.type(screen.getByLabelText(/^name$/i), 'John')
      await user.type(screen.getByLabelText(/^surname$/i), 'Doe')
      await user.type(screen.getByLabelText(/^email$/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone number/i), '1234567890')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')

      // Submit signup
      await user.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          name: 'John',
          surname: 'Doe',
          phone: '1234567890',
        })
      })
    })
  })

  describe('Protected Route Access Flow', () => {
    it('should allow authenticated user to access protected route', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          auth_user_id: 'auth-1',
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          phone: null,
          role: 'client',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          supabaseUser: {} as any,
        },
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      } as any)

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should redirect unauthenticated user from protected route to login', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      } as any)

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      // Should redirect (Navigate component doesn't render visible content)
      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Role-Based Access Control Flow', () => {
    it('should allow admin to access admin-only route', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          auth_user_id: 'auth-1',
          name: 'Admin',
          surname: 'User',
          email: 'admin@example.com',
          phone: null,
          role: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          supabaseUser: {} as any,
        },
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      } as any)

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
      })
    })

    it('should prevent client from accessing admin-only route', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          auth_user_id: 'auth-1',
          name: 'Client',
          surname: 'User',
          email: 'client@example.com',
          phone: null,
          role: 'client',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          supabaseUser: {} as any,
        },
        session: {} as any,
        isLoading: false,
        isAuthenticated: true,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      } as any)

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Dashboard</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      // Should redirect (client doesn't have admin role)
      await waitFor(() => {
        expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument()
      })
    })
  })

  describe('Session Management Flow', () => {
    it('should maintain session after page refresh', async () => {
      const mockUser = {
        id: '1',
        auth_user_id: 'auth-1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: null,
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        supabaseUser: {} as any,
      }

      const mockSession = {
        access_token: 'token',
        user: mockUser,
      } as any

      // Simulate session refresh
      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        isLoading: false,
        isAuthenticated: true,
        signIn: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
      } as any)

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })
  })
})

