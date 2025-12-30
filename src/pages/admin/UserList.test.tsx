/**
 * Tests for UserList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import UserList from './UserList'
import { getAllUsers, deleteUser, updateUserRole } from '@/lib/db/users'
import { sendPasswordResetEmail } from '@/lib/auth'

// Mock the database functions
vi.mock('@/lib/db/users', () => ({
  getAllUsers: vi.fn(),
  deleteUser: vi.fn(),
  updateUserRole: vi.fn(),
}))

// Mock auth functions
vi.mock('@/lib/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((_date) => `2 days ago`),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('UserList', () => {
  const mockGetAllUsers = vi.mocked(getAllUsers)
  const mockDeleteUser = vi.mocked(deleteUser)
  const mockUpdateUserRole = vi.mocked(updateUserRole)
  const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail)

  const mockUsers = [
    {
      id: '1',
      auth_user_id: 'auth1',
      name: 'John',
      surname: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      role: 'client' as const,
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
      role: 'admin' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllUsers.mockResolvedValue(mockUsers)
    mockDeleteUser.mockResolvedValue('1')
    mockUpdateUserRole.mockResolvedValue(mockUsers[0]!)
    mockSendPasswordResetEmail.mockResolvedValue({
      success: true,
      error: null,
      message: 'Password reset email sent',
    })
  })

  it('should display all users in table format', async () => {
    renderWithProviders(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('should show correct columns (name, email, role, phone, created date)', async () => {
    renderWithProviders(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
    })
  })

  it('should filter users by name or email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by name or email...')
    await user.type(searchInput, 'john')

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    mockGetAllUsers.mockRejectedValue(new Error('Failed to load users'))

    renderWithProviders(<UserList />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Users')).toBeInTheDocument()
      expect(screen.getByText('Failed to load users')).toBeInTheDocument()
    })
  })
})

