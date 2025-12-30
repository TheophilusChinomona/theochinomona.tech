/**
 * Tests for ProjectList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import ProjectList from './ProjectList'
import { getAllProjects, deleteProject, bulkDeleteProjects, type Project } from '@/lib/db/projects'

// Mock the database functions
vi.mock('@/lib/db/projects', () => ({
  getAllProjects: vi.fn(),
  deleteProject: vi.fn(),
  bulkDeleteProjects: vi.fn(),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((_date) => `2 days ago`),
}))

// Mock react-router-dom navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
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

describe('ProjectList', () => {
  const mockGetAllProjects = vi.mocked(getAllProjects)
  const mockDeleteProject = vi.mocked(deleteProject)
  const mockBulkDeleteProjects = vi.mocked(bulkDeleteProjects)

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Project 1',
      description: 'Description 1',
      tech: ['React', 'TypeScript'],
      category: 'Web',
      thumbnail: null,
      client_name: null,
      client_id: null,
      project_url: null,
      github_url: null,
      completion_date: null,
      featured: false,
      status: 'draft',
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Project 2',
      description: 'Description 2',
      tech: ['Vue', 'JavaScript'],
      category: 'Mobile',
      thumbnail: 'https://example.com/image.jpg',
      client_name: 'Client Name',
      client_id: null,
      project_url: 'https://example.com',
      github_url: 'https://github.com/example',
      completion_date: '2025-12-01',
      featured: true,
      status: 'published',
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllProjects.mockResolvedValue(mockProjects)
    mockDeleteProject.mockResolvedValue()
    mockBulkDeleteProjects.mockResolvedValue()
  })

  it('should display all projects in table format', async () => {
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
      expect(screen.getByText('Project 2')).toBeInTheDocument()
    })
  })

  it('should show correct columns (title, category, status, featured, created date)', async () => {
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Featured')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
    })
  })

  it('should filter projects by title or description when searching', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
      expect(screen.getByText('Project 2')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by title or description...')
    await user.type(searchInput, 'Project 1')

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
      expect(screen.queryByText('Project 2')).not.toBeInTheDocument()
    })
  })

  it('should show "No projects found" when search returns no results', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by title or description...')
    await user.type(searchInput, 'NonExistentProject')

    await waitFor(() => {
      expect(screen.getByText('No projects found matching your search')).toBeInTheDocument()
    })
  })

  it('should navigate to create form when Create Project button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Create Project')).toBeInTheDocument()
    })

    const createButton = screen.getByText('Create Project')
    await user.click(createButton)

    expect(mockNavigate).toHaveBeenCalledWith('/admin/projects/new')
  })

  it('should handle loading state', () => {
    mockGetAllProjects.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithProviders(<ProjectList />)

    // Check for skeleton loaders (they should be present)
    const skeletons = screen.getAllByTestId(/skeleton/i)
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should handle error state', async () => {
    mockGetAllProjects.mockRejectedValue(new Error('Failed to load projects'))

    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Projects')).toBeInTheDocument()
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
    })
  })

  it('should allow selecting projects for bulk delete', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
    })

    // Find checkboxes (they should be present in the table)
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThan(0)

    // Click first project checkbox
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]!) // Skip the "select all" checkbox
    }

    await waitFor(() => {
      expect(screen.getByText(/selected/)).toBeInTheDocument()
    })
  })

  it('should show bulk delete button when projects are selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectList />)

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]!) // Select first project
    }

    await waitFor(() => {
      expect(screen.getByText('Delete Selected')).toBeInTheDocument()
    })
  })
})

