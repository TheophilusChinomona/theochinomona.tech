/**
 * ThemeContext
 * Provides theme state and controls across the application
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserPreferences, updateUserPreferences } from '@/lib/db/userPreferences'
import type { ThemePreference } from '@/lib/db/types/dashboard'

interface ThemeContextType {
  theme: ThemePreference
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemePreference) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'theme-preference'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemePreference | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return null
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemePreference
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [theme, setThemeState] = useState<ThemePreference>(
    () => getStoredTheme() || defaultTheme
  )
  const [isLoading, setIsLoading] = useState(true)

  // Calculate resolved theme
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? getSystemTheme() : theme

  // Apply theme to document
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      applyTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Load user preferences on auth
  useEffect(() => {
    async function loadUserPreferences() {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const prefs = await getUserPreferences(user.id)
        if (prefs.theme) {
          setThemeState(prefs.theme)
          localStorage.setItem(STORAGE_KEY, prefs.theme)
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserPreferences()
  }, [isAuthenticated, user?.id])

  // Set theme function
  const setTheme = useCallback(
    async (newTheme: ThemePreference) => {
      setThemeState(newTheme)
      localStorage.setItem(STORAGE_KEY, newTheme)

      // Persist to database if authenticated
      if (isAuthenticated && user?.id) {
        try {
          await updateUserPreferences(user.id, { theme: newTheme })
        } catch (error) {
          console.error('Failed to save theme preference:', error)
        }
      }
    },
    [isAuthenticated, user?.id]
  )

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

