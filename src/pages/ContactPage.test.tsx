import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ContactPage from './ContactPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('ContactPage', () => {
  it('renders contact info section', () => {
    renderWithRouter(<ContactPage />)
    
    // Check for contact info like email, location, availability
    // Use getAllByText for Email since it appears in both contact info and form label
    const emailElements = screen.getAllByText(/^email$/i)
    expect(emailElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/^location$/i)).toBeInTheDocument()
    expect(screen.getByText(/^availability$/i)).toBeInTheDocument()
  })

  it('renders social links', () => {
    renderWithRouter(<ContactPage />)
    
    // Check for social links
    const githubLink = screen.getByRole('link', { name: /github/i })
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    const twitterLink = screen.getByRole('link', { name: /twitter/i })
    
    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
    expect(twitterLink).toBeInTheDocument()
  })

  it('renders contact form', () => {
    renderWithRouter(<ContactPage />)
    
    // Check for contact form fields (form is now implemented, not a placeholder)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })
})

