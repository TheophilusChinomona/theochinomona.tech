# Specification: Unified Project Management Workflow

## Goal

Consolidate "My Projects" and "My Requests" into a unified project management system with consistent status tracking across admin and client dashboards. Enable clients to create projects directly with automatic status transitions, implement admin-client communication via comment threads, provide project templates and cloning functionality for efficient project creation, and provide deletion capabilities for both clients and admins with appropriate restrictions.

## User Stories

- As a client, I want to create projects directly from "My Projects" with a checkbox indicating if I'm hiring you or suggesting a project so that you can prioritize accordingly.
- As a client, I want to see all my projects (both pending and active) in one unified view with status filtering so that I don't need to navigate between separate pages.
- As a client, I want to reply to admin requests for more details with text and file uploads so that I can provide the information needed to move my project forward.
- As a client, I want to delete projects I created (before work begins) so that I can cancel projects that are no longer needed.
- As an admin, I want to see all client-created projects with consistent statuses across my dashboard so that I can manage projects efficiently.
- As an admin, I want to request more details from clients via comment threads so that I can gather necessary information before starting work.
- As an admin, I want automatic status changes when I create invoices or request information so that the workflow is streamlined.
- As an admin, I want to delete projects and invoices when needed so that I can manage the database effectively.
- As a client, I want to save my project creation as a template so that I can quickly create similar projects in the future.
- As a client, I want to clone an existing project (that I created) so that I can create a new project based on a previous one without re-entering all the details.

## Specific Requirements

**Database Schema - Project Status Enum Replacement**
- Replace existing `project_status` enum with new unified values: `pending`, `pending_payment`, `pending_info`, `in_progress`, `in_testing`, `completed`
- Drop old enum values: `draft`, `published`, `pending_approval`, `awaiting_payment`, `approved`, `denied`
- Create migration to:
  1. Create new enum type `project_status_new` with new values
  2. Add temporary column `status_new` to projects table
  3. Map old statuses to new: `pending_approval` → `pending`, `awaiting_payment` → `pending_payment`, `approved` → `in_progress`, `published` → `completed` (if applicable), `draft` → `pending`
  4. Update all rows
  5. Drop old column, rename new column to `status`
  6. Drop old enum type
- Update all existing RLS policies and queries to use new status values
- Add comment to enum: `'Unified project status: pending, pending_payment, pending_info, in_progress, in_testing, completed'`

**Database Schema - Projects Table Updates**
- Add `is_hiring_request` boolean field (default false): indicates if client is hiring vs suggesting project (affects admin prioritization)
- Add `deleted_at` timestamptz field (nullable): for soft-delete functionality
- Ensure `created_by` field exists (UUID, FK to users, nullable): tracks who created the project
- Create index on `deleted_at` for filtering out soft-deleted projects
- Create index on `is_hiring_request` for admin prioritization queries
- Update RLS policies:
  - Clients can SELECT projects where `client_id` OR `created_by` matches their user_id AND `deleted_at IS NULL`
  - Clients can UPDATE projects where `created_by` matches their user_id AND status is pending (pending, pending_payment, pending_info)
  - Clients can soft-delete (UPDATE deleted_at) projects where `created_by` matches their user_id AND status IN ('pending', 'pending_payment', 'pending_info')
  - Admins can manage all projects (hard-delete by setting deleted_at or DELETE from database)

**Database Schema - Project Comments/Threads**
- Create `project_comments` table with fields: `id` (UUID), `project_id` (FK to projects, ON DELETE CASCADE), `user_id` (FK to users - comment author), `parent_comment_id` (FK to project_comments, nullable - for threaded replies), `content` (text), `created_at`, `updated_at`
- Create `project_comment_attachments` table with fields: `id` (UUID), `comment_id` (FK to project_comments, ON DELETE CASCADE), `file_url` (text), `file_name` (text), `file_type` (enum: 'pdf', 'image'), `file_size` (bigint - bytes), `created_at`
- Enable RLS: clients can SELECT/INSERT comments for projects where they are `client_id` OR `created_by`, admins can manage all comments
- Create indexes on `project_comments.project_id`, `project_comments.parent_comment_id`, `project_comment_attachments.comment_id`
- Add trigger for `updated_at` using existing `update_updated_at_column()` function

**Database Schema - Status Change Automation**
- Create `project_status_history` table (optional, for audit trail): `id` (UUID), `project_id` (FK), `old_status` (text), `new_status` (text), `changed_by` (FK to users), `reason` (text nullable), `created_at`
- Create database trigger `auto_update_project_status_on_invoice`:
  - Fires AFTER INSERT on `invoices` table
  - When `project_id` is not null, automatically updates project status to `pending_payment`
- Create database trigger `auto_update_project_status_on_comment`:
  - Fires AFTER INSERT on `project_comments` table
  - When comment is from admin (role = 'admin') AND project status is NOT `pending_info`, update status to `pending_info`
  - When comment is from client AND project status is `pending_info`, update status to `pending`
- Alternative: Implement status change logic in application layer (Supabase Edge Functions or Express endpoints) if triggers are not preferred

**Database Schema - Project Requests Migration**
- Create migration script to migrate `project_requests` table data to `projects` table:
  1. For each `project_request` record:
     - Create new `project` record with: title, description, category, tech (from category), client_id, created_by = client_id, status = mapped from request_status
     - Map `request_status`: 'pending' → 'pending', 'approved' → 'in_progress', 'denied' → 'completed' (or create separate 'denied' status), 'needs_info' → 'pending_info'
     - Set `is_hiring_request` = false (default, can be updated manually if needed)
     - Copy `budget_range`, `timeline`, `special_requirements` to project notes or new fields
     - Link `project_request_attachments` to new project via `project_attachments` table
     - Preserve `admin_notes` and `denial_reason` in project notes or activity log
  2. Update any foreign key references from `project_requests.project_id` to new project IDs
  3. Archive `project_requests` table (rename to `project_requests_archived`) or drop after verification
  4. Drop `project_request_attachments` table or migrate to `project_attachments`

**Unified My Projects Page - Client Side**
- Update `src/pages/client/MyProjectsPage.tsx` to show projects in separate sections:
  - Section 1: "Active Projects" - projects with status `in_progress`, `in_testing`, `completed`
  - Section 2: "Pending Projects" - projects with status `pending`, `pending_payment`, `pending_info`
- Add "Create Project" button at top of page (links to `/dashboard/projects/new`)
- Implement grouped status filter dropdown:
  - Options: "All", "Pending" (filters: pending, pending_payment, pending_info), "Active" (filters: in_progress, in_testing), "Completed" (filters: completed)
  - Filter applies to both sections or shows relevant section based on filter
- Display projects using existing `ClientProjectCard` component
- Show status badges with appropriate colors:
  - `pending`: Yellow/amber badge
  - `pending_payment`: Orange badge
  - `pending_info`: Blue badge
  - `in_progress`: Indigo badge
  - `in_testing`: Purple badge
  - `completed`: Green badge
- Add delete button (trash icon) on project cards for client-created projects (created_by = user_id) with pending statuses only
- Show confirmation dialog before deletion: "Are you sure you want to cancel this project? This action cannot be undone."
- On delete: soft-delete (UPDATE deleted_at = NOW()) and show success toast

**Project Creation Form - Client Side**
- Update `src/pages/client/ClientCreateProjectPage.tsx` or create new form component
- Add checkbox field: "I'm hiring you for this project" (default unchecked = suggestion)
- Store checkbox value in `is_hiring_request` field
- Form fields: title (required), description (required), category (select), tech stack (array), budget range (optional), timeline (optional), special requirements (optional), file attachments (optional)
- Add "Save as Template" checkbox (optional): when checked, saves project details as template after creation
- On submit: create project with status = `pending`, created_by = current user_id, is_hiring_request = checkbox value
- If "Save as Template" is checked, create template record after project creation
- Display success toast and redirect to "My Projects" page
- Show validation errors inline using shadcn/ui Alert components

**Project Templates - Client Side**
- Create `project_templates` table with fields: `id` (UUID), `user_id` (FK to users), `name` (text - template name), `title` (text), `description` (text), `category` (text), `tech` (text[]), `budget_range` (text nullable), `timeline` (text nullable), `special_requirements` (text nullable), `is_hiring_request` (boolean, default false), `created_at`, `updated_at`
- Create `project_template_attachments` table with fields: `id` (UUID), `template_id` (FK to project_templates, ON DELETE CASCADE), `file_url` (text), `file_name` (text), `file_type` (enum: 'pdf', 'image'), `file_size` (bigint - bytes), `created_at`
- Enable RLS: users can SELECT/INSERT/UPDATE/DELETE their own templates, admins can view all templates
- Create indexes on `project_templates.user_id`, `project_template_attachments.template_id`
- Add "Use Template" button on project creation form: opens template selector dialog
- Template selector shows user's saved templates with name, category, and last used date
- When template selected: pre-fill form fields with template data (title, description, category, tech, budget_range, timeline, special_requirements, is_hiring_request)
- Allow user to edit pre-filled fields before submitting
- Template attachments are NOT copied to new project (user must re-upload if needed)
- Add "Save as Template" option after project creation: saves current project details as reusable template
- Create template management page (`/dashboard/projects/templates`) or add to settings:
  - List all user's templates
  - Edit template name and details
  - Delete templates
  - Use template to create new project

**Project Cloning - Client Side**
- Add "Clone Project" button to project cards in "My Projects" page (only for client-created projects)
- Check conditions before showing clone button:
  - `created_by` = current user_id
  - `deleted_at IS NULL`
  - Project exists (any status)
- Show confirmation dialog: "Create a new project based on this one? This will copy the project details but create a new project with 'Pending' status."
- On confirm: call `cloneProject(projectId, userId)` function:
  - Fetch original project details
  - Create new project with: same title + " (Copy)", same description, same category, same tech, same budget_range, same timeline, same special_requirements, same is_hiring_request
  - Set status = `pending`, created_by = current user_id
  - Do NOT copy: phases, tasks, comments, attachments, tracking codes, invoice links
  - Return new project ID
- Redirect to project creation form with pre-filled data (editable) OR directly create and redirect to new project detail page
- Show success toast: "Project cloned successfully"
- Log activity: 'project_cloned' with original_project_id and new_project_id

**Admin-Client Comment Thread System**
- Create `src/components/project/ProjectCommentThread.tsx` component:
  - Display threaded comments with author name, role badge, timestamp
  - Show file attachments as download links or image thumbnails
  - Reply button for clients (when status is `pending_info`)
  - Admin can always add comments
- Create `src/components/project/ProjectCommentForm.tsx` component:
  - Textarea for comment content (required)
  - File upload component (PDF and images, max 50MB per file)
  - Upload to Supabase Storage bucket `project-comment-attachments`
  - Store file metadata in `project_comment_attachments` table
  - Submit button disabled until content is provided
- Add comment thread section to:
  - Client project detail page (`/dashboard/projects/:id`)
  - Admin project detail/edit page (`/admin/projects/:id/edit` or `/admin/projects/:id`)
- When admin creates comment on project with status NOT `pending_info`: automatically change status to `pending_info`
- When client replies to comment (project status is `pending_info`): automatically change status to `pending`
- Send notifications: in-app and email when admin requests details (creates comment)

**Status Filtering - Both Dashboards**
- Update `src/pages/client/MyProjectsPage.tsx` filter dropdown to use grouped options
- Update `src/pages/admin/ProjectList.tsx` filter dropdown to use same grouped options:
  - "All" - shows all projects
  - "Pending" - shows projects with status: pending, pending_payment, pending_info
  - "Active" - shows projects with status: in_progress, in_testing
  - "Completed" - shows projects with status: completed
- Filter logic: map grouped option to individual status values in query
- Ensure consistent filter UI and behavior across both dashboards

**Automatic Status Changes**
- Invoice Creation → Status Change:
  - When admin creates invoice with `project_id` set, automatically update project status to `pending_payment`
  - Implement in `src/lib/db/invoices.ts` `createInvoice()` function or via database trigger
  - Log activity: 'project_status_changed' with old_status and new_status
- Admin Comment → Status Change:
  - When admin creates comment on project, check if status is NOT `pending_info`
  - If not `pending_info`, update status to `pending_info`
  - Implement in `src/lib/db/projectComments.ts` `createComment()` function
  - Send notification to client: "Admin requested more information"
- Client Reply → Status Change:
  - When client creates comment (reply) on project with status `pending_info`, update status to `pending`
  - Implement in `src/lib/db/projectComments.ts` `createComment()` function
  - Send notification to admin: "Client responded to information request"
- Admin Actions → Status Changes:
  - Admin marks project as "In Progress": update status to `in_progress`
  - Admin marks project as "Ready for Testing": update status to `in_testing`
  - Admin marks project as "Completed": update status to `completed`
  - Implement via admin UI buttons/actions in project detail page

**Deletion Functionality - Client Side**
- Add delete button to project cards in "My Projects" page (only for client-created projects with pending statuses)
- Check conditions before showing delete button:
  - `created_by` = current user_id
  - `status` IN ('pending', 'pending_payment', 'pending_info')
  - `deleted_at IS NULL`
- Show confirmation dialog: "Are you sure you want to cancel this project? This will remove it from your dashboard. You can contact admin to restore it if needed."
- On confirm: call `softDeleteProject(projectId)` function:
  - UPDATE projects SET deleted_at = NOW() WHERE id = projectId AND created_by = current_user_id AND status IN ('pending', 'pending_payment', 'pending_info')
- Show success toast: "Project cancelled successfully"
- Hide deleted projects from client view (filter WHERE deleted_at IS NULL)

**Deletion Functionality - Admin Side**
- Add delete button to admin project list and detail pages
- Show confirmation dialog: "Are you sure you want to permanently delete this project? This action cannot be undone and will delete all associated data (phases, tasks, comments, attachments)."
- On confirm: call `hardDeleteProject(projectId)` function:
  - DELETE FROM projects WHERE id = projectId (CASCADE will delete related records)
  - Or: DELETE FROM project_comments WHERE project_id = projectId
  - DELETE FROM project_attachments WHERE project_id = projectId
  - DELETE FROM project_phases WHERE project_id = projectId (CASCADE will delete tasks)
  - DELETE FROM projects WHERE id = projectId
- Show success toast: "Project permanently deleted"
- Add delete button to invoice detail page (`/admin/invoices/:id`)
- Invoice deletion: DELETE FROM invoices WHERE id = invoiceId (does NOT delete linked project)
- Show confirmation: "Are you sure you want to delete this invoice? The linked project will not be affected."

**Route Removal and Navigation Updates**
- Remove `/dashboard/requests` route from `src/routes.tsx`
- Remove "My Requests" navigation link from `src/layouts/ClientLayout.tsx`
- Update any internal links that reference `/dashboard/requests` to point to `/dashboard/projects` with appropriate filter
- Remove `src/pages/client/MyRequestsPage.tsx` file (or archive it)
- Update any documentation or help text that references "My Requests"

**Notification System Integration**
- Extend `notification_type` enum to include: 'admin_requested_info', 'client_responded_info'
- Create notifications when:
  - Admin creates comment on project: 'admin_requested_info' → client
  - Client replies to admin comment: 'client_responded_info' → admin
- Use existing notification infrastructure from `src/lib/db/notifications.ts`
- Send email notifications using existing email system (Resend or similar)
- Email templates:
  - "Admin Requested Information": "Admin has requested more details about your project [title]. Please reply with the requested information."
  - "Client Responded": "Client has responded to your information request for project [title]."

**Activity Logging**
- Extend `activity_log_event_type` enum to include: 'project_status_changed', 'project_soft_deleted', 'project_hard_deleted', 'project_comment_added', 'project_cloned', 'template_created', 'template_used'
- Log all status changes with old_status and new_status in event_data JSONB
- Log project deletions (soft and hard) with project details
- Log comment creation with comment_id and project_id
- Log project cloning with original_project_id and new_project_id in event_data
- Log template creation and usage with template_id and project_id in event_data
- Use existing `logActivity()` function from `src/lib/db/activityLog.ts`

**File Storage**
- Create Supabase Storage bucket `project-comment-attachments` if not exists
- Configure RLS policies: clients can upload files for their projects, admins can view all, clients can view files for their projects
- File validation: PDF and images only (JPG, PNG, GIF, WebP)
- Maximum file size: 50MB per file
- Store file metadata in `project_comment_attachments` table
- Display file thumbnails for images, download links for PDFs in comment thread

**API Layer - Project Comments**
- Create `src/lib/db/projectComments.ts` with functions:
  - `createComment(projectId, userId, content, parentCommentId?, attachments?)` - creates comment, handles status changes, sends notifications
  - `getCommentsForProject(projectId)` - returns all comments for project with attachments, ordered by created_at
  - `getCommentById(commentId)` - returns single comment with attachments
  - `deleteComment(commentId, userId)` - soft-deletes comment (mark as deleted, hide from view)
- Follow existing database patterns from `src/lib/db/projects.ts`
- Handle automatic status changes in `createComment()` function

**API Layer - Project Status Management**
- Update `src/lib/db/projects.ts` with functions:
  - `updateProjectStatus(projectId, newStatus, changedBy, reason?)` - updates status, logs activity, sends notifications if needed
  - `softDeleteProject(projectId, userId)` - soft-deletes project (sets deleted_at), validates user ownership and status
  - `hardDeleteProject(projectId)` - permanently deletes project and all related data (admin only)
  - `getProjectsByStatusGroup(statusGroup)` - returns projects filtered by grouped status (pending, active, completed)
- Extend existing `createProject()` to support `is_hiring_request` field
- Add validation: clients can only soft-delete their own projects with pending statuses

**API Layer - Invoice Integration**
- Update `src/lib/db/invoices.ts` `createInvoice()` function:
  - When `project_id` is provided, automatically call `updateProjectStatus(projectId, 'pending_payment', adminUserId, 'Invoice created')`
  - Log activity: 'project_status_changed'
  - Send notification to client: 'invoice_created' (if not already handled)

**API Layer - Project Templates**
- Create `src/lib/db/projectTemplates.ts` with functions:
  - `createTemplate(userId, projectData, templateName)` - creates template from project data
  - `getTemplatesForUser(userId)` - returns all templates for user, ordered by updated_at DESC
  - `getTemplateById(templateId, userId)` - returns single template with attachments (validates ownership)
  - `updateTemplate(templateId, userId, updates)` - updates template name and details
  - `deleteTemplate(templateId, userId)` - deletes template and attachments
  - `useTemplateToCreateProject(templateId, userId, overrides?)` - creates new project from template with optional field overrides
- Follow existing database patterns from `src/lib/db/projects.ts`
- Handle template attachments separately (not copied to projects)

**API Layer - Project Cloning**
- Add `cloneProject(projectId, userId)` function to `src/lib/db/projects.ts`:
  - Validates user owns the project (created_by = userId)
  - Fetches original project data
  - Creates new project with copied fields (title + " (Copy)", description, category, tech, budget_range, timeline, special_requirements, is_hiring_request)
  - Sets status = `pending`, created_by = userId
  - Does NOT copy: phases, tasks, comments, attachments, tracking codes, invoice_id, deleted_at
  - Returns new project ID
  - Logs activity: 'project_cloned' with original_project_id and new_project_id in event_data

## Visual Design

No visual assets provided. Follow existing design patterns from:
- `src/pages/client/MyProjectsPage.tsx` for project list layout
- `src/pages/client/MyRequestsPage.tsx` for pending projects section
- `src/components/client/ClientProjectCard.tsx` for project card styling
- Existing comment/thread UI patterns (if any) or create new following shadcn/ui Dialog and Card patterns

## Existing Code to Leverage

**MyProjectsPage Component (`src/pages/client/MyProjectsPage.tsx`)**
- Reuse existing project fetching logic and filtering
- Extend status filter to support grouped options
- Add sections for "Active Projects" and "Pending Projects"
- Reuse `ClientProjectCard` component for displaying projects

**MyRequestsPage Component (`src/pages/client/MyRequestsPage.tsx`)**
- Reference for pending projects display patterns
- Migrate useful UI patterns to unified My Projects page
- Archive or remove after migration complete

**ClientCreateProjectPage Component (`src/pages/client/ClientCreateProjectPage.tsx`)**
- Reuse form structure and validation patterns
- Add `is_hiring_request` checkbox field
- Add "Use Template" button and template selector dialog
- Add "Save as Template" checkbox option
- Follow same React Hook Form + Zod validation patterns
- Support pre-filling form from template or cloned project

**ProjectForm Component (`src/components/admin/ProjectForm.tsx`)**
- Reference for form field patterns and validation
- Adapt patterns for client project creation form

**ClientLayout (`src/layouts/ClientLayout.tsx`)**
- Remove "My Requests" navigation item
- Keep "My Projects" navigation item (now unified)

**AdminLayout (`src/layouts/AdminLayout.tsx`)**
- Update project list filter to use grouped status options
- Add delete functionality to project management pages

**Invoice Management (`src/lib/db/invoices.ts`, `src/components/admin/InvoiceForm.tsx`)**
- Extend invoice creation to automatically update project status
- Add delete functionality to invoice detail page

**Notification System (`src/lib/db/notifications.ts`, `src/components/client/NotificationBell.tsx`)**
- Extend `NotificationType` enum with comment-related types
- Use `createNotification()` function for admin-client communication events
- Reuse notification display patterns

**Activity Logging (`src/lib/db/activityLog.ts`)**
- Extend `ActivityLogEventType` enum with project status and comment events
- Use `logActivity()` function for all project lifecycle activities
- Follow same JSONB `event_data` pattern

**Database Patterns (`src/lib/db/projects.ts`, `src/lib/db/users.ts`)**
- Follow TypeScript interface patterns for new types
- Replicate Supabase query patterns: `.select()`, `.insert()`, `.update()`, `.eq()`, `.order()`
- Use same error handling: `if (error) throw new Error(...)`
- Follow RLS policy patterns from existing migrations

**File Upload Patterns (`src/components/admin/AttachmentUploader.tsx`)**
- Reuse file upload component patterns for comment attachments
- Follow same validation: file types, size limits
- Use same Supabase Storage integration patterns

## Out of Scope

- Real-time messaging/chat between admin and client (Phase 8 spec)
- Project editing by clients (admins manage project details)
- Status changes by clients (only admins can change status, except automatic replies)
- Deletion of projects in "Active" or "Completed" status by clients
- Invoice editing (covered in payments spec)
- Payment processing UI (covered in payments spec)
- Bulk project operations (bulk delete, bulk status change)
- Project versioning or history (beyond status history)
- Advanced comment features (mentions, @ notifications, rich text editing)
- Comment moderation or deletion by clients (admins can delete)
- Project archiving (separate from soft-delete)
- Project restoration from soft-delete (admins can restore by setting deleted_at = NULL)
- Project request analytics or reporting
- Project priority system beyond `is_hiring_request` flag
- Template sharing between users (templates are user-specific)
- Automatic project creation from templates (templates require manual use)

