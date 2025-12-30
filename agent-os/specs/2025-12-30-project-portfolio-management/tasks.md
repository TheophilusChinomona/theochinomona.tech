# Task Breakdown: Project & Portfolio Management

## Overview
Total Tasks: 7 Task Groups

## Task List

### Database Layer

#### Task Group 1: Project Database Schema & Migration
**Dependencies:** None

- [x] 1.0 Complete project database schema and migration
  - [x] 1.1 Write 4-6 focused tests for project schema
    - Test: Projects table exists with all required columns
    - Test: Project status enum accepts only 'draft' or 'published' values
    - Test: Project tech field accepts text array
    - Test: RLS policies allow public to SELECT published projects only
    - Test: RLS policies allow admins to SELECT/INSERT/UPDATE/DELETE all projects
    - Test: Updated_at trigger automatically updates timestamp on record changes
  - [x] 1.2 Create project_status enum type
    - Create enum: `CREATE TYPE project_status AS ENUM ('draft', 'published')`
    - Follow pattern from `user_role` enum in users table migration
  - [x] 1.3 Create projects table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_projects_table.sql`
    - Table fields: `id` (UUID, primary key, default gen_random_uuid()), `title` (TEXT, NOT NULL), `description` (TEXT, NOT NULL), `tech` (TEXT[], NOT NULL), `category` (TEXT, NOT NULL), `thumbnail` (TEXT), `client_name` (TEXT), `project_url` (TEXT), `github_url` (TEXT), `completion_date` (DATE), `featured` (BOOLEAN, default false), `status` (project_status, default 'draft'), `created_at` (TIMESTAMPTZ, default NOW()), `updated_at` (TIMESTAMPTZ, default NOW())
    - Add comment for future foreign key to client projects (Phase 5): `-- TODO: Add foreign key to client_projects table in Phase 5`
    - Follow naming and structure pattern from users table migration
  - [x] 1.4 Create indexes for performance
    - Create index on `category`: `CREATE INDEX idx_projects_category ON projects(category)`
    - Create index on `status`: `CREATE INDEX idx_projects_status ON projects(status)`
    - Create index on `featured`: `CREATE INDEX idx_projects_featured ON projects(featured)`
    - Create index on `created_at`: `CREATE INDEX idx_projects_created_at ON projects(created_at DESC)`
    - Create composite index for common queries: `CREATE INDEX idx_projects_status_featured ON projects(status, featured)`
  - [x] 1.5 Set up updated_at trigger
    - Reuse existing `update_updated_at_column()` function from users migration
    - Create trigger: `CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
  - [x] 1.6 Enable Row Level Security (RLS)
    - Enable RLS: `ALTER TABLE projects ENABLE ROW LEVEL SECURITY`
    - Create policy: "Public can view published projects" - allows SELECT for projects where status = 'published'
    - Create policy: "Admins can manage all projects" - allows SELECT/INSERT/UPDATE/DELETE for users with admin role
    - Follow RLS pattern from users table migration (check admin role via subquery)
  - [x] 1.7 Create down migration file
    - Create `supabase/migrations/YYYYMMDDHHMMSS_create_projects_table.down.sql`
    - Drop trigger, policies, indexes, table, and enum type in reverse order
    - Ensure migration is reversible
  - [x] 1.8 Ensure database schema tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify migration runs successfully
    - Verify RLS policies work correctly
    - Verify indexes are created
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- Projects table created with all required fields
- RLS policies enforce public read access for published projects only
- RLS policies allow admin full access to all projects
- Indexes created for filtering performance
- Updated_at trigger works automatically

---

### Database Functions

#### Task Group 2: Project Database Functions
**Dependencies:** Task Group 1

- [x] 2.0 Complete project database functions
  - [x] 2.1 Write 6-8 focused tests for project database functions
    - Test: getAllProjects returns all projects from database
    - Test: getPublishedProjects returns only published projects
    - Test: getProjectById returns single project by ID
    - Test: createProject creates new project with all fields
    - Test: updateProject updates project fields correctly
    - Test: deleteProject removes project from database
    - Test: bulkDeleteProjects deletes multiple projects by IDs
    - Test: Functions handle errors gracefully (invalid ID, permission errors)
  - [x] 2.2 Create Project TypeScript interface
    - Create `Project` interface in `src/lib/db/projects.ts`
    - Match all fields from database schema
    - Export interface for use across application
  - [x] 2.3 Create getAllProjects function
    - Create function: `getAllProjects(): Promise<Project[]>`
    - Query all projects from `projects` table using Supabase client
    - Order by `created_at DESC` (newest first)
    - Return array of Project objects
    - Handle RLS policy (admin role check)
    - Add proper error handling for database errors
  - [x] 2.4 Create getPublishedProjects function
    - Create function: `getPublishedProjects(): Promise<Project[]>`
    - Query projects where `status = 'published'`
    - Order by `featured DESC, created_at DESC` (featured first, then newest)
    - Return array of published Project objects
    - Public access (no admin role required)
    - Handle database errors gracefully
  - [x] 2.5 Create getProjectById function
    - Create function: `getProjectById(id: string): Promise<Project | null>`
    - Query single project by ID
    - Return Project object or null if not found
    - Handle RLS policy (admin can access all, public can access published only)
    - Handle errors if project doesn't exist
  - [x] 2.6 Create createProject function
    - Create function: `createProject(data: CreateProjectInput): Promise<Project>`
    - Insert new project record into `projects` table
    - Validate required fields: title, description, tech (array with at least one item), category
    - Set default values: status = 'draft', featured = false
    - Return created Project object
    - Handle validation errors and database errors
  - [x] 2.7 Create updateProject function
    - Create function: `updateProject(id: string, updates: UpdateProjectInput): Promise<Project>`
    - Update project record in `projects` table
    - Allow updating all fields except `id` and `created_at`
    - Return updated Project object
    - Handle errors if project doesn't exist
  - [x] 2.8 Create deleteProject function
    - Create function: `deleteProject(id: string): Promise<void>`
    - Delete project record from `projects` table
    - Return success or throw error
    - Handle errors if project doesn't exist or has associated data
  - [x] 2.9 Create bulkDeleteProjects function
    - Create function: `bulkDeleteProjects(ids: string[]): Promise<void>`
    - Delete multiple projects by array of IDs
    - Use Supabase `.in()` filter for batch deletion
    - Return success or throw error
    - Handle partial failures gracefully
  - [x] 2.10 Ensure database function tests pass
    - Run ONLY the 6-8 tests written in 2.1
    - Verify all CRUD operations work correctly
    - Verify RLS policies are respected
    - Verify error handling works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 2.1 pass
- All project database functions work correctly
- RLS policies are respected (public can only read published, admins can do everything)
- Error handling is robust
- TypeScript interfaces match database schema

---

### Storage Setup

#### Task Group 3: Supabase Storage Configuration
**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 3.0 Complete Supabase Storage setup
  - [x] 3.1 Write 3-4 focused tests for storage functionality
    - Test: Storage bucket exists and is accessible
    - Test: Image upload function uploads file to storage bucket
    - Test: Image upload returns public URL
    - Test: Storage RLS policies allow public read and admin write
  - [x] 3.2 Verify Supabase Storage availability
    - Check if Supabase Storage is available on free plan
    - Document storage limits and constraints
    - If not available, document fallback to external URL input only
  - [x] 3.3 Create storage bucket (if Storage available)
    - Create bucket named `project-thumbnails` in Supabase Storage
    - Configure bucket as public for read access
    - Set up folder structure if needed (e.g., `thumbnails/`)
  - [x] 3.4 Configure Storage RLS policies
    - Create policy: "Public can read project thumbnails" - allows SELECT for all files
    - Create policy: "Admins can upload project thumbnails" - allows INSERT for admin role
    - Create policy: "Admins can update project thumbnails" - allows UPDATE for admin role
    - Create policy: "Admins can delete project thumbnails" - allows DELETE for admin role
    - Follow RLS pattern from database tables
  - [x] 3.5 Create image upload helper function
    - Create `src/lib/storage.ts` file
    - Create function: `uploadProjectThumbnail(file: File, projectId: string): Promise<string>`
    - Upload file to `project-thumbnails` bucket
    - Generate unique filename (e.g., `${projectId}-${timestamp}-${originalName}`)
    - Return public URL of uploaded image
    - Handle upload errors and file validation
    - Optional: Add image optimization/resizing if needed
  - [x] 3.6 Ensure storage tests pass
    - Run ONLY the 3-4 tests written in 3.1
    - Verify bucket exists and is accessible
    - Verify upload functionality works
    - Verify RLS policies work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 3.1 pass
- Storage bucket created and configured (if Storage available)
- RLS policies allow public read and admin write/delete
- Image upload function works correctly
- Public URLs are returned for uploaded images

---

### Frontend Admin - Project Management

#### Task Group 4: Admin Project List Page
**Dependencies:** Task Groups 1, 2, 3

- [x] 4.0 Complete admin project list page
  - [x] 4.1 Write 5-6 focused tests for project list page
    - Test: Project list page displays all projects in table format
    - Test: Project list shows correct columns (title, category, status, featured, created date)
    - Test: Search functionality filters projects by title or description
    - Test: Bulk delete removes selected projects after confirmation
    - Test: Create Project button navigates to create form
    - Test: Project list handles loading and error states
  - [x] 4.2 Enable Projects navigation link
    - Update `src/layouts/AdminLayout.tsx`
    - Enable "Projects" link in navigation (remove `disabled: true`)
    - Set href to `/admin/projects`
    - Ensure active route highlighting works
  - [x] 4.3 Create ProjectList page component
    - Create `src/pages/admin/ProjectList.tsx`
    - Fetch all projects using `getAllProjects()` from Task Group 2
    - Use React Query for data fetching and caching
    - Display projects in table format using shadcn/ui Table component
    - Table columns: Title, Category, Status, Featured, Created Date, Actions
    - Add loading state with Skeleton components
    - Handle error states with error messages
    - Follow pattern from `UserList.tsx` component
  - [x] 4.4 Implement search functionality
    - Add search input field above table
    - Filter projects by title or description (client-side filtering)
    - Update table display based on search query
    - Show "No projects found" message when search returns no results
    - Use shadcn/ui Input component with Search icon
  - [x] 4.5 Implement bulk delete functionality
    - Add checkbox column to table for project selection
    - Add "Select All" checkbox in table header
    - Add "Delete Selected" button (disabled when no projects selected)
    - Create BulkDeleteDialog component for confirmation
    - Call `bulkDeleteProjects()` function with selected IDs
    - Refresh project list after successful deletion
    - Show success/error toast notifications
  - [x] 4.6 Add project actions (view, edit, delete)
    - Add action dropdown menu in each project row
    - Implement "View Details" action (modal or separate page)
    - Implement "Edit" action (navigates to edit form)
    - Implement "Delete" action (with confirmation dialog)
    - Use shadcn/ui DropdownMenu, Dialog components
    - Follow pattern from UserList actions
  - [x] 4.7 Add Create Project button
    - Add "Create Project" button in page header
    - Link to `/admin/projects/new` route (to be created in Task Group 6)
    - Use shadcn/ui Button component
    - Style consistently with other admin pages
  - [x] 4.8 Ensure project list tests pass
    - Run ONLY the 5-6 tests written in 4.1
    - Verify project list displays correctly
    - Verify search and bulk delete work
    - Verify loading and error states work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 5-6 tests written in 4.1 pass
- Project list displays all projects in table format
- Search functionality filters projects correctly
- Bulk delete works with confirmation dialog
- Create Project button navigates to create form
- Loading and error states work properly

---

#### Task Group 5: Admin Project Create/Edit Forms
**Dependencies:** Task Groups 1, 2, 3, 4

- [x] 5.0 Complete admin project create/edit forms
  - [x] 5.1 Write 6-8 focused tests for project forms
    - Test: Create project form validates required fields (title, description, tech, category)
    - Test: Create project form submits and creates new project
    - Test: Edit project form pre-populates with existing project data
    - Test: Edit project form updates project correctly
    - Test: Image upload works in form (if Storage available)
    - Test: Form validation shows error messages for invalid inputs
    - Test: Tech array input accepts multiple technologies
    - Test: Form handles submission errors gracefully
  - [x] 5.2 Create ProjectForm component
    - Create `src/components/admin/ProjectForm.tsx`
    - Use React Hook Form for form management
    - Create Zod schema: `projectFormSchema` with all fields
    - Form fields: title (required), description (required), tech (array, required, min 1), category (select, required), thumbnail (file upload or URL), client_name (optional), project_url (optional), github_url (optional), completion_date (date picker, optional), featured (checkbox), status (select: draft/published)
    - Display inline error messages for validation
    - Show loading state during submission
    - Handle form submission with React Query mutation
  - [x] 5.3 Implement tech stack array input
    - Create tech stack input component (tag-based or comma-separated)
    - Allow adding/removing individual tech items
    - Validate that at least one tech is provided
    - Display tech items as badges or chips
    - Use shadcn/ui Badge or custom component
  - [x] 5.4 Implement category select dropdown
    - Create category select with options: Web, Mobile, Full-Stack, Design
    - Use shadcn/ui Select component
    - Match existing categories from PortfolioPage
    - Validate that category is one of the allowed values
  - [x] 5.5 Implement image upload component
    - Create `ImageUpload` component or use existing pattern
    - If Supabase Storage available: allow file upload using `uploadProjectThumbnail()` from Task Group 3
    - If Storage not available: allow URL input only
    - Display image preview after upload/URL entry
    - Validate file type (images only) and size (max 5MB suggested)
    - Show upload progress indicator
    - Handle upload errors gracefully
  - [x] 5.6 Create CreateProjectPage component
    - Create `src/pages/admin/CreateProjectPage.tsx`
    - Use ProjectForm component
    - Handle form submission: call `createProject()` function
    - Navigate to project list after successful creation
    - Show success toast notification
    - Handle errors with error toast
  - [x] 5.7 Create EditProjectPage component
    - Create `src/pages/admin/EditProjectPage.tsx`
    - Fetch project by ID using `getProjectById()` from route params
    - Pre-populate ProjectForm with existing project data
    - Handle form submission: call `updateProject()` function
    - Navigate to project list after successful update
    - Show success toast notification
    - Handle errors with error toast
  - [x] 5.8 Add form validation
    - Title: required, min 3 characters, max 200 characters
    - Description: required, min 10 characters, max 2000 characters
    - Tech: required array, at least 1 item, each item min 2 characters
    - Category: required, must be one of: Web, Mobile, Full-Stack, Design
    - URLs (project_url, github_url): optional, must be valid URL format if provided
    - Completion date: optional, must be valid date if provided
    - Use Zod schema for all validation
  - [x] 5.9 Ensure project form tests pass
    - Run ONLY the 6-8 tests written in 5.1
    - Verify form validation works correctly
    - Verify create and edit operations work
    - Verify image upload works (if Storage available)
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 5.1 pass
- Create project form validates and submits correctly
- Edit project form pre-populates and updates correctly
- Image upload works (if Storage available)
- Form validation shows appropriate error messages
- All form fields work as expected

---

### Frontend Public - Portfolio Display

#### Task Group 6: Enhanced PortfolioPage & ProjectCard
**Dependencies:** Task Groups 1, 2

- [x] 6.0 Complete enhanced portfolio page and project card
  - [x] 6.1 Write 6-8 focused tests for portfolio page
    - Test: PortfolioPage displays both hardcoded and database projects
    - Test: Category filtering works correctly (All, Web, Mobile, Full-Stack, Design)
    - Test: Tech stack filtering filters projects by selected technologies
    - Test: Search functionality filters projects by title/description
    - Test: Sorting options work (newest, alphabetical, featured)
    - Test: Pagination displays correct number of projects per page
    - Test: Only published projects are displayed on public page
    - Test: PortfolioPage handles loading and error states
  - [x] 6.2 Enhance PortfolioPage component
    - Modify `src/pages/PortfolioPage.tsx`
    - Keep existing hardcoded projects array (do not remove)
    - Fetch published projects using `getPublishedProjects()` from Task Group 2
    - Merge hardcoded and database projects for display
    - Use React Query for data fetching with loading and error states
    - Maintain existing category filtering functionality
  - [x] 6.3 Add tech stack filtering
    - Create tech stack filter component (multi-select or tag-based)
    - Extract unique tech values from all projects (hardcoded + database)
    - Allow selecting multiple technologies
    - Filter projects that contain any of the selected technologies
    - Display selected tech filters as removable badges
    - Use shadcn/ui components or custom implementation
  - [x] 6.4 Add search functionality
    - Add search input field above project grid
    - Filter projects by title or description text (case-insensitive)
    - Update project display in real-time as user types
    - Show "No projects found" message when search returns no results
    - Use shadcn/ui Input component with Search icon
  - [x] 6.5 Add sorting options
    - Create sorting dropdown with options: Newest First (default), Alphabetical (A-Z), Featured First
    - Implement sorting logic for each option
    - Newest: sort by `created_at DESC`
    - Alphabetical: sort by `title ASC`
    - Featured: sort by `featured DESC, created_at DESC`
    - Update project display when sorting changes
    - Use shadcn/ui Select component
  - [x] 6.6 Implement pagination
    - Add pagination component below project grid
    - Display 12-18 projects per page (configurable)
    - Show page numbers and navigation (Previous/Next buttons)
    - Calculate total pages based on filtered project count
    - Maintain filter/search/sort state across page changes
    - Use shadcn/ui Pagination component or custom implementation
  - [x] 6.7 Enhance ProjectCard component
    - Update `src/components/ProjectCard.tsx`
    - Support both hardcoded project format and database project format
    - Add support for optional fields: `client_name`, `project_url`, `github_url`, `completion_date`
    - Display featured badge/indicator when `featured = true` (use shadcn/ui Badge)
    - Ensure thumbnail display works with Supabase Storage URLs
    - Maintain existing styling and hover effects
    - Add links to project_url and github_url if provided
  - [x] 6.8 Ensure portfolio page tests pass
    - Run ONLY the 6-8 tests written in 6.1
    - Verify both hardcoded and database projects display
    - Verify all filtering, search, and sorting work
    - Verify pagination works correctly
    - Verify only published projects are shown
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 6.1 pass
- PortfolioPage displays both hardcoded and database projects
- All filtering, search, and sorting functionality works
- Pagination displays correct number of projects
- Only published projects are displayed publicly
- ProjectCard component supports all database fields

---

### Routing

#### Task Group 7: Route Configuration
**Dependencies:** Task Groups 4, 5

- [x] 7.0 Complete route configuration
  - [x] 7.1 Write 3-4 focused tests for routes
    - Test: `/admin/projects` route is protected and requires admin role
    - Test: `/admin/projects/new` route navigates to create form
    - Test: `/admin/projects/:id/edit` route navigates to edit form
    - Test: Non-admin users are redirected when accessing admin project routes
  - [x] 7.2 Add admin project routes
    - Update `src/routes.tsx`
    - Add route: `/admin/projects` (ProjectList page) - nested under AdminLayout
    - Add route: `/admin/projects/new` (CreateProjectPage) - nested under AdminLayout
    - Add route: `/admin/projects/:id/edit` (EditProjectPage) - nested under AdminLayout
    - Wrap all routes with `ProtectedRoute` component using `requiredRole="admin"`
    - Follow existing admin route pattern from `/admin/users`
  - [x] 7.3 Ensure route protection works
    - Verify ProtectedRoute redirects non-admin users to `/login`
    - Verify admin users can access all project routes
    - Test route navigation from project list to create/edit pages
    - Handle loading states during auth verification
  - [x] 7.4 Ensure route tests pass
    - Run ONLY the 3-4 tests written in 7.1
    - Verify all routes are protected correctly
    - Verify navigation works between pages
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 7.1 pass
- All admin project routes are protected with admin role requirement
- Route navigation works correctly
- Non-admin users are redirected appropriately

---

### Testing

#### Task Group 8: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-7

- [x] 8.0 Review existing tests and fill critical gaps only
  - [x] 8.1 Review tests from Task Groups 1-7
    - Review the 4-6 tests written by database-engineer (Task 1.1)
    - Review the 6-8 tests written by database-engineer (Task 2.1)
    - Review the 3-4 tests written by storage-engineer (Task 3.1)
    - Review the 5-6 tests written by frontend-engineer (Task 4.1)
    - Review the 6-8 tests written by frontend-engineer (Task 5.1)
    - Review the 6-8 tests written by frontend-engineer (Task 6.1)
    - Review the 3-4 tests written by frontend-engineer (Task 7.1)
    - Total existing tests: approximately 34-44 tests
  - [x] 8.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Examples: Full admin workflow (create → edit → delete), Public portfolio filtering workflow
  - [x] 8.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [x] 8.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, and 8.3)
    - Expected total: approximately 44-54 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 44-54 tests total)
- Critical user workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

---

## Execution Order

Recommended implementation sequence:
1. Database Layer (Task Group 1) - Schema and migration
2. Storage Setup (Task Group 3) - Can run in parallel with Task Group 1
3. Database Functions (Task Group 2) - Depends on Task Group 1
4. Frontend Admin - Project List (Task Group 4) - Depends on Task Groups 1, 2, 3
5. Frontend Admin - Project Forms (Task Group 5) - Depends on Task Groups 1, 2, 3, 4
6. Frontend Public - Portfolio (Task Group 6) - Depends on Task Groups 1, 2
7. Routing (Task Group 7) - Depends on Task Groups 4, 5
8. Test Review & Gap Analysis (Task Group 8) - Depends on all previous groups

