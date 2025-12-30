/**
 * AdminLayout component
 * Top navigation bar layout for admin pages with mobile-responsive design
 */

import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, Users, FolderKanban, Settings, Home, ClipboardList, Megaphone, UsersRound, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const adminNavLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Tracking', href: '/admin/tracking', icon: ClipboardList },
  { name: 'Client Groups', href: '/admin/client-groups', icon: UsersRound },
  { name: 'Release Notes', href: '/admin/release-notes', icon: Megaphone },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMenu = () => setMobileMenuOpen(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

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

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Admin Title */}
            <Link
              to="/admin"
              className="flex items-center gap-2 text-lg font-semibold text-zinc-100 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-indigo-500" />
              Admin Dashboard
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {adminNavLinks.map((link) => {
                const Icon = link.icon
                const isActive = isActiveRoute(link.href)

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                      isActive
                        ? 'text-white bg-zinc-800'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                )
              })}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 ml-2"
                  >
                    <span className="max-w-[120px] truncate">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                  <div className="px-2 py-1.5 text-sm text-zinc-300">
                    <div className="font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={() => navigate('/')}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Site
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
              data-testid="admin-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {adminNavLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = isActiveRoute(link.href)

                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={closeMenu}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3',
                        isActive
                          ? 'text-white bg-zinc-800'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  )
                })}

                {/* Mobile User Section */}
                <div className="pt-2 mt-2 border-t border-zinc-800">
                  <div className="px-4 py-2 text-sm text-zinc-300">
                    <div className="font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Back to Site
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
