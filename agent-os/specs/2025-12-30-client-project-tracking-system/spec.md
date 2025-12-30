# Specification: Client Project Tracking System

## Goal

Create a transparent project tracking system where clients can view real-time project progress via unique tracking codes, including phases with dates, tasks with completion percentages, developer notes, file attachments, and email notifications on milestone completion.

## User Stories

- As a client, I want to enter a tracking code and see my project's progress including phases, tasks, and notes so that I have visibility into how my project is progressing without needing to log in.
- As an admin, I want to manage project phases and tasks with drag-and-drop reordering, attach files, and add notes so that I can keep clients informed of progress.
- As a client, I want to receive email notifications when project phases are completed so that I stay informed without constantly checking the tracking page.

## Specific Requirements

**Database Schema - Tracking Codes**
- Create `tracking_codes` table with fields: `id` (UUID), `project_id` (FK to projects), `code` (unique alphanumeric string, e.g., "TC-A7K3X2"), `is_active` (boolean), `created_at`, `updated_at`
- Auto-generate tracking code when project is created using a trigger function
- Support code regeneration by admin (deactivates old code, creates new one)
- Enable RLS: public can SELECT active codes, admins can manage all codes
- Create unique index on `code` column for fast lookups

**Database Schema - Project Phases**
- Create `project_phases` table with fields: `id` (UUID), `project_id` (FK to projects), `name` (text), `description` (text), `sort_order` (integer for drag-drop ordering), `estimated_start_date` (date), `estimated_end_date` (date), `actual_start_date` (date nullable), `actual_end_date` (date nullable), `status` (enum: 'pending', 'in_progress', 'completed'), `created_at`, `updated_at`
- Add `notify_on_complete` boolean flag (default true) for email notifications
- Enable RLS: public can SELECT phases for projects with active tracking codes, admins can manage all
- Create index on `project_id` and `sort_order` for ordering queries

**Database Schema - Project Tasks**
- Create `project_tasks` table with fields: `id` (UUID), `phase_id` (FK to project_phases), `name` (text), `description` (text nullable), `sort_order` (integer), `completion_percentage` (integer 0-100, default 0), `developer_notes` (text nullable), `created_at`, `updated_at`
- Enable RLS matching project_phases access patterns
- Create composite index on `phase_id` and `sort_order`

**Database Schema - Attachments**
- Create `project_attachments` table with fields: `id` (UUID), `project_id` (FK), `phase_id` (FK nullable), `task_id` (FK nullable), `file_url` (text), `file_type` (enum: 'image', 'pdf', 'video_embed'), `file_name` (text), `created_at`
- Videos stored as embed URLs (YouTube, Vimeo), not file uploads
- Enable RLS: public can SELECT for projects with active tracking codes, admins can manage all

**Database Schema - Client Preferences**
- Create `client_notification_preferences` table with fields: `id` (UUID), `tracking_code_id` (FK), `email` (text), `opted_in` (boolean default true), `created_at`, `updated_at`
- Allow clients to opt-in/out of notifications without authentication
- Use unique constraint on tracking_code_id + email combination

**Tracking Code Generation**
- Generate codes in format: `TC-XXXXXX` where X is alphanumeric (uppercase letters + digits, excluding ambiguous chars like 0/O, 1/I/L)
- Create database function `generate_tracking_code()` that produces unique codes
- Create trigger on projects table to auto-generate tracking code on INSERT
- Create `regenerate_tracking_code(project_id)` function for admin use (deactivates old, creates new)

**Admin Phase & Task Management**
- Create admin page at `/admin/projects/:projectId/tracking` for managing phases and tasks
- Use @dnd-kit library for drag-and-drop reordering of phases and tasks
- Display phases as expandable cards containing their tasks
- Each phase card shows: name, status badge, date range, progress bar (calculated from task completion)
- Each task row shows: name, completion percentage slider/input, notes indicator, attachment count
- Implement inline editing for task completion percentage (slider or number input)
- Add buttons for: add phase, add task (within phase), edit phase/task, delete phase/task
- Regenerate tracking code button with confirmation dialog

**Admin File Attachments**
- Create file upload component supporting images (jpg, png, gif, webp) and PDFs only
- Maximum file size: 5MB per file
- Store files in Supabase Storage bucket `project-attachments`
- Allow attachments at phase level and task level
- Display attachment thumbnails/icons with delete option
- Video embeds: provide URL input field, auto-detect YouTube/Vimeo and store as video_embed type

**Public Tracking Page**
- Create public route `/track/:code` (no authentication required)
- Display project title and overall progress percentage
- Show timeline view of phases with visual status indicators (pending/in-progress/completed)
- Expand phases to show tasks with completion percentages
- Display developer notes per task (read-only)
- Show file attachments with preview for images, download link for PDFs
- Render embedded videos inline
- Display "Invalid or expired tracking code" for inactive/missing codes
- Include client email opt-in/out form for notifications

**Email Notifications**
- Create Supabase Edge Function for sending phase completion emails
- Trigger email when phase status changes to 'completed' AND phase.notify_on_complete is true
- Email content: project name, completed phase name, link to tracking page, remaining phases summary
- Only send to opted-in clients for that tracking code
- Use Resend or similar email service (configure via environment variables)
- Admin toggle per project to enable/disable all notifications

**API Layer**
- Create `src/lib/db/tracking.ts` with functions: `getProjectByTrackingCode(code)`, `getPhasesByProjectId(projectId)`, `getTasksByPhaseId(phaseId)`, `getAttachmentsByProjectId(projectId)`
- Create `src/lib/db/phases.ts` with CRUD functions for phases including `updatePhaseOrder(projectId, orderedIds)`
- Create `src/lib/db/tasks.ts` with CRUD functions for tasks including `updateTaskOrder(phaseId, orderedIds)`, `updateTaskCompletion(taskId, percentage)`
- Create `src/lib/db/attachments.ts` for attachment CRUD and storage operations
- All public functions should verify tracking code is active before returning data

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**Projects Database Pattern (`src/lib/db/projects.ts`)**
- Follow same TypeScript interface pattern for Phase, Task, TrackingCode, Attachment types
- Replicate Supabase query patterns, error handling, and null checking
- Use same CRUD function naming conventions (getAll, getById, create, update, delete)

**Storage Functions (`src/lib/storage.ts`)**
- Extend existing `validateImageFile` and `uploadProjectThumbnail` patterns for attachment uploads
- Add PDF validation alongside image validation
- Replicate bucket configuration and RLS policy patterns for new `project-attachments` bucket

**Admin List Pages (`src/pages/admin/ProjectList.tsx`, `src/pages/admin/UserList.tsx`)**
- Follow same component structure: React Query hooks, mutation patterns, toast notifications
- Use same shadcn/ui Table, Card, Input, Button component patterns
- Replicate search, loading states, and error handling patterns

**Migration Pattern (`supabase/migrations/20251230090133_create_projects_table.sql`)**
- Follow same structure for enum types, table creation, indexes, RLS policies
- Reuse `update_updated_at_column()` trigger function
- Follow FK constraint naming conventions

**Admin Layout (`src/layouts/AdminLayout.tsx`)**
- Add "Tracking" sub-navigation item under project context
- Follow existing responsive navigation patterns

## Out of Scope

- Client login/authentication for tracking (tracking code provides unauthenticated access)
- Client comments or feedback on tracking page (read-only for clients)
- Payment milestones tied to phases
- Video file uploads (videos are embedded links only)
- Real-time live updates via WebSocket (use manual refresh or polling)
- Bulk operations for phases/tasks
- Phase/task templates or cloning
- Time tracking or hour logging
- Multiple tracking codes per project (one active code at a time)
- Blog post management (separate spec)
- "Remember me" password feature (separate spec)
- Login modal branding enhancements (separate spec)


