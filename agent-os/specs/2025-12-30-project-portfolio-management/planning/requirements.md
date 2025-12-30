# Spec Requirements: Project & Portfolio Management

## Initial Description

Project schema + CRUD in admin + public display with filters.

## Requirements Discussion

### First Round Questions

**Q1:** Project Schema Fields: I'm assuming the project schema should include: `title`, `description`, `tech` (array of technologies), `category`, `thumbnail` (image URL), `created_at`, `updated_at`, and potentially `featured` (boolean) and `status` (draft/published). Should we also include fields like `client_name`, `project_url`, `github_url`, `completion_date`, or any other specific fields you need?

**Answer:** Yes to all suggested fields (title, description, tech, category, thumbnail, created_at, updated_at, featured, status, client_name, project_url, github_url, completion_date)

**Q2:** Admin CRUD Interface: I'm assuming the admin project management should be accessible at `/admin/projects` (following the admin dashboard pattern from Phase 3), with a list view showing all projects in a table, and create/edit forms for managing projects. Should we also include bulk operations (bulk delete, bulk status change) or keep it to individual CRUD operations only?

**Answer:** Include bulk delete. Also mentioned admin dashboard access issue (user is signed in as admin but can't see admin dashboard - this is a separate issue outside this spec scope)

**Q3:** Public Display Integration: I see you already have a `PortfolioPage` component with hardcoded projects and category filtering. Should this phase replace the hardcoded data with database-driven projects, or should we create a separate `/projects` route? Should the existing `ProjectCard` component be reused, or do we need a different design?

**Answer:** Don't remove hardcoded projects, but also show new database projects. The ProjectCard component is fine, it just needs to be enhanced.

**Q4:** Filtering & Search: For the public display, I'm assuming we need category filtering (like the existing "All", "Web", "Mobile", "Full-Stack", "Design" categories) and potentially tech stack filtering. Should we also add search functionality (by title/description), sorting options (newest first, alphabetical, featured first), or pagination for large project lists?

**Answer:** Yes to all (category filtering, tech stack filtering, search by title/description, sorting options, pagination)

**Q5:** Image/Media Handling: For project thumbnails and potentially multiple images per project, should we use Supabase Storage for image uploads, or are you planning to use external URLs? Should admins be able to upload images directly in the admin interface, or will they provide URLs?

**Answer:** Supabase Storage if available on free plan. Admins can upload images directly in the admin interface.

**Q6:** Project Status & Visibility: Should projects have a status field (e.g., "draft", "published") so admins can create projects without immediately showing them publicly? Should there be a "featured" flag to highlight certain projects on the homepage or portfolio page?

**Answer:** Yes to all (status field with draft/published, featured flag)

**Q7:** Relationship to Client Projects: I notice Phase 5 will build the "Client Project Tracking System" with phases and tasks. Should the projects in this phase be separate from client projects (portfolio showcase vs. active client work), or should they be related? Should we leave room in the schema for linking to client projects later?

**Answer:** They are related, so leave room in the schema for linking to client projects later.

**Q8:** Out of Scope: For this foundation phase, I'm assuming we're NOT building: project detail pages with full descriptions, project phases/tasks (Phase 5), client assignment to projects (Phase 6), or project analytics. Is there anything else we should explicitly exclude from this phase?

**Answer:** (No explicit answer provided, but based on roadmap, these assumptions are correct)

### Existing Code to Reference

**Similar Features Identified:**
- **PortfolioPage Component** - Path: `src/pages/PortfolioPage.tsx`
  - Existing hardcoded projects array with category filtering
  - Uses ProjectCard component for display
  - Category filter buttons (All, Web, Mobile, Full-Stack, Design)
  - Grid layout for project display

- **ProjectCard Component** - Path: `src/components/ProjectCard.tsx`
  - Reusable card component for displaying projects
  - Supports: title, description, thumbnail, tech array, category, href
  - Uses shadcn/ui Card components
  - Needs enhancement to support database projects

- **AdminLayout Component** - Path: `src/layouts/AdminLayout.tsx`
  - Top navigation bar pattern for admin pages
  - Already has placeholder "Projects" link in navigation (disabled)
  - Mobile-responsive design pattern to follow

- **Admin Dashboard Pattern** - Path: `src/pages/admin/UserList.tsx` (referenced from admin dashboard spec)
  - Table-based list view pattern for admin CRUD
  - Can be used as reference for project list implementation

- **Route Structure** - Path: `src/routes.tsx`
  - Admin routes pattern under `/admin/*`
  - ProtectedRoute usage with `requiredRole="admin"`

**Note:** The codebase has:
- Existing hardcoded projects in PortfolioPage that should remain
- ProjectCard component that needs enhancement
- Admin dashboard foundation with navigation structure
- Supabase database setup (users table exists, projects table needs to be created)

### Follow-up Questions

None required - all requirements are clear.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - No visual assets to analyze.

## Requirements Summary

### Functional Requirements

- **Project Database Schema:**
  - Fields: `id` (UUID), `title` (text), `description` (text), `tech` (array/text[]), `category` (text/enum), `thumbnail` (text/URL), `client_name` (text, optional), `project_url` (text, optional), `github_url` (text, optional), `completion_date` (date, optional), `featured` (boolean), `status` (enum: 'draft' | 'published'), `created_at` (timestamptz), `updated_at` (timestamptz)
  - Leave room in schema for linking to client projects (Phase 5 relationship)
  - Use Supabase PostgreSQL with RLS policies

- **Admin CRUD Interface:**
  - Location: `/admin/projects` route
  - List view: Table showing all projects with columns (title, category, status, featured, created date)
  - Create/Edit forms: Full form for all project fields
  - Bulk operations: Bulk delete functionality
  - Image upload: Direct upload to Supabase Storage (if available on free plan) via admin interface
  - Use existing AdminLayout pattern and shadcn/ui components

- **Public Display:**
  - Enhance existing `PortfolioPage` to show both hardcoded projects AND database projects
  - Keep existing hardcoded projects intact
  - Enhance `ProjectCard` component to support database project data
  - Maintain existing category filtering (All, Web, Mobile, Full-Stack, Design)
  - Add tech stack filtering
  - Add search functionality (by title/description)
  - Add sorting options (newest first, alphabetical, featured first)
  - Add pagination for large project lists
  - Only show projects with `status = 'published'` on public pages

- **Project Status & Visibility:**
  - Status field: 'draft' (admin-only) or 'published' (public)
  - Featured flag: Boolean to highlight projects on homepage/portfolio
  - Admins can toggle status and featured flag

### Reusability Opportunities

- **Components to reuse:**
  - `ProjectCard` component - enhance to support database projects
  - `PortfolioPage` - modify to fetch and display database projects alongside hardcoded ones
  - `AdminLayout` - already has Projects placeholder link, enable it
  - shadcn/ui components (Table, Card, Button, Input, Form, etc.)

- **Backend patterns to investigate:**
  - Admin dashboard list view pattern from `UserList.tsx`
  - Supabase Storage API for image uploads
  - Existing Supabase query patterns from `src/lib/db/users.ts`
  - RLS policy patterns from users table migration

- **Similar features to model after:**
  - Admin user management CRUD pattern (from Phase 3)
  - Route protection pattern from admin routes
  - Form validation patterns (React Hook Form + Zod)

### Scope Boundaries

**In Scope:**
- Project database schema creation with all specified fields
- Admin CRUD interface at `/admin/projects` with list, create, edit, delete, bulk delete
- Image upload to Supabase Storage (if available on free plan)
- Enhanced PortfolioPage showing both hardcoded and database projects
- Enhanced ProjectCard component
- Category filtering (existing categories)
- Tech stack filtering
- Search functionality (title/description)
- Sorting options (newest, alphabetical, featured)
- Pagination for project lists
- Status management (draft/published)
- Featured flag functionality
- Schema design that allows future linking to client projects (Phase 5)

**Out of Scope:**
- Project detail pages with full descriptions (future enhancement)
- Project phases/tasks (Phase 5: Client Project Tracking System)
- Client assignment to projects (Phase 6: Client Dashboard Experience)
- Project analytics or reporting
- Project comments or reviews
- Multiple images per project (only thumbnail for now)
- Project versioning or history
- Project templates or cloning

### Technical Considerations

- **Integration points:**
  - Supabase Storage API for image uploads (verify free plan availability)
  - Supabase PostgreSQL for project data
  - Existing admin dashboard navigation (enable Projects link)
  - Existing PortfolioPage component (enhance, don't replace)
  - Existing ProjectCard component (enhance to support database data)

- **Existing system constraints:**
  - Must use existing `ProtectedRoute` component pattern for admin routes
  - Must respect existing role system ('admin' | 'client')
  - Must work with existing Supabase authentication
  - Must follow existing tech stack (React, Tailwind, shadcn/ui, TypeScript)
  - Must maintain existing hardcoded projects in PortfolioPage
  - Must use existing category system (All, Web, Mobile, Full-Stack, Design)

- **Technology preferences stated:**
  - React (latest)
  - Tailwind CSS v3
  - shadcn/ui components
  - TypeScript
  - React Router for routing
  - React Hook Form + Zod for forms
  - Supabase (PostgreSQL + Storage if available)
  - Bun package manager

- **Similar code patterns to follow:**
  - Admin list view pattern from UserList component
  - Database function patterns from `src/lib/db/users.ts`
  - Form patterns from admin user management
  - Route structure pattern from `src/routes.tsx`
  - RLS policy patterns from users table migration

- **Schema design considerations:**
  - Use UUID for primary key (consistent with users table)
  - Include `created_at` and `updated_at` timestamps (standard pattern)
  - Use enum for status field ('draft' | 'published')
  - Use text array or JSONB for tech stack (PostgreSQL array type)
  - Consider foreign key relationship placeholder for client projects (Phase 5)
  - Index columns used in filtering (category, status, featured, created_at)

- **Supabase Storage considerations:**
  - Verify free plan includes Storage
  - Set up bucket for project thumbnails
  - Configure RLS policies for storage bucket
  - Implement image upload component in admin interface
  - Handle image optimization/resizing if needed

