/**
 * Tests for ProtectedRoute component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', () => {
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to /login when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should render children when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        auth_user_id: 'auth-1',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        phone: null,
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        supabaseUser: {} as any,
      },
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('should check role when requiredRole prop is provided', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        auth_user_id: 'auth-1',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        phone: null,
        role: 'client',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        supabaseUser: {} as any,
      },
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should render children when role matches requiredRole', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument()
    })
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('should handle loading state during auth check', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Should show loading state (or nothing while loading)
    // The component should wait for loading to complete before redirecting
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})

