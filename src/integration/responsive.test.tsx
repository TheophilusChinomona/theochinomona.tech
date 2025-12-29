import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from '@/routes'
import Navbar from '@/components/Navbar'

// Mock react-parallax-mouse
vi.mock('react-parallax-mouse', () => ({
  MouseParallaxContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-wrapper">{children}</div>
  ),
  MouseParallaxChild: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-layer">{children}</div>
  ),
}))

describe('Responsive Behavior', () => {
  it('shows mobile menu button on small screens', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    })
    
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    
    // Mobile menu button should be visible
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).not.toHaveClass('hidden')
    
    // Desktop nav links should be hidden on mobile
    const desktopNav = screen.queryByRole('link', { name: /home/i })
    // On mobile, links are in the mobile menu, not in desktop nav
    // The desktop nav container should have 'hidden md:flex'
    const navContainer = screen.getByRole('navigation').querySelector('.hidden.md\\:flex')
    expect(navContainer).toBeInTheDocument()
  })

  it('mobile menu is accessible via keyboard', async () => {
    const user = await import('@testing-library/user-event')
    const userEvent = user.default.setup()
    
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    
    // Focus and activate menu button with keyboard
    menuButton.focus()
    await userEvent.keyboard('{Enter}')
    
    // Menu should open
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
  })
})

