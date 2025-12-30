import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import AppRoutes from '@/routes'

// Mock react-parallax-mouse
vi.mock('react-parallax-mouse', () => ({
  MouseParallaxContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-wrapper">{children}</div>
  ),
  MouseParallaxChild: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="parallax-layer">{children}</div>
  ),
}))

describe('Navigation Flow Integration', () => {
  it('navigates between all pages via navbar links', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    )

    // Start on Home page
    expect(screen.getByTestId('hero-full')).toBeInTheDocument()

    // Navigate to About - use first navbar link (desktop nav)
    const aboutLinks = screen.getAllByRole('link', { name: /^about$/i })
    const navbarAboutLink = aboutLinks[0] // First one should be navbar
    if (navbarAboutLink) {
      await user.click(navbarAboutLink)
    }
    await waitFor(() => {
      expect(screen.getByTestId('developer-timeline')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Navigate to Portfolio - use first link found
    const portfolioLinks = screen.getAllByRole('link', { name: /^portfolio$/i })
    if (portfolioLinks[0]) {
      await user.click(portfolioLinks[0])
    }
    await waitFor(() => {
      expect(screen.getByTestId('project-grid')).toBeInTheDocument()
    }, { timeout: 2000 })

    // Navigate to Blog
    const blogLinks = screen.getAllByRole('link', { name: /^blog$/i })
    if (blogLinks[0]) {
      await user.click(blogLinks[0])
    }
    await waitFor(() => {
      expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    // Navigate to Contact
    const contactLinks = screen.getAllByRole('link', { name: /^contact$/i })
    if (contactLinks[0]) {
      await user.click(contactLinks[0])
    }
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    // Navigate back to Home
    const homeLinks = screen.getAllByRole('link', { name: /^home$/i })
    if (homeLinks[0]) {
      await user.click(homeLinks[0])
    }
    await waitFor(() => {
      expect(screen.getByTestId('hero-full')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('maintains navbar and footer on all pages', () => {
    const routes = ['/', '/about', '/portfolio', '/blog', '/contact']
    
    routes.forEach((route) => {
      const { unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      )

      // Navbar should be present
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      const logoLinks = screen.getAllByText('theo.dev')
      expect(logoLinks.length).toBeGreaterThan(0)

      // Footer should be present
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()

      unmount()
    })
  })
})

