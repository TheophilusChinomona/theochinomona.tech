/**
 * Tests for AuthModal component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'
import { useAuth } from '@/hooks/useAuth'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('AuthModal', () => {
  const mockSignIn = vi.fn()
  const mockSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
    } as any)
  })

  it('should open modal when open prop is true', () => {
    render(<AuthModal open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('should switch tabs between Login and Sign Up', async () => {
    const user = userEvent.setup()
    render(<AuthModal open={true} onOpenChange={vi.fn()} />)

    // Initially on login tab
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()

    // Switch to signup tab
    const signupTab = screen.getByRole('tab', { name: /sign up/i })
    await user.click(signupTab)

    // Should show signup fields (use more specific queries)
    await waitFor(() => {
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^surname$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    })
  })

  it('should validate required fields in signup form', async () => {
    const user = userEvent.setup()
    render(<AuthModal open={true} onOpenChange={vi.fn()} defaultTab="signup" />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Should show validation errors (use getAllByText since there might be multiple)
    await waitFor(() => {
      const errors = screen.getAllByText(/name is required/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('should validate required fields in login form', async () => {
    const user = userEvent.setup()
    render(<AuthModal open={true} onOpenChange={vi.fn()} defaultTab="login" />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
  })

  it('should submit login form with valid credentials', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    render(<AuthModal open={true} onOpenChange={vi.fn()} defaultTab="login" />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should submit signup form with valid data', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    render(<AuthModal open={true} onOpenChange={vi.fn()} defaultTab="signup" />)

    // Use more specific queries with exact text matching
    await user.type(screen.getByLabelText(/^name$/i), 'John')
    await user.type(screen.getByLabelText(/^surname$/i), 'Doe')
    await user.type(screen.getByPlaceholderText(/your\.email@example\.com/i), 'test@example.com')
    await user.type(screen.getByLabelText(/phone number/i), '1234567890')
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
        phone: '1234567890',
      })
    })
  })

  it('should display error messages for invalid input', async () => {
    const user = userEvent.setup()
    render(<AuthModal open={true} onOpenChange={vi.fn()} defaultTab="login" />)

    const emailInput = screen.getByLabelText(/^email$/i)
    await user.type(emailInput, 'invalid-email')
    
    // Submit form to trigger validation
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('should close modal after successful login', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    mockSignIn.mockResolvedValue({ error: null })

    render(
      <AuthModal open={true} onOpenChange={onOpenChange} defaultTab="login" />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(
      () => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      },
      { timeout: 3000 }
    )
  })
})

