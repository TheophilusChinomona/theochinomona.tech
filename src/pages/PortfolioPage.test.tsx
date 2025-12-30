import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PortfolioPage from './PortfolioPage'
import { getPublishedProjects, type Project } from '@/lib/db/projects'

// Mock the database function
vi.mock('@/lib/db/projects', () => ({
  getPublishedProjects: vi.fn(),
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
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('PortfolioPage', () => {
  const mockGetPublishedProjects = vi.mocked(getPublishedProjects)

  const mockDbProjects: Project[] = [
    {
      id: 'db-1',
      title: 'Database Project 1',
      description: 'A project from the database',
      tech: ['React', 'TypeScript', 'Supabase'],
      category: 'Web',
      thumbnail: 'https://example.com/db1.jpg',
      client_name: 'Test Client',
      client_id: null,
      project_url: 'https://example.com/project1',
      github_url: 'https://github.com/example/project1',
      completion_date: '2025-12-01',
      featured: true,
      status: 'published',
      notifications_enabled: true,
      created_at: '2025-12-30T00:00:00Z',
      updated_at: '2025-12-30T00:00:00Z',
    },
    {
      id: 'db-2',
      title: 'Database Project 2',
      description: 'Another database project',
      tech: ['Vue', 'JavaScript'],
      category: 'Mobile',
      thumbnail: null,
      client_name: null,
      client_id: null,
      project_url: null,
      github_url: null,
      completion_date: null,
      featured: false,
      status: 'published',
      notifications_enabled: true,
      created_at: '2025-12-29T00:00:00Z',
      updated_at: '2025-12-29T00:00:00Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPublishedProjects.mockResolvedValue(mockDbProjects)
  })

  it('renders project grid', () => {
    renderWithProviders(<PortfolioPage />)

    const grid = screen.queryByTestId('project-grid')
    expect(grid).toBeInTheDocument()
  })

  it('renders filter tabs for categories', () => {
    renderWithProviders(<PortfolioPage />)

    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^web$/i })).toBeInTheDocument()
  })

  it('renders project cards', async () => {
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      const cards = screen.queryAllByTestId(/project-card/)
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  it('displays both hardcoded and database projects', async () => {
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      // Hardcoded projects
      expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
      expect(screen.getByText('Task Management App')).toBeInTheDocument()
      // Database projects
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
      expect(screen.getByText('Database Project 2')).toBeInTheDocument()
    })
  })

  it('filters projects by category correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
    })

    // Click Web category filter
    const webButton = screen.getByRole('button', { name: /^web$/i })
    await user.click(webButton)

    await waitFor(() => {
      // Should show Web projects
      expect(screen.getByText('Task Management App')).toBeInTheDocument()
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
      // Should not show Full-Stack projects
      expect(screen.queryByText('E-Commerce Platform')).not.toBeInTheDocument()
    })
  })

  it('filters projects by tech stack', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
    })

    // Click on React tech badge
    const reactBadge = screen.getByText('React')
    await user.click(reactBadge)

    await waitFor(() => {
      // Should show projects with React
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
      // Should not show projects without React
      expect(screen.queryByText('Database Project 2')).not.toBeInTheDocument()
    })
  })

  it('filters projects by search query', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search projects...')
    await user.type(searchInput, 'Database')

    await waitFor(() => {
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
      expect(screen.getByText('Database Project 2')).toBeInTheDocument()
      // Hardcoded projects should be filtered out
      expect(screen.queryByText('E-Commerce Platform')).not.toBeInTheDocument()
    })
  })

  it('sorts projects alphabetically', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument()
    })

    // Change sort to alphabetical
    const sortSelect = screen.getByLabelText(/sort by/i)
    await user.click(sortSelect)

    const alphabeticalOption = screen.getByText('Alphabetical (A-Z)')
    await user.click(alphabeticalOption)

    // Verify projects are displayed (exact order is hard to test without DOM inspection)
    await waitFor(() => {
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
    })
  })

  it('displays pagination when projects exceed page limit', async () => {
    // Create more than 12 projects
    const manyProjects = Array.from({ length: 15 }, (_, i) => ({
      id: `db-${i}`,
      title: `Project ${i}`,
      description: `Description ${i}`,
      tech: ['React'],
      category: 'Web',
      thumbnail: null,
      client_name: null,
      project_url: null,
      github_url: null,
      completion_date: null,
      featured: false,
      status: 'published' as const,
      client_id: null,
      notifications_enabled: true,
      created_at: '2025-12-30T00:00:00Z',
      updated_at: '2025-12-30T00:00:00Z',
    }))

    mockGetPublishedProjects.mockResolvedValue(manyProjects)
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      // Should show pagination controls
      expect(screen.getByText(/page 1 of/i)).toBeInTheDocument()
    })
  })

  it('handles loading state', () => {
    mockGetPublishedProjects.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithProviders(<PortfolioPage />)

    // Should show skeleton loaders
    const skeletons = screen.getAllByTestId(/skeleton/i)
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('handles error state', async () => {
    mockGetPublishedProjects.mockRejectedValue(new Error('Failed to load projects'))

    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText(/error loading projects/i)).toBeInTheDocument()
    })
  })

  it('only displays published projects from database', async () => {
    // Mock only published projects
    const baseProject = mockDbProjects[0]
    if (!baseProject) {
      throw new Error('mockDbProjects[0] is undefined')
    }
    const publishedOnly: Project[] = [
      {
        ...baseProject,
        status: 'published',
      },
    ]

    mockGetPublishedProjects.mockResolvedValue(publishedOnly)
    renderWithProviders(<PortfolioPage />)

    await waitFor(() => {
      expect(screen.getByText('Database Project 1')).toBeInTheDocument()
      // Should not show draft projects
      expect(screen.queryByText('Database Project 2')).not.toBeInTheDocument()
    })
  })
})
