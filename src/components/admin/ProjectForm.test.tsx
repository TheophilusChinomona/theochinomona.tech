/**
 * Tests for ProjectForm component
 * Tests form validation, submission, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProjectForm from './ProjectForm'
import { type Project } from '@/lib/db/projects'
import { uploadProjectThumbnail, checkStorageAvailability } from '@/lib/storage'

// Mock storage functions
vi.mock('@/lib/storage', () => ({
  uploadProjectThumbnail: vi.fn(),
  checkStorageAvailability: vi.fn(),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn()
  const mockCheckStorageAvailability = vi.mocked(checkStorageAvailability)
  const mockUploadProjectThumbnail = vi.mocked(uploadProjectThumbnail)

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckStorageAvailability.mockResolvedValue(true)
    mockUploadProjectThumbnail.mockResolvedValue('https://example.com/uploaded.jpg')
  })

  it('validates required fields (title, description, tech, category)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectForm onSubmit={mockOnSubmit} />)

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/at least one technology is required/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectForm onSubmit={mockOnSubmit} />)

    // Fill in required fields
    await user.type(screen.getByPlaceholderText(/project title/i), 'Test Project')
    await user.type(
      screen.getByPlaceholderText(/project description/i),
      'This is a test project description'
    )

    // Add tech stack
    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    // Select category
    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    await user.click(screen.getByText('Web'))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
          description: 'This is a test project description',
          tech: ['React'],
          category: 'Web',
        })
      )
    })
  })

  it('pre-populates form with existing project data', async () => {
    const existingProject: Project = {
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
      status: 'published',
      created_at: '2025-12-30T00:00:00Z',
      updated_at: '2025-12-30T00:00:00Z',
    }

    renderWithProviders(<ProjectForm project={existingProject} onSubmit={mockOnSubmit} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('allows adding and removing tech stack items', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectForm onSubmit={mockOnSubmit} />)

    // Add first tech
    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    // Add second tech
    await user.type(techInput, 'TypeScript')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    // Remove first tech
    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removeButton = removeButtons.find((btn) =>
      btn.querySelector('svg')
    ) as HTMLButtonElement
    if (removeButton) {
      await user.click(removeButton)
    }

    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  it('handles image upload when storage is available', async () => {
    const user = userEvent.setup()
    mockCheckStorageAvailability.mockResolvedValue(true)
    mockUploadProjectThumbnail.mockResolvedValue('https://example.com/uploaded.jpg')

    renderWithProviders(<ProjectForm onSubmit={mockOnSubmit} />)

    // Fill required fields first
    await user.type(screen.getByPlaceholderText(/project title/i), 'Test Project')
    await user.type(
      screen.getByPlaceholderText(/project description/i),
      'This is a test project description'
    )
    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    await user.click(screen.getByText('Web'))

    // Upload image file
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = screen.getByLabelText(/thumbnail/i).querySelector('input[type="file"]')
    if (fileInput) {
      await user.upload(fileInput, file)
    }

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUploadProjectThumbnail).toHaveBeenCalled()
    })
  })

  it('handles form submission errors gracefully', async () => {
    const user = userEvent.setup()
    const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))

    renderWithProviders(<ProjectForm onSubmit={errorOnSubmit} />)

    // Fill in required fields
    await user.type(screen.getByPlaceholderText(/project title/i), 'Test Project')
    await user.type(
      screen.getByPlaceholderText(/project description/i),
      'This is a test project description'
    )

    const techInput = screen.getByPlaceholderText(/add technology/i)
    await user.type(techInput, 'React')
    await user.keyboard('{Enter}')

    const categorySelect = screen.getByLabelText(/category/i)
    await user.click(categorySelect)
    await user.click(screen.getByText('Web'))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create project/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(errorOnSubmit).toHaveBeenCalled()
    })
  })
})

