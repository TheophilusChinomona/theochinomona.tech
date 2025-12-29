import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Hero from './Hero'

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

describe('Hero Component', () => {
  it('full variant renders at 100vh with parallax', () => {
    renderWithRouter(
      <Hero
        variant="full"
        title="Welcome"
        subtitle="Building amazing things"
        ctaText="Get Started"
        ctaLink="/contact"
      />
    )
    
    const hero = screen.getByTestId('hero-full')
    expect(hero).toBeInTheDocument()
    expect(hero).toHaveClass('h-screen')
    expect(screen.getByTestId('parallax-wrapper')).toBeInTheDocument()
  })

  it('split variant renders two-column layout', () => {
    renderWithRouter(
      <Hero
        variant="split"
        title="About Me"
        subtitle="Developer & Designer"
        image={<div>Image</div>}
      />
    )
    
    const hero = screen.getByTestId('hero-split')
    expect(hero).toBeInTheDocument()
    expect(hero).toHaveClass('md:grid-cols-2')
    expect(screen.getByText('Image')).toBeInTheDocument()
  })

  it('minimal variant renders centered text', () => {
    renderWithRouter(
      <Hero
        variant="minimal"
        title="Portfolio"
        subtitle="My work"
      />
    )
    
    const hero = screen.getByTestId('hero-minimal')
    expect(hero).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('My work')).toBeInTheDocument()
  })

  it('renders title and subtitle for all variants', () => {
    const { rerender } = renderWithRouter(
      <Hero variant="full" title="Test Title" subtitle="Test Subtitle" />
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    
    rerender(
      <BrowserRouter>
        <Hero variant="split" title="Split Title" subtitle="Split Subtitle" />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Split Title')).toBeInTheDocument()
    expect(screen.getByText('Split Subtitle')).toBeInTheDocument()
  })

  it('full variant renders CTA button when provided', () => {
    renderWithRouter(
      <Hero
        variant="full"
        title="Welcome"
        subtitle="Get started"
        ctaText="Contact Me"
        ctaLink="/contact"
      />
    )
    
    const ctaButton = screen.getByRole('link', { name: /contact me/i })
    expect(ctaButton).toBeInTheDocument()
    expect(ctaButton).toHaveAttribute('href', '/contact')
  })

  it('split variant stacks vertically on mobile', () => {
    renderWithRouter(
      <Hero
        variant="split"
        title="Title"
        subtitle="Subtitle"
        image={<div>Image</div>}
      />
    )
    
    const hero = screen.getByTestId('hero-split')
    expect(hero).toHaveClass('md:grid-cols-2')
    expect(hero).toHaveClass('grid-cols-1')
  })
})

