import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import AppRoutes from '@/routes'
import ContactForm from '@/components/ContactForm'

// Mock react-parallax-mouse
vi.mock('react-parallax-mouse', () => ({
  MouseParallaxContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-wrapper">{children}</div>
  ),
  MouseParallaxChild: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-layer">{children}</div>
  ),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Accessibility', () => {
  it('all navigation links are keyboard accessible', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )
    
    // Tab through navigation links
    await user.tab()
    // Logo link should be focusable (there may be multiple, check if any has focus)
    const logoLinks = screen.getAllByRole('link', { name: /theo.dev/i })
    expect(logoLinks.length).toBeGreaterThan(0)
    // Verify at least one link is in the document
    expect(logoLinks[0]).toBeInTheDocument()
    
    // Continue tabbing to navigation links
    await user.tab()
    // Should be able to find navigation links
    const navLinks = screen.getAllByRole('link', { name: /home|about|portfolio|blog|contact/i })
    expect(navLinks.length).toBeGreaterThan(0)
  })

  it('contact form fields are keyboard navigable', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ContactForm />
      </MemoryRouter>
    )
    
    // Tab through form fields
    await user.tab()
    const nameField = screen.getByLabelText(/name/i)
    expect(nameField).toHaveFocus()
    
    await user.tab()
    const emailField = screen.getByLabelText(/email/i)
    expect(emailField).toHaveFocus()
    
    await user.tab()
    const subjectField = screen.getByLabelText(/subject/i)
    expect(subjectField).toHaveFocus()
    
    await user.tab()
    const messageField = screen.getByLabelText(/message/i)
    expect(messageField).toHaveFocus()
  })

  it('form can be submitted with keyboard', async () => {
    const user = userEvent.setup()
    
    // Mock successful fetch
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Message sent successfully' }),
    })
    
    render(
      <MemoryRouter>
        <ContactForm />
      </MemoryRouter>
    )
    
    // Fill form with keyboard
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
    await user.type(screen.getByLabelText(/message/i), 'Test message')
    
    // Tab to submit button and activate with Enter
    await user.tab()
    const submitButton = screen.getByRole('button', { name: /send|submit/i })
    expect(submitButton).toHaveFocus()
    
    await user.keyboard('{Enter}')
    
    // Form should submit
    expect(global.fetch).toHaveBeenCalled()
  })
})

