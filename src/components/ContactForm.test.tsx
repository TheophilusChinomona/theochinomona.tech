import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm'

// Mock fetch
global.fetch = vi.fn()

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    renderWithRouter(<ContactForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send|submit/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ContactForm />)
    
    const submitButton = screen.getByRole('button', { name: /send|submit/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email|email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message must be at least/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ContactForm />)
    
    // Fill all fields with valid data except email
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message')
    
    // Blur email field to trigger validation
    await user.tab()
    
    const submitButton = screen.getByRole('button', { name: /send|submit/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      // Check for email validation error (could be "Invalid email address" or similar)
      const emailError = screen.queryByText(/invalid email|email.*invalid/i)
      expect(emailError).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows success message on successful submission', async () => {
    const user = userEvent.setup()
    
    // Mock successful fetch response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Message sent successfully' }),
    })
    
    renderWithRouter(<ContactForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send|submit/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/success|sent successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error message on failed submission', async () => {
    const user = userEvent.setup()
    
    // Mock failed fetch response
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })
    
    renderWithRouter(<ContactForm />)
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /send|submit/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/server error|failed to send/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })
})

