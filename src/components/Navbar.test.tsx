import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '@/hooks/useAuth'

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// Mock AuthModal
vi.mock('@/components/AuthModal', () => ({
  default: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="auth-modal" style={{ display: open ? 'block' : 'none' }}>
      <button onClick={() => onOpenChange(false)}>Close Modal</button>
    </div>
  ),
}))

// Wrapper for Router context
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Navbar', () => {
  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Default: not authenticated
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    } as any)
  })

  it('renders with all navigation links', () => {
    renderWithRouter(<Navbar />)
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.getByAltText('theochinomona.tech')).toBeInTheDocument()
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

  // Auth button tests
  it('renders auth button in desktop navigation when not authenticated', () => {
    renderWithRouter(<Navbar />)
    
    const authButton = screen.getByRole('button', { name: /login/i })
    expect(authButton).toBeInTheDocument()
  })

  it('renders auth button in mobile menu when not authenticated', () => {
    renderWithRouter(<Navbar />)
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i })
    fireEvent.click(menuButton)
    
    // Check for auth button in mobile menu
    const mobileMenu = screen.getByTestId('mobile-menu')
    const authButton = mobileMenu.querySelector('button[aria-label*="login" i]')
    expect(authButton).toBeInTheDocument()
  })

  it('opens auth modal when login button is clicked', () => {
    renderWithRouter(<Navbar />)
    
    const authButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(authButton)
    
    // Modal should be open
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
  })

  it('shows user name when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        auth_user_id: 'auth-1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: null,
        role: 'client',
        created_at: '',
        updated_at: '',
        supabaseUser: {} as any,
      },
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    } as any)

    renderWithRouter(<Navbar />)
    
    // Should show user name or email
    expect(screen.getByText(/john/i)).toBeInTheDocument()
  })

  it('shows user email when authenticated and name is not available', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        auth_user_id: 'auth-1',
        name: '',
        surname: '',
        email: 'user@example.com',
        phone: null,
        role: 'client',
        created_at: '',
        updated_at: '',
        supabaseUser: {} as any,
      },
      session: {} as any,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    } as any)

    renderWithRouter(<Navbar />)
    
    // Should show email
    expect(screen.getByText(/user@example\.com/i)).toBeInTheDocument()
  })
})
