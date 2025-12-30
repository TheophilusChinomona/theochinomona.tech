import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import AuthModal from './AuthModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Track Project', href: '/track' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { scrolled } = useScrollPosition(50)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, signOut } = useAuth()

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMenu = () => setMobileMenuOpen(false)
  
  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (user?.role === 'admin') {
      return '/admin'
    }
    // Clients go to client dashboard
    return '/dashboard'
  }

  const handleAuthClick = () => {
    setAuthModalOpen(true)
    closeMenu() // Close mobile menu if open
  }

  const handleLogout = async () => {
    await signOut()
    closeMenu()
  }

  // Get display name for authenticated user
  const getUserDisplayName = () => {
    if (!user) return ''
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`
    }
    if (user.name) {
      return user.name
    }
    return user.email
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800'
          : 'bg-transparent backdrop-blur-sm'
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center h-16 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <img
              src="/images/logos-svg/theochinomona-logo-transparent-accent.svg"
              alt="theochinomona.tech"
              className="h-40 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white bg-zinc-800'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  )}
                >
                  {link.name}
                </Link>
              )
            })}

            {/* Desktop Auth Button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    aria-label={`User menu for ${getUserDisplayName()}`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="max-w-[120px] truncate">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                  <div className="px-2 py-1.5 text-sm text-zinc-300">
                    <div className="font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                    <div className="text-xs text-zinc-600 capitalize">{user.role}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => navigate(getDashboardUrl())}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={handleAuthClick}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                aria-label="Login"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 overflow-hidden"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMenu}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'text-white bg-zinc-800'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    )}
                  >
                    {link.name}
                  </Link>
                )
              })}

              {/* Mobile Auth Button */}
              {isAuthenticated && user ? (
                <div className="pt-2 mt-2 border-t border-zinc-800 space-y-1">
                  <div className="px-4 py-2 text-sm text-zinc-300">
                    <div className="font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                    <div className="text-xs text-zinc-600 capitalize">{user.role}</div>
                  </div>
                  <Link
                    to={getDashboardUrl()}
                    onClick={closeMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  aria-label="Login"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  )
}

