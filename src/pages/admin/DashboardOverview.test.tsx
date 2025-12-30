/**
 * Tests for DashboardOverview component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import DashboardOverview from './DashboardOverview'
import { getDashboardStats } from '@/lib/db/users'

// Mock the database function
vi.mock('@/lib/db/users', () => ({
  getDashboardStats: vi.fn(),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((_date) => `2 days ago`),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('DashboardOverview', () => {
  const mockGetDashboardStats = vi.mocked(getDashboardStats)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard page with statistics cards', async () => {
    mockGetDashboardStats.mockResolvedValue({
      totalUsers: 10,
      totalAdmins: 2,
      totalClients: 8,
      recentSignups: 3,
      recentUsers: [
        {
          id: '1',
          auth_user_id: 'auth1',
          name: 'John',
          surname: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })

    renderWithProviders(<DashboardOverview />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument() // Total Users
      expect(screen.getByText('2')).toBeInTheDocument() // Total Admins
      expect(screen.getByText('8')).toBeInTheDocument() // Total Clients
      expect(screen.getByText('3')).toBeInTheDocument() // Recent Signups
    })
  })

  it('should display total users count correctly', async () => {
    mockGetDashboardStats.mockResolvedValue({
      totalUsers: 25,
      totalAdmins: 5,
      totalClients: 20,
      recentSignups: 7,
      recentUsers: [],
    })

    renderWithProviders(<DashboardOverview />)

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  it('should display recent signups count (last 7 days)', async () => {
    mockGetDashboardStats.mockResolvedValue({
      totalUsers: 10,
      totalAdmins: 1,
      totalClients: 9,
      recentSignups: 5,
      recentUsers: [],
    })

    renderWithProviders(<DashboardOverview />)

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    })
  })

  it('should show recent users list with timestamps', async () => {
    const mockUsers = [
      {
        id: '1',
        auth_user_id: 'auth1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        auth_user_id: 'auth2',
        name: 'Jane',
        surname: 'Smith',
        email: 'jane@example.com',
        phone: null,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    mockGetDashboardStats.mockResolvedValue({
      totalUsers: 2,
      totalAdmins: 1,
      totalClients: 1,
      recentSignups: 2,
      recentUsers: mockUsers as any,
    })

    renderWithProviders(<DashboardOverview />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('should handle loading and error states', async () => {
    mockGetDashboardStats.mockRejectedValue(new Error('Failed to load stats'))

    renderWithProviders(<DashboardOverview />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Failed to load stats')).toBeInTheDocument()
    })
  })
})

