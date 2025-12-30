# Specification: Project & Portfolio Management

## Goal

Create a comprehensive project management system with database schema, admin CRUD interface for managing projects, and enhanced public portfolio display that shows both hardcoded and database-driven projects with advanced filtering, search, and sorting capabilities.

## User Stories

- As an admin, I want to create, edit, and manage portfolio projects with images, descriptions, and metadata so that I can showcase my work effectively.
- As a visitor, I want to browse and filter projects by category, technology, and search terms so that I can find relevant examples of work.
- As an admin, I want to control project visibility with draft/published status and featured flags so that I can curate what appears publicly.

## Specific Requirements

**Project Database Schema**
- Create `projects` table in Supabase PostgreSQL with fields: `id` (UUID), `title` (text), `description` (text), `tech` (text array), `category` (text/enum), `thumbnail` (text URL), `client_name` (text optional), `project_url` (text optional), `github_url` (text optional), `completion_date` (date optional), `featured` (boolean), `status` (enum: 'draft' | 'published'), `created_at` (timestamptz), `updated_at` (timestamptz)
- Include placeholder field or comment for future foreign key relationship to client projects (Phase 5)
- Create indexes on `category`, `status`, `featured`, and `created_at` columns for filtering performance
- Enable Row Level Security (RLS) with policies: public can SELECT published projects, admins can SELECT/INSERT/UPDATE/DELETE all projects
- Create migration file following existing pattern (`supabase/migrations/YYYYMMDDHHMMSS_create_projects_table.sql`)
- Use `update_updated_at_column()` trigger function pattern from users table for automatic timestamp updates

**Admin Project List Page**
- Create project list page at `/admin/projects` route using existing AdminLayout
- Display all projects in table format with columns: title, category, status, featured, created date
- Use shadcn/ui Table component matching UserList page pattern
- Add search functionality to filter projects by title or description
- Implement bulk delete functionality with checkbox selection and confirmation dialog
- Add "Create Project" button linking to create form
- Display loading states and error handling using React Query patterns
- Enable the "Projects" navigation link in AdminLayout (currently disabled placeholder)

**Admin Project Create/Edit Forms**
- Create project form component with all schema fields using React Hook Form + Zod validation
- Include image upload component for thumbnail using Supabase Storage (if available on free plan)
- Form fields: title (required), description (required), tech (array input), category (select dropdown), thumbnail (file upload or URL), client_name (optional), project_url (optional), github_url (optional), completion_date (optional date picker), featured (checkbox), status (select: draft/published)
- Use shadcn/ui Form, Input, Select, Checkbox, and DatePicker components
- Display success/error feedback using Toast notifications
- Edit form should pre-populate with existing project data
- Form validation: title and description required, tech array must have at least one item, category must be valid enum value

**Database Functions for Projects**
- Create `src/lib/db/projects.ts` following pattern from `src/lib/db/users.ts`
- Functions: `getAllProjects()`, `getPublishedProjects()`, `getProjectById(id)`, `createProject(data)`, `updateProject(id, data)`, `deleteProject(id)`, `bulkDeleteProjects(ids)`
- Use Supabase client with proper TypeScript interfaces matching schema
- Implement error handling consistent with existing database functions
- Export `Project` interface type for use across application

**Supabase Storage Setup**
- Verify Supabase Storage availability on free plan
- Create storage bucket named `project-thumbnails` if Storage is available
- Configure RLS policies for bucket: public can read, admins can upload/delete
- Create helper function for image upload in `src/lib/storage.ts` or similar
- Handle image optimization/resizing if needed (optional enhancement)

**Enhanced PortfolioPage Component**
- Modify `src/pages/PortfolioPage.tsx` to fetch and display database projects alongside existing hardcoded projects
- Maintain existing hardcoded projects array (do not remove)
- Fetch published projects from database using `getPublishedProjects()` function
- Merge hardcoded and database projects for display
- Maintain existing category filtering (All, Web, Mobile, Full-Stack, Design)
- Add tech stack filtering with multi-select or tag-based interface
- Add search input field to filter by title/description text
- Add sorting dropdown: newest first (default), alphabetical (A-Z), featured first
- Implement pagination for project lists (suggest 12-18 projects per page)
- Only display projects with `status = 'published'` on public pages
- Use React Query for data fetching with loading and error states

**Enhanced ProjectCard Component**
- Update `src/components/ProjectCard.tsx` to support database project data structure
- Ensure component works with both hardcoded project format and database project format
- Add support for optional fields: `client_name`, `project_url`, `github_url`, `completion_date`
- Display featured badge/indicator when `featured = true`
- Maintain existing styling and hover effects
- Ensure thumbnail display works with Supabase Storage URLs

**Route Configuration**
- Add `/admin/projects` route to `src/routes.tsx` following existing admin route pattern
- Wrap route with `ProtectedRoute` component using `requiredRole="admin"`
- Use nested route structure within AdminLayout using `<Outlet>` pattern
- Ensure route protection redirects non-admin users appropriately

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**PortfolioPage Component (`src/pages/PortfolioPage.tsx`)**
- Existing hardcoded projects array with category filtering that must be preserved
- Category filter button implementation using shadcn/ui Button components
- Grid layout pattern for project display using CSS Grid
- Hero component usage for page header

**ProjectCard Component (`src/components/ProjectCard.tsx`)**
- Reusable card component with existing styling and hover effects
- Supports title, description, thumbnail, tech array, category, and href props
- Uses shadcn/ui Card, Badge components with dark theme styling
- Needs enhancement to support additional database fields (client_name, project_url, github_url, completion_date, featured)

**AdminLayout Component (`src/layouts/AdminLayout.tsx`)**
- Top navigation bar pattern with mobile-responsive design
- Already includes "Projects" placeholder link in navigation (currently disabled)
- Navigation structure and styling patterns to follow for consistency
- Mobile menu implementation using DropdownMenu component

**UserList Page Pattern (`src/pages/admin/UserList.tsx`)**
- Table-based list view with search, filtering, and action dropdowns
- React Query usage for data fetching and mutations
- Loading states with Skeleton components
- Error handling and Toast notifications
- Modal/dialog patterns for edit, view, delete, and role change operations
- Bulk operations pattern can be referenced for bulk delete implementation

**Database Functions Pattern (`src/lib/db/users.ts`)**
- Supabase client usage and query patterns
- TypeScript interface definitions for data models
- Error handling and null checking patterns
- Function naming conventions and structure
- React Query integration patterns

**Migration Pattern (`supabase/migrations/20251229000001_create_users_table.sql`)**
- Enum type creation for status field (similar to user_role enum)
- Table creation with UUID primary keys and timestamps
- Index creation on frequently queried columns
- RLS policy structure and admin access patterns
- Trigger function for automatic updated_at timestamp updates

## Out of Scope

- Project detail pages with full descriptions and expanded content (future enhancement)
- Project phases and tasks management (Phase 5: Client Project Tracking System)
- Client assignment to projects and client-specific project views (Phase 6: Client Dashboard Experience)
- Project analytics, reporting, or usage statistics
- Project comments, reviews, or user feedback features
- Multiple images per project (only single thumbnail supported in this phase)
- Project versioning, history, or change tracking
- Project templates or cloning functionality
- Project categories beyond existing set (Web, Mobile, Full-Stack, Design)
- Advanced image editing or manipulation features
- Project import/export functionality
- Project scheduling or timeline features

