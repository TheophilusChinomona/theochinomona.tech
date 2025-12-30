/**
 * Tests for VerifyEmailPage component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VerifyEmailPage from './VerifyEmailPage'
import { verifyEmail } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'

// Mock verifyEmail function
vi.mock('@/lib/auth', () => ({
  verifyEmail: vi.fn(),
}))

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock useNavigate and useSearchParams
const mockNavigate = vi.fn()
const mockUseSearchParams = vi.fn(() => [
  new URLSearchParams('?token_hash=test-token&type=email'),
])

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => mockUseSearchParams(),
  }
})

describe('VerifyEmailPage', () => {
  const mockVerifyEmail = vi.mocked(verifyEmail)
  const mockUseAuth = vi.mocked(useAuth)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)
  })

  it('should process email verification token correctly', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01',
    } as any

    const mockSession = {
      access_token: 'token',
      user: mockUser,
    } as any

    mockVerifyEmail.mockResolvedValue({
      user: mockUser,
      session: mockSession,
      error: null,
    })

    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?token_hash=test-token&type=email'),
    ])

    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith('test-token')
    })

    await waitFor(() => {
      expect(screen.getByText(/email has been verified successfully/i)).toBeInTheDocument()
    })
  })

  it('should show error message for invalid verification token', async () => {
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?token_hash=invalid-token&type=email'),
    ])

    mockVerifyEmail.mockResolvedValue({
      user: null,
      session: null,
      error: {
        message: 'Invalid token',
        name: 'AuthError',
        status: 400,
      } as any,
    })

    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalled()
    })

    await waitFor(() => {
      // The component shows the error message directly, or a generic message
      expect(
        screen.getByText(/invalid token|invalid or has expired|verification link/i)
      ).toBeInTheDocument()
    })
  })

  it('should redirect to login after successful verification', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01',
    } as any

    const mockSession = {
      access_token: 'token',
      user: mockUser,
    } as any

    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('?token_hash=test-token&type=email'),
    ])

    mockVerifyEmail.mockResolvedValue({
      user: mockUser,
      session: mockSession,
      error: null,
    })

    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalled()
    })

    // Should redirect to login after showing success message (2 second delay)
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
      },
      { timeout: 3000 }
    )
  })

  it('should handle missing token parameter', async () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams('')])

    render(
      <MemoryRouter>
        <VerifyEmailPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/verification link is missing required parameters/i)).toBeInTheDocument()
    })
  })
})

