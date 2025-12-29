import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'

// Wrapper for Router context
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Navbar', () => {
  it('renders with all navigation links', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByText('theo.dev')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /portfolio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })

  it('navigation links have correct href attributes', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /portfolio/i })).toHaveAttribute('href', '/portfolio')
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })

  it('mobile menu button toggles menu open', () => {
    renderWithRouter(<Navbar />)
    
    // Find the mobile menu button (hamburger)
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
    
    // Initially mobile menu should be closed
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
    
    // Click to open
    fireEvent.click(menuButton)
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })

  it('mobile menu closes after clicking a link', async () => {
    renderWithRouter(<Navbar />)
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    
    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    
    // Click a link in mobile menu
    const aboutLink = screen.getByTestId('mobile-menu').querySelector('a[href="/about"]')
    if (aboutLink) {
      fireEvent.click(aboutLink)
    }
    
    // Wait for menu to close (animation)
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('has fixed positioning at top', () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('fixed')
    expect(nav).toHaveClass('top-0')
  })

  it('transitions to solid background on scroll', async () => {
    renderWithRouter(<Navbar />)
    
    const nav = screen.getByRole('navigation')
    
    // Initially should be transparent
    expect(nav).toHaveClass('bg-transparent')
    expect(nav).toHaveClass('backdrop-blur-sm')
    
    // Simulate scroll by setting scrollY and triggering scroll event
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    })
    
    // Trigger scroll event wrapped in act
    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })
    
    // Wait for React to update state
    await waitFor(() => {
      // After scroll > 50px, should have solid background
      // The hook updates state, which changes the className
      const updatedNav = screen.getByRole('navigation')
      // Check that it no longer has transparent background (or has solid background)
      // Note: The exact class may vary, but we verify the component responds to scroll
      expect(updatedNav).toBeInTheDocument()
      // Verify it has the scrolled state class
      expect(updatedNav.className).toContain('bg-zinc-950')
    }, { timeout: 1000 })
  })
})

