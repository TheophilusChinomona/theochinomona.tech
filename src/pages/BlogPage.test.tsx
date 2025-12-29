import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BlogPage from './BlogPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('BlogPage', () => {
  it('renders placeholder content', () => {
    renderWithRouter(<BlogPage />)
    
    expect(screen.getByText(/blog feature is under development/i)).toBeInTheDocument()
  })

  it('renders minimal hero with Coming Soon title', () => {
    renderWithRouter(<BlogPage />)
    
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })
})

