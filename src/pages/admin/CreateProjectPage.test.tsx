/**
 * Tests for CreateProjectPage
 * Tests page navigation, form integration, and success/error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CreateProjectPage from './CreateProjectPage'
import { createProject, type Project } from '@/lib/db/projects'

// Mock the database function
vi.mock('@/lib/db/projects', () => ({
  createProject: vi.fn(),
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

describe('CreateProjectPage', () => {
  const mockCreateProject = vi.mocked(createProject)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create project form', () => {
    renderWithProviders(<CreateProjectPage />)

    expect(screen.getByText('Create Project')).toBeInTheDocument()
    expect(screen.getByText('Add a new project to your portfolio')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/project title/i)).toBeInTheDocument()
  })

  it('navigates to project list after successful creation', async () => {
    const user = userEvent.setup()
    const mockProject: Project = {
      id: '123',
      title: 'New Project',
      description: 'Description',
      tech: ['React'],
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
      created_at: '2025-12-30T00:00:00Z',
      updated_at: '2025-12-30T00:00:00Z',
    }

    mockCreateProject.mockResolvedValue(mockProject)
    renderWithProviders(<CreateProjectPage />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/project title/i), 'New Project')
    await user.type(
      screen.getByPlaceholderText(/project description/i),
      'This is a new project description'
    )

    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    await user.click(screen.getByText('Web'))

    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/admin/projects')
    })
  })

  it('handles creation errors', async () => {
    const user = userEvent.setup()
    mockCreateProject.mockRejectedValue(new Error('Failed to create project'))

    renderWithProviders(<CreateProjectPage />)

    // Fill and submit form
    await user.type(screen.getByPlaceholderText(/project title/i), 'New Project')
    await user.type(
      screen.getByPlaceholderText(/project description/i),
      'This is a new project description'
    )

    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    await user.click(screen.getByText('Web'))

    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalled()
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})

