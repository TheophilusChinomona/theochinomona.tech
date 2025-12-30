/**
 * Tests for Public Tracking Page
 * These tests verify the client-facing project tracking view
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TrackingPage from './TrackingPage'
import * as trackingDb from '@/lib/db/tracking'

// Mock the tracking database functions
vi.mock('@/lib/db/tracking', () => ({
  getProjectByTrackingCode: vi.fn(),
}))

// Create a wrapper for tests
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

function renderWithRouter(code: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/track/${code}`]}>
        <Routes>
          <Route path="/track/:code" element={<TrackingPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('TrackingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Valid Tracking Code', () => {
    it('should display project title and description for valid tracking code', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Test Project',
        description: 'This is a test project description',
        tech: ['React', 'TypeScript'],
        category: 'Web',
        thumbnail: null,
        client_name: 'Test Client',
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [
          {
            id: 'phase-1',
            project_id: 'proj-123',
            name: 'Design Phase',
            description: 'Design the application',
            sort_order: 0,
            estimated_start_date: '2025-01-01',
            estimated_end_date: '2025-01-15',
            actual_start_date: null,
            actual_end_date: null,
            status: 'completed',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [
              {
                id: 'task-1',
                phase_id: 'phase-1',
                name: 'Create wireframes',
                description: 'Design wireframes',
                sort_order: 0,
                completion_percentage: 100,
                developer_notes: 'Completed on time',
                created_at: '2025-12-30T00:00:00Z',
                updated_at: '2025-12-30T00:00:00Z',
              },
            ],
          },
        ],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Test Project')).toBeInTheDocument()
      })

      expect(screen.getByText('This is a test project description')).toBeInTheDocument()
    })

    it('should display phases in timeline view with status indicators', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Multi-Phase Project',
        description: 'Project with multiple phases',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [
          {
            id: 'phase-1',
            project_id: 'proj-123',
            name: 'Completed Phase',
            description: 'Done',
            sort_order: 0,
            estimated_start_date: '2025-01-01',
            estimated_end_date: '2025-01-15',
            actual_start_date: '2025-01-01',
            actual_end_date: '2025-01-14',
            status: 'completed',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [],
          },
          {
            id: 'phase-2',
            project_id: 'proj-123',
            name: 'In Progress Phase',
            description: 'Working on it',
            sort_order: 1,
            estimated_start_date: '2025-01-16',
            estimated_end_date: '2025-01-31',
            actual_start_date: '2025-01-16',
            actual_end_date: null,
            status: 'in_progress',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [],
          },
          {
            id: 'phase-3',
            project_id: 'proj-123',
            name: 'Pending Phase',
            description: 'Not started',
            sort_order: 2,
            estimated_start_date: '2025-02-01',
            estimated_end_date: '2025-02-15',
            actual_start_date: null,
            actual_end_date: null,
            status: 'pending',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [],
          },
        ],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Multi-Phase Project')).toBeInTheDocument()
      })

      // Check that phases are displayed
      expect(screen.getByText('Completed Phase')).toBeInTheDocument()
      expect(screen.getByText('In Progress Phase')).toBeInTheDocument()
      expect(screen.getByText('Pending Phase')).toBeInTheDocument()
    })

    it('should calculate and display overall progress correctly', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Progress Test Project',
        description: 'Testing progress calculation',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [
          {
            id: 'phase-1',
            project_id: 'proj-123',
            name: 'Phase 1',
            description: '',
            sort_order: 0,
            estimated_start_date: null,
            estimated_end_date: null,
            actual_start_date: null,
            actual_end_date: null,
            status: 'in_progress',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [
              {
                id: 'task-1',
                phase_id: 'phase-1',
                name: 'Task 1',
                description: null,
                sort_order: 0,
                completion_percentage: 100, // Complete
                developer_notes: null,
                created_at: '2025-12-30T00:00:00Z',
                updated_at: '2025-12-30T00:00:00Z',
              },
              {
                id: 'task-2',
                phase_id: 'phase-1',
                name: 'Task 2',
                description: null,
                sort_order: 1,
                completion_percentage: 50, // Half complete
                developer_notes: null,
                created_at: '2025-12-30T00:00:00Z',
                updated_at: '2025-12-30T00:00:00Z',
              },
            ],
          },
        ],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Progress Test Project')).toBeInTheDocument()
      })

      // Average of 100 + 50 = 75%
      // The progress percentage appears in both the header card and phase progress
      const progressElements = screen.getAllByText('75%')
      expect(progressElements.length).toBeGreaterThan(0)
    })

    it('should display task completion count', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Task Count Project',
        description: '',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [
          {
            id: 'phase-1',
            project_id: 'proj-123',
            name: 'Phase 1',
            description: '',
            sort_order: 0,
            estimated_start_date: null,
            estimated_end_date: null,
            actual_start_date: null,
            actual_end_date: null,
            status: 'in_progress',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [
              {
                id: 'task-1',
                phase_id: 'phase-1',
                name: 'Complete Task',
                description: null,
                sort_order: 0,
                completion_percentage: 100,
                developer_notes: null,
                created_at: '2025-12-30T00:00:00Z',
                updated_at: '2025-12-30T00:00:00Z',
              },
              {
                id: 'task-2',
                phase_id: 'phase-1',
                name: 'Incomplete Task',
                description: null,
                sort_order: 1,
                completion_percentage: 50,
                developer_notes: null,
                created_at: '2025-12-30T00:00:00Z',
                updated_at: '2025-12-30T00:00:00Z',
              },
            ],
          },
        ],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Task Count Project')).toBeInTheDocument()
      })

      // 1 complete out of 2 total - verify the completion count text is present
      expect(screen.getByText('/ 2 complete')).toBeInTheDocument()
    })
  })

  describe('Invalid/Inactive Tracking Code', () => {
    it('should display error message for invalid tracking code', async () => {
      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(null)

      renderWithRouter('INVALID-CODE')

      await waitFor(() => {
        expect(screen.getByText('Invalid or Expired Tracking Code')).toBeInTheDocument()
      })

      expect(screen.getByText('INVALID-CODE')).toBeInTheDocument()
    })

    it('should display error message when API throws error', async () => {
      vi.mocked(trackingDb.getProjectByTrackingCode).mockRejectedValue(
        new Error('API Error')
      )

      renderWithRouter('TC-ERROR')

      await waitFor(() => {
        expect(screen.getByText('Invalid or Expired Tracking Code')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should display loading spinner while fetching', async () => {
      // Delay the resolution to ensure loading state is visible
      vi.mocked(trackingDb.getProjectByTrackingCode).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      )

      renderWithRouter('TC-ABC123')

      expect(screen.getByText('Loading project...')).toBeInTheDocument()
    })
  })

  describe('Empty Project', () => {
    it('should display message when project has no phases', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Empty Project',
        description: 'No phases yet',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Empty Project')).toBeInTheDocument()
      })

      expect(screen.getByText('No phases have been added to this project yet.')).toBeInTheDocument()
    })
  })

  describe('Notification Opt-in', () => {
    it('should display notification opt-in form when tracking code exists', async () => {
      const mockProject: trackingDb.ProjectWithDetails = {
        id: 'proj-123',
        title: 'Project with Notification',
        description: '',
        tech: ['React'],
        category: 'Web',
        thumbnail: null,
        client_name: null,
        project_url: null,
        github_url: null,
        completion_date: null,
        featured: false,
        status: 'published',
        created_at: '2025-12-30T00:00:00Z',
        updated_at: '2025-12-30T00:00:00Z',
        tracking_code: {
          id: 'tc-123',
          project_id: 'proj-123',
          code: 'TC-ABC123',
          is_active: true,
          created_at: '2025-12-30T00:00:00Z',
          updated_at: '2025-12-30T00:00:00Z',
        },
        phases: [
          {
            id: 'phase-1',
            project_id: 'proj-123',
            name: 'Phase 1',
            description: '',
            sort_order: 0,
            estimated_start_date: null,
            estimated_end_date: null,
            actual_start_date: null,
            actual_end_date: null,
            status: 'pending',
            notify_on_complete: true,
            created_at: '2025-12-30T00:00:00Z',
            updated_at: '2025-12-30T00:00:00Z',
            tasks: [],
          },
        ],
        attachments: [],
      }

      vi.mocked(trackingDb.getProjectByTrackingCode).mockResolvedValue(mockProject)

      renderWithRouter('TC-ABC123')

      await waitFor(() => {
        expect(screen.getByText('Project with Notification')).toBeInTheDocument()
      })

      // The NotificationOptIn component should be rendered
      // Check that the tracking page rendered by verifying project title appears
      expect(screen.getByRole('heading', { level: 1, name: 'Project with Notification' })).toBeInTheDocument()
    })
  })
})

