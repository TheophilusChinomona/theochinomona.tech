import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock react-parallax-mouse
vi.mock('react-parallax-mouse', () => ({
  MouseParallaxContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-wrapper">{children}</div>
  ),
  MouseParallaxChild: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-layer">{children}</div>
  ),
}))

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('HomePage', () => {
  it('renders full hero with parallax', () => {
    renderWithRouter(<HomePage />)
    
    expect(screen.getByTestId('hero-full')).toBeInTheDocument()
    expect(screen.getByTestId('parallax-wrapper')).toBeInTheDocument()
  })

  it('renders introduction section', () => {
    renderWithRouter(<HomePage />)
    
    // Check for introduction/bio section
    const intro = screen.queryByText(/introduction|about|bio/i)
    expect(intro || screen.getByText(/developer|creative/i)).toBeTruthy()
  })

  it('renders skills/tech stack section', () => {
    renderWithRouter(<HomePage />)
    
    // Check for skills section heading
    expect(screen.getByRole('heading', { name: /skills & technologies/i })).toBeInTheDocument()
  })

  it('renders featured projects preview', () => {
    renderWithRouter(<HomePage />)
    
    // Check for featured projects heading
    expect(screen.getByRole('heading', { name: /featured projects/i })).toBeInTheDocument()
  })
})

