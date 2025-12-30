/**
 * Tests for EditProjectPage
 * Tests page loading, form pre-population, and update functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EditProjectPage from './EditProjectPage'
import { getProjectById, updateProject } from '@/lib/db/projects'

// Mock the database functions
vi.mock('@/lib/db/projects', () => ({
  getProjectById: vi.fn(),
  updateProject: vi.fn(),
}))

// Mock react-router-dom useParams and navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => mockNavigate,
  }
})

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

describe('EditProjectPage', () => {
  const mockGetProjectById = vi.mocked(getProjectById)
  const mockUpdateProject = vi.mocked(updateProject)

  const mockProject = {
    id: '123',
    title: 'Existing Project',
    description: 'Existing description',
    tech: ['React', 'TypeScript'],
    category: 'Web',
    thumbnail: 'https://example.com/image.jpg',
    client_name: 'Test Client',
    project_url: 'https://example.com',
    github_url: 'https://github.com/example',
    completion_date: '2025-12-01',
    featured: true,
    status: 'published' as const,
    created_at: '2025-12-30T00:00:00Z',
    updated_at: '2025-12-30T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetProjectById.mockResolvedValue(mockProject)
  })

  it('displays loading state while fetching project', () => {
    mockGetProjectById.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithProviders(<EditProjectPage />)

    // Should show skeleton loaders
    const skeletons = screen.getAllByTestId(/skeleton/i)
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('pre-populates form with existing project data', async () => {
    renderWithProviders(<EditProjectPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('updates project and navigates to list after successful update', async () => {
    const user = userEvent.setup()
    const updatedProject = { ...mockProject, title: 'Updated Project' }
    mockUpdateProject.mockResolvedValue(updatedProject)

    renderWithProviders(<EditProjectPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
    })

    // Update title
    const titleInput = screen.getByDisplayValue('Existing Project')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Project')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /update project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          title: 'Updated Project',
        })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects')
    })
  })

  it('displays error when project not found', async () => {
    mockGetProjectById.mockResolvedValue(null)

    renderWithProviders(<EditProjectPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading project/i)).toBeInTheDocument()
    })
  })

  it('handles update errors gracefully', async () => {
    const user = userEvent.setup()
    mockUpdateProject.mockRejectedValue(new Error('Failed to update project'))

    renderWithProviders(<EditProjectPage />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
    })

    // Try to update
    const titleInput = screen.getByDisplayValue('Existing Project')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Project')

    const submitButton = screen.getByRole('button', { name: /update project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalled()
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})

