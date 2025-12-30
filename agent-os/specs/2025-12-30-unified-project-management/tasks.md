# Task Breakdown: Unified Project Management Workflow

## Overview
Total Tasks: 15 Task Groups

## Task List

### Database Layer

#### Task Group 1: Project Status Enum Replacement
**Dependencies:** None

- [x] 1.0 Complete project status enum replacement
  - [ ] 1.1 Write 5-6 focused tests for status enum replacement
    - Test: New enum type project_status_new exists with all required values
    - Test: Old status values are correctly mapped to new values
    - Test: All existing projects have valid status after migration
    - Test: RLS policies work with new status values
    - Test: Status enum comment is updated correctly
  - [ ] 1.2 Create new project_status_new enum type
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_new_project_status_enum.sql`
    - Create enum: `CREATE TYPE project_status_new AS ENUM ('pending', 'pending_payment', 'pending_info', 'in_progress', 'in_testing', 'completed')`
    - Add comment: `'Unified project status: pending, pending_payment, pending_info, in_progress, in_testing, completed'`
  - [ ] 1.3 Add temporary status_new column to projects table
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_temp_status_column.sql`
    - Add column: `status_new project_status_new`
  - [ ] 1.4 Map old statuses to new statuses
    - Update all rows: map `pending_approval` → `pending`, `awaiting_payment` → `pending_payment`, `approved` → `in_progress`, `published` → `completed` (if applicable), `draft` → `pending`, `denied` → `completed` (or handle separately)
    - Handle any edge cases or unmapped statuses
  - [ ] 1.5 Replace old status column with new
    - Drop old `status` column
    - Rename `status_new` to `status`
    - Drop old `project_status` enum type
  - [ ] 1.6 Update all RLS policies and queries
    - Review all existing RLS policies that reference status
    - Update policies to use new status values
    - Update any database functions or triggers that reference status
  - [ ] 1.7 Ensure status enum replacement tests pass
    - Run ONLY the 5-6 tests written in 1.1
    - Verify all projects have valid status values
    - Verify RLS policies work correctly

**Acceptance Criteria:**
- The 5-6 tests written in 1.1 pass
- All existing projects have valid new status values
- Old enum type is removed
- RLS policies work with new status values
- No data loss during migration

---

#### Task Group 2: Projects Table Updates
**Dependencies:** Task Group 1

- [x] 2.0 Complete projects table schema updates
  - [ ] 2.1 Write 4-5 focused tests for projects table updates
    - Test: projects table has is_hiring_request field (boolean, default false)
    - Test: projects table has deleted_at field (timestamptz, nullable)
    - Test: projects table has created_by field (UUID, FK to users, nullable)
    - Test: Indexes exist on deleted_at and is_hiring_request
    - Test: RLS policies allow clients to view projects where client_id OR created_by matches
  - [ ] 2.2 Add is_hiring_request field to projects table
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_is_hiring_request_field.sql`
    - Add column: `is_hiring_request BOOLEAN NOT NULL DEFAULT false`
    - Add comment explaining the field purpose
  - [ ] 2.3 Add deleted_at field to projects table
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_deleted_at_field.sql`
    - Add column: `deleted_at TIMESTAMPTZ NULLABLE`
    - Add comment explaining soft-delete functionality
  - [ ] 2.4 Verify created_by field exists
    - Check if `created_by` field already exists in projects table
    - If not, create migration to add it: `created_by UUID REFERENCES users(id) ON DELETE SET NULL`
  - [ ] 2.5 Create indexes for new fields
    - Create index on `projects.deleted_at` for filtering soft-deleted projects
    - Create index on `projects.is_hiring_request` for admin prioritization queries
    - Create index on `projects.created_by` if not exists
  - [ ] 2.6 Update RLS policies for projects table
    - Update SELECT policy: Clients can view projects where `client_id` OR `created_by` matches their user_id AND `deleted_at IS NULL`
    - Update UPDATE policy: Clients can update projects where `created_by` matches their user_id AND status is pending (pending, pending_payment, pending_info)
    - Add DELETE policy: Clients can soft-delete (UPDATE deleted_at) projects where `created_by` matches their user_id AND status IN ('pending', 'pending_payment', 'pending_info')
    - Ensure admins can manage all projects (hard-delete)
  - [ ] 2.7 Ensure projects table update tests pass
    - Run ONLY the 4-5 tests written in 2.1
    - Verify migrations run successfully
    - Verify RLS policies work correctly

**Acceptance Criteria:**
- The 4-5 tests written in 2.1 pass
- Projects table has all new fields with proper types
- Indexes are created for performance
- RLS policies enforce correct access patterns
- Existing projects remain functional

---

#### Task Group 3: Project Comments/Threads Schema
**Dependencies:** Task Group 2

- [x] 3.0 Complete project comments database schema
  - [ ] 3.1 Write 5-6 focused tests for project comments schema
    - Test: project_comments table exists with all required columns
    - Test: project_comment_attachments table links correctly to comments
    - Test: RLS policies allow clients to SELECT/INSERT comments for their projects
    - Test: RLS policies allow admins to manage all comments
    - Test: Threaded replies work via parent_comment_id
    - Test: updated_at trigger works correctly
  - [ ] 3.2 Create project_comments table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_comments_table.sql`
    - Table fields: `id` (UUID, primary key), `project_id` (UUID, FK to projects, ON DELETE CASCADE), `user_id` (UUID, FK to users), `parent_comment_id` (UUID, FK to project_comments, nullable), `content` (TEXT), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraints with appropriate ON DELETE behavior
    - Add updated_at trigger using existing `update_updated_at_column()` function
  - [ ] 3.3 Create project_comment_attachments table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_comment_attachments_table.sql`
    - Table fields: `id` (UUID, primary key), `comment_id` (UUID, FK to project_comments, ON DELETE CASCADE), `file_url` (TEXT), `file_name` (TEXT), `file_type` (enum: 'pdf', 'image'), `file_size` (BIGINT - bytes), `created_at` (TIMESTAMPTZ)
    - Add FK constraint to project_comments
  - [ ] 3.4 Create file_type enum if not exists
    - Create enum: `CREATE TYPE file_type AS ENUM ('pdf', 'image')` (if not already exists)
    - Or reuse existing file_type enum if available
  - [ ] 3.5 Create indexes for project comments
    - Create index on `project_comments.project_id`
    - Create index on `project_comments.parent_comment_id`
    - Create index on `project_comments.user_id`
    - Create index on `project_comments.created_at DESC`
    - Create index on `project_comment_attachments.comment_id`
  - [ ] 3.6 Create RLS policies for project comments
    - Enable RLS on project_comments and project_comment_attachments tables
    - Policy: Clients can SELECT/INSERT comments for projects where they are `client_id` OR `created_by`
    - Policy: Admins can SELECT/INSERT/UPDATE/DELETE all comments
    - Policy: Service role full access for backend operations
  - [ ] 3.7 Ensure project comments schema tests pass
    - Run ONLY the 5-6 tests written in 3.1
    - Verify migrations run successfully
    - Verify threaded comments work correctly

**Acceptance Criteria:**
- The 5-6 tests written in 3.1 pass
- project_comments and project_comment_attachments tables created with proper schema
- RLS enforces correct access patterns
- Threaded replies work via parent_comment_id
- File attachments link correctly to comments

---

#### Task Group 4: Project Templates Schema
**Dependencies:** Task Group 2

- [x] 4.0 Complete project templates database schema
  - [ ] 4.1 Write 4-5 focused tests for project templates schema
    - Test: project_templates table exists with all required columns
    - Test: project_template_attachments table links correctly to templates
    - Test: RLS policies allow users to SELECT/INSERT/UPDATE/DELETE their own templates
    - Test: RLS policies allow admins to view all templates
    - Test: Unique constraint on user_id + template name (if applicable)
  - [ ] 4.2 Create project_templates table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_templates_table.sql`
    - Table fields: `id` (UUID, primary key), `user_id` (UUID, FK to users), `name` (TEXT - template name), `title` (TEXT), `description` (TEXT), `category` (TEXT), `tech` (TEXT[]), `budget_range` (TEXT nullable), `timeline` (TEXT nullable), `special_requirements` (TEXT nullable), `is_hiring_request` (BOOLEAN, default false), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraint to users with ON DELETE CASCADE
    - Add updated_at trigger using existing `update_updated_at_column()` function
  - [ ] 4.3 Create project_template_attachments table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_template_attachments_table.sql`
    - Table fields: `id` (UUID, primary key), `template_id` (UUID, FK to project_templates, ON DELETE CASCADE), `file_url` (TEXT), `file_name` (TEXT), `file_type` (enum: 'pdf', 'image'), `file_size` (BIGINT - bytes), `created_at` (TIMESTAMPTZ)
    - Add FK constraint to project_templates
  - [ ] 4.4 Create indexes for project templates
    - Create index on `project_templates.user_id`
    - Create index on `project_templates.created_at DESC`
    - Create index on `project_template_attachments.template_id`
  - [ ] 4.5 Create RLS policies for project templates
    - Enable RLS on project_templates and project_template_attachments tables
    - Policy: Users can SELECT/INSERT/UPDATE/DELETE their own templates (where user_id matches)
    - Policy: Admins can SELECT all templates
    - Policy: Service role full access for backend operations
  - [ ] 4.6 Ensure project templates schema tests pass
    - Run ONLY the 4-5 tests written in 4.1
    - Verify migrations run successfully
    - Verify RLS policies work correctly

**Acceptance Criteria:**
- The 4-5 tests written in 4.1 pass
- project_templates and project_template_attachments tables created with proper schema
- RLS enforces user ownership of templates
- Template attachments link correctly to templates

---

#### Task Group 5: Status Change Automation & History
**Dependencies:** Task Group 1, Task Group 3

- [x] 5.0 Complete status change automation setup
  - [ ] 5.1 Write 4-5 focused tests for status change automation
    - Test: Database trigger updates project status when invoice is created
    - Test: Database trigger updates project status when admin comment is created
    - Test: Database trigger updates project status when client replies to comment
    - Test: project_status_history table logs status changes (if implemented)
    - Test: Status changes are logged in activity log
  - [ ] 5.2 Create project_status_history table (optional)
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_status_history_table.sql`
    - Table fields: `id` (UUID), `project_id` (UUID, FK to projects), `old_status` (TEXT), `new_status` (TEXT), `changed_by` (UUID, FK to users), `reason` (TEXT nullable), `created_at` (TIMESTAMPTZ)
    - Add indexes on `project_id` and `created_at DESC`
  - [ ] 5.3 Create database trigger for invoice status change
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_trigger_invoice_status_change.sql`
    - Create trigger function: `auto_update_project_status_on_invoice()`
    - Trigger fires AFTER INSERT on `invoices` table
    - When `project_id` is not null, automatically updates project status to `pending_payment`
    - Log status change to activity log
  - [ ] 5.4 Create database trigger for comment status change
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_trigger_comment_status_change.sql`
    - Create trigger function: `auto_update_project_status_on_comment()`
    - Trigger fires AFTER INSERT on `project_comments` table
    - When comment is from admin (role = 'admin') AND project status is NOT `pending_info`, update status to `pending_info`
    - When comment is from client AND project status is `pending_info`, update status to `pending`
    - Log status change to activity log
  - [ ] 5.5 Alternative: Implement status change logic in application layer
    - If triggers are not preferred, implement in `src/lib/db/invoices.ts` `createInvoice()` function
    - Implement in `src/lib/db/projectComments.ts` `createComment()` function
    - Ensure status changes are logged to activity log
  - [ ] 5.6 Ensure status change automation tests pass
    - Run ONLY the 4-5 tests written in 5.1
    - Verify triggers work correctly (or application logic works correctly)
    - Verify status changes are logged

**Acceptance Criteria:**
- The 4-5 tests written in 5.1 pass
- Status changes happen automatically based on invoice/comment creation
- Status changes are logged to activity log
- Triggers or application logic work correctly

---

#### Task Group 6: Project Requests Data Migration
**Dependencies:** Task Group 1, Task Group 2

- [x] 6.0 Complete project requests data migration
  - [ ] 6.1 Write 4-5 focused tests for data migration
    - Test: All project_requests records are migrated to projects table
    - Test: Status values are correctly mapped (pending → pending, approved → in_progress, needs_info → pending_info)
    - Test: Attachments are migrated from project_request_attachments to project_attachments
    - Test: Client relationships are preserved (client_id and created_by)
    - Test: Admin notes and denial reasons are preserved
  - [ ] 6.2 Create migration script for project_requests data
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_migrate_project_requests_to_projects.sql`
    - For each `project_request` record:
      - Create new `project` record with: title, description, category, tech (from category), client_id, created_by = client_id, status = mapped from request_status
      - Map `request_status`: 'pending' → 'pending', 'approved' → 'in_progress', 'denied' → 'completed' (or handle separately), 'needs_info' → 'pending_info'
      - Set `is_hiring_request` = false (default)
      - Copy `budget_range`, `timeline`, `special_requirements` to project notes or new fields
      - Preserve `admin_notes` and `denial_reason` in project notes or activity log
  - [ ] 6.3 Migrate project_request_attachments to project_attachments
    - For each attachment in `project_request_attachments`:
      - Link to new project via migrated project_id
      - Copy file_url, file_name, file_type, file_size
      - Preserve created_at timestamp
  - [ ] 6.4 Update foreign key references
    - Update any foreign key references from `project_requests.project_id` to new project IDs
    - Verify no broken references
  - [ ] 6.5 Archive or drop project_requests tables
    - Rename `project_requests` table to `project_requests_archived` (or drop after verification)
    - Drop `project_request_attachments` table (or archive)
    - Drop `request_status` enum type if no longer needed
  - [ ] 6.6 Ensure data migration tests pass
    - Run ONLY the 4-5 tests written in 6.1
    - Verify all data is migrated correctly
    - Verify no data loss
    - Test on development database first

**Acceptance Criteria:**
- The 4-5 tests written in 6.1 pass
- All project_requests data is migrated to projects table
- Attachments are migrated correctly
- Client relationships are preserved
- Old tables are archived or dropped safely

---

### Backend/API Layer

#### Task Group 7: Project Comments API
**Dependencies:** Task Group 3

- [x] 7.0 Complete project comments API
  - [ ] 7.1 Write 4-5 focused tests for project comments API
    - Test: createComment() creates comment and handles status changes
    - Test: getCommentsForProject() returns all comments with attachments
    - Test: getCommentById() returns single comment with attachments
    - Test: deleteComment() soft-deletes comment
    - Test: Automatic status changes work when admin/client creates comment
  - [ ] 7.2 Create projectComments.ts database access file
    - Create file: `src/lib/db/projectComments.ts`
    - Implement `createComment(projectId, userId, content, parentCommentId?, attachments?)` function
    - Handle automatic status changes:
      - If admin creates comment AND status is NOT `pending_info`, update to `pending_info`
      - If client creates comment AND status is `pending_info`, update to `pending`
    - Send notifications when status changes
    - Log activity: 'project_comment_added'
  - [ ] 7.3 Implement getCommentsForProject() function
    - Fetch all comments for project with attachments
    - Order by created_at ASC
    - Include user information (name, role) for each comment
    - Return threaded structure (parent comments with replies)
  - [ ] 7.4 Implement getCommentById() function
    - Fetch single comment by ID with attachments
    - Include user information
    - Validate user has access to project
  - [ ] 7.5 Implement deleteComment() function
    - Soft-delete comment (mark as deleted, hide from view)
    - Validate user ownership or admin role
    - Log activity if needed
  - [ ] 7.6 Ensure project comments API tests pass
    - Run ONLY the 4-5 tests written in 7.1
    - Verify all functions work correctly
    - Verify status changes and notifications work

**Acceptance Criteria:**
- The 4-5 tests written in 7.1 pass
- All comment CRUD operations work correctly
- Automatic status changes work when comments are created
- Notifications are sent when status changes
- Activity is logged correctly

---

#### Task Group 8: Project Status Management API
**Dependencies:** Task Group 1, Task Group 2

- [x] 8.0 Complete project status management API
  - [ ] 8.1 Write 5-6 focused tests for project status management API
    - Test: updateProjectStatus() updates status and logs activity
    - Test: softDeleteProject() validates user ownership and status
    - Test: hardDeleteProject() permanently deletes project and related data
    - Test: getProjectsByStatusGroup() filters by grouped status correctly
    - Test: createProject() supports is_hiring_request field
    - Test: Clients can only soft-delete their own projects with pending statuses
  - [ ] 8.2 Update projects.ts with status management functions
    - Update file: `src/lib/db/projects.ts`
    - Implement `updateProjectStatus(projectId, newStatus, changedBy, reason?)` function
    - Log activity: 'project_status_changed' with old_status and new_status in event_data
    - Send notifications if needed (based on status change)
  - [ ] 8.3 Implement softDeleteProject() function
    - Validate user owns the project (created_by = userId)
    - Validate status is IN ('pending', 'pending_payment', 'pending_info')
    - UPDATE projects SET deleted_at = NOW() WHERE conditions
    - Log activity: 'project_soft_deleted'
  - [ ] 8.4 Implement hardDeleteProject() function
    - Admin only function
    - DELETE FROM project_comments WHERE project_id = projectId
    - DELETE FROM project_attachments WHERE project_id = projectId
    - DELETE FROM project_phases WHERE project_id = projectId (CASCADE will delete tasks)
    - DELETE FROM projects WHERE id = projectId
    - Log activity: 'project_hard_deleted'
  - [ ] 8.5 Implement getProjectsByStatusGroup() function
    - Map grouped status to individual statuses:
      - 'pending' → ['pending', 'pending_payment', 'pending_info']
      - 'active' → ['in_progress', 'in_testing']
      - 'completed' → ['completed']
    - Return filtered projects
  - [ ] 8.6 Extend createProject() function
    - Add support for `is_hiring_request` boolean field
    - Add support for `created_by` field (for client-created projects)
    - Set default status to 'pending' for client-created projects
  - [ ] 8.7 Ensure project status management API tests pass
    - Run ONLY the 5-6 tests written in 8.1
    - Verify all functions work correctly
    - Verify validation and permissions work

**Acceptance Criteria:**
- The 5-6 tests written in 8.1 pass
- Status management functions work correctly
- Soft-delete and hard-delete work with proper validation
- Status grouping works correctly
- createProject() supports new fields

---

#### Task Group 9: Project Templates API
**Dependencies:** Task Group 4

- [x] 9.0 Complete project templates API
  - [ ] 9.1 Write 4-5 focused tests for project templates API
    - Test: createTemplate() creates template from project data
    - Test: getTemplatesForUser() returns user's templates
    - Test: getTemplateById() validates ownership
    - Test: updateTemplate() updates template details
    - Test: deleteTemplate() deletes template and attachments
    - Test: useTemplateToCreateProject() creates project from template
  - [ ] 9.2 Create projectTemplates.ts database access file
    - Create file: `src/lib/db/projectTemplates.ts`
    - Implement `createTemplate(userId, projectData, templateName)` function
    - Copy project fields to template (title, description, category, tech, etc.)
    - Create template record
    - Log activity: 'template_created'
  - [ ] 9.3 Implement getTemplatesForUser() function
    - Fetch all templates for user
    - Order by updated_at DESC
    - Include template name and basic info
  - [ ] 9.4 Implement getTemplateById() function
    - Fetch single template with attachments
    - Validate user ownership
    - Return template data
  - [ ] 9.5 Implement updateTemplate() function
    - Update template name and details
    - Validate user ownership
    - Update updated_at timestamp
  - [ ] 9.6 Implement deleteTemplate() function
    - Delete template and attachments (CASCADE)
    - Validate user ownership
    - Log activity if needed
  - [ ] 9.7 Implement useTemplateToCreateProject() function
    - Fetch template data
    - Create new project with template data
    - Allow optional field overrides
    - Do NOT copy template attachments to project
    - Log activity: 'template_used'
  - [ ] 9.8 Ensure project templates API tests pass
    - Run ONLY the 4-5 tests written in 9.1
    - Verify all functions work correctly
    - Verify ownership validation works

**Acceptance Criteria:**
- The 4-5 tests written in 9.1 pass
- All template CRUD operations work correctly
- Template-to-project creation works
- Ownership validation works correctly

---

#### Task Group 10: Project Cloning API
**Dependencies:** Task Group 8

- [x] 10.0 Complete project cloning API
  - [ ] 10.1 Write 3-4 focused tests for project cloning API
    - Test: cloneProject() validates user ownership
    - Test: cloneProject() creates new project with copied fields
    - Test: cloneProject() does NOT copy phases, tasks, comments, attachments
    - Test: cloneProject() logs activity correctly
  - [ ] 10.2 Add cloneProject() function to projects.ts
    - Update file: `src/lib/db/projects.ts`
    - Implement `cloneProject(projectId, userId)` function
    - Validate user owns the project (created_by = userId)
    - Fetch original project data
    - Create new project with: title + " (Copy)", description, category, tech, budget_range, timeline, special_requirements, is_hiring_request
    - Set status = 'pending', created_by = userId
    - Do NOT copy: phases, tasks, comments, attachments, tracking codes, invoice_id, deleted_at
    - Return new project ID
    - Log activity: 'project_cloned' with original_project_id and new_project_id in event_data
  - [ ] 10.3 Ensure project cloning API tests pass
    - Run ONLY the 3-4 tests written in 10.1
    - Verify cloning works correctly
    - Verify only appropriate fields are copied

**Acceptance Criteria:**
- The 3-4 tests written in 10.1 pass
- cloneProject() creates new project with copied fields
- Only appropriate fields are copied (not phases, tasks, etc.)
- Activity is logged correctly

---

#### Task Group 11: Invoice Integration Updates
**Dependencies:** Task Group 8

- [x] 11.0 Complete invoice integration updates
  - [ ] 11.1 Write 3-4 focused tests for invoice integration
    - Test: createInvoice() automatically updates project status to pending_payment
    - Test: createInvoice() logs activity when status changes
    - Test: createInvoice() sends notification to client
    - Test: Invoice deletion does NOT affect linked project
  - [ ] 11.2 Update createInvoice() function
    - Update file: `src/lib/db/invoices.ts`
    - When `project_id` is provided, automatically call `updateProjectStatus(projectId, 'pending_payment', adminUserId, 'Invoice created')`
    - Log activity: 'project_status_changed'
    - Send notification to client: 'invoice_created' (if not already handled)
  - [ ] 11.3 Add deleteInvoice() function
    - Implement function to delete invoice
    - DELETE FROM invoices WHERE id = invoiceId
    - Do NOT delete linked project
    - Validate admin role
    - Log activity if needed
  - [ ] 11.4 Ensure invoice integration tests pass
    - Run ONLY the 3-4 tests written in 11.1
    - Verify automatic status changes work
    - Verify notifications are sent

**Acceptance Criteria:**
- The 3-4 tests written in 11.1 pass
- Invoice creation automatically updates project status
- Notifications are sent correctly
- Invoice deletion does not affect projects

---

### Frontend - Client Side

#### Task Group 12: Unified My Projects Page
**Dependencies:** Task Group 8

- [x] 12.0 Complete unified My Projects page
  - [ ] 12.1 Write 4-5 focused tests for unified My Projects page
    - Test: Page shows projects in separate "Active Projects" and "Pending Projects" sections
    - Test: Status filter dropdown works with grouped options
    - Test: Delete button only shows for client-created projects with pending statuses
    - Test: Clone button only shows for client-created projects
    - Test: Projects are filtered correctly by status group
  - [ ] 12.2 Update MyProjectsPage.tsx structure
    - Update file: `src/pages/client/MyProjectsPage.tsx`
    - Add two sections: "Active Projects" and "Pending Projects"
    - Section 1: Projects with status `in_progress`, `in_testing`, `completed`
    - Section 2: Projects with status `pending`, `pending_payment`, `pending_info`
    - Display projects using existing `ClientProjectCard` component
  - [ ] 12.3 Add "Create Project" button
    - Add button at top of page
    - Link to `/dashboard/projects/new`
    - Style consistently with existing buttons
  - [ ] 12.4 Implement grouped status filter dropdown
    - Update filter dropdown to use grouped options:
      - "All" - shows all projects
      - "Pending" - filters: pending, pending_payment, pending_info
      - "Active" - filters: in_progress, in_testing
      - "Completed" - filters: completed
    - Map grouped option to individual status values in query
    - Filter applies to both sections or shows relevant section
  - [ ] 12.5 Add status badges with colors
    - `pending`: Yellow/amber badge
    - `pending_payment`: Orange badge
    - `pending_info`: Blue badge
    - `in_progress`: Indigo badge
    - `in_testing`: Purple badge
    - `completed`: Green badge
    - Use existing Badge component
  - [ ] 12.6 Add delete button to project cards
    - Show delete button (trash icon) only for:
      - `created_by` = current user_id
      - `status` IN ('pending', 'pending_payment', 'pending_info')
      - `deleted_at IS NULL`
    - Show confirmation dialog before deletion
    - Call `softDeleteProject()` function on confirm
    - Show success toast
  - [ ] 12.7 Add clone button to project cards
    - Show clone button only for:
      - `created_by` = current user_id
      - `deleted_at IS NULL`
    - Show confirmation dialog
    - Call `cloneProject()` function on confirm
    - Redirect to new project or show success toast
  - [ ] 12.8 Ensure unified My Projects page tests pass
    - Run ONLY the 4-5 tests written in 12.1
    - Verify page works correctly
    - Verify filtering and actions work

**Acceptance Criteria:**
- The 4-5 tests written in 12.1 pass
- Page shows projects in separate sections
- Status filtering works with grouped options
- Delete and clone buttons work correctly
- Status badges display with correct colors

---

#### Task Group 13: Project Creation Form Updates
**Dependencies:** Task Group 8, Task Group 9

- [x] 13.0 Complete project creation form updates
  - [ ] 13.1 Write 4-5 focused tests for project creation form
    - Test: Form includes "I'm hiring you" checkbox
    - Test: Form includes "Save as Template" checkbox
    - Test: Form includes "Use Template" button
    - Test: Template selector dialog works correctly
    - Test: Form submission creates project with correct fields
  - [ ] 13.2 Update ClientCreateProjectPage.tsx
    - Update file: `src/pages/client/ClientCreateProjectPage.tsx`
    - Add checkbox: "I'm hiring you for this project" (default unchecked)
    - Add checkbox: "Save as Template" (optional, default unchecked)
    - Add "Use Template" button that opens template selector dialog
    - Store checkbox values in form state
  - [ ] 13.3 Create template selector dialog component
    - Create component: `src/components/project/TemplateSelectorDialog.tsx`
    - Fetch user's templates using `getTemplatesForUser()`
    - Display templates in list with name, category, last used date
    - Allow user to select template
    - Pre-fill form fields when template selected
    - Allow user to edit pre-filled fields
  - [ ] 13.4 Update form submission logic
    - On submit: create project with status = 'pending', created_by = current user_id, is_hiring_request = checkbox value
    - If "Save as Template" is checked, create template record after project creation
    - Display success toast and redirect to "My Projects" page
    - Show validation errors inline using shadcn/ui Alert components
  - [ ] 13.5 Support pre-filling from cloned project
    - If coming from clone action, pre-fill form with cloned project data
    - Allow user to edit pre-filled fields
    - Remove " (Copy)" from title if user wants
  - [ ] 13.6 Ensure project creation form tests pass
    - Run ONLY the 4-5 tests written in 13.1
    - Verify form works correctly
    - Verify template selection and saving work

**Acceptance Criteria:**
- The 4-5 tests written in 13.1 pass
- Form includes all new fields and options
- Template selector works correctly
- Form submission creates project with correct fields
- Template saving works if checked

---

#### Task Group 14: Comment Thread Components
**Dependencies:** Task Group 7

- [x] 14.0 Complete comment thread components
  - [ ] 14.1 Write 4-5 focused tests for comment thread components
    - Test: ProjectCommentThread displays comments correctly
    - Test: ProjectCommentForm creates comment with attachments
    - Test: Reply functionality works for clients
    - Test: File uploads work correctly
    - Test: Status changes automatically when comments are created
  - [ ] 14.2 Create ProjectCommentThread component
    - Create component: `src/components/project/ProjectCommentThread.tsx`
    - Display threaded comments with author name, role badge, timestamp
    - Show file attachments as download links or image thumbnails
    - Reply button for clients (when status is `pending_info`)
    - Admin can always add comments
    - Use existing Card and Badge components
  - [ ] 14.3 Create ProjectCommentForm component
    - Create component: `src/components/project/ProjectCommentForm.tsx`
    - Textarea for comment content (required)
    - File upload component (PDF and images, max 50MB per file)
    - Upload to Supabase Storage bucket `project-comment-attachments`
    - Store file metadata in `project_comment_attachments` table
    - Submit button disabled until content is provided
    - Use existing Input, Textarea, Button components
  - [ ] 14.4 Add comment thread to client project detail page
    - Update file: `src/pages/client/ClientProjectDetailPage.tsx`
    - Add comment thread section
    - Display existing comments
    - Show comment form for clients (when status is `pending_info`) or admins (always)
  - [ ] 14.5 Add comment thread to admin project detail page
    - Update file: `src/pages/admin/ProjectDetailPage.tsx` or similar
    - Add comment thread section
    - Display existing comments
    - Show comment form for admins
  - [ ] 14.6 Handle automatic status changes
    - When admin creates comment: automatically change status to `pending_info` (if not already)
    - When client replies: automatically change status to `pending`
    - Show notifications when status changes
  - [ ] 14.7 Ensure comment thread component tests pass
    - Run ONLY the 4-5 tests written in 14.1
    - Verify components work correctly
    - Verify status changes work automatically

**Acceptance Criteria:**
- The 4-5 tests written in 14.1 pass
- Comment thread displays correctly
- Comment form works with file uploads
- Automatic status changes work
- Notifications are sent correctly

---

### Integration & Updates

#### Task Group 15: Integration Updates & Route Removal
**Dependencies:** Task Group 1, Task Group 7, Task Group 8

- [x] 15.0 Complete integration updates and route removal
  - [ ] 15.1 Write 3-4 focused tests for integration updates
    - Test: Notification types include new comment-related types
    - Test: Activity log event types include new project events
    - Test: Status filtering works on admin dashboard
    - Test: Route removal works correctly
  - [ ] 15.2 Update notification system
    - Update file: `src/lib/db/notifications.ts`
    - Extend `notification_type` enum to include: 'admin_requested_info', 'client_responded_info'
    - Create notifications when:
      - Admin creates comment on project: 'admin_requested_info' → client
      - Client replies to admin comment: 'client_responded_info' → admin
    - Update email templates for new notification types
  - [ ] 15.3 Update activity logging
    - Update file: `src/lib/db/activityLog.ts`
    - Extend `activity_log_event_type` enum to include: 'project_status_changed', 'project_soft_deleted', 'project_hard_deleted', 'project_comment_added', 'project_cloned', 'template_created', 'template_used'
    - Ensure all new events are logged with proper event_data
  - [ ] 15.4 Update admin dashboard status filtering
    - Update file: `src/pages/admin/ProjectList.tsx`
    - Update filter dropdown to use same grouped options as client dashboard:
      - "All", "Pending", "Active", "Completed"
    - Map grouped option to individual status values
    - Ensure consistent filter UI and behavior
  - [ ] 15.5 Add delete functionality to admin project pages
    - Add delete button to admin project list and detail pages
    - Show confirmation dialog
    - Call `hardDeleteProject()` function on confirm
    - Show success toast
  - [ ] 15.6 Add delete functionality to invoice detail page
    - Update file: `src/pages/admin/InvoiceDetailPage.tsx` or similar
    - Add delete button
    - Show confirmation: "Are you sure you want to delete this invoice? The linked project will not be affected."
    - Call `deleteInvoice()` function on confirm
    - Show success toast
  - [ ] 15.7 Remove /dashboard/requests route
    - Update file: `src/routes.tsx`
    - Remove `/dashboard/requests` route
    - Remove import for `MyRequestsPage` component
  - [ ] 15.8 Remove "My Requests" navigation link
    - Update file: `src/layouts/ClientLayout.tsx`
    - Remove "My Requests" link from navigation
    - Update navigation order if needed
  - [ ] 15.9 Archive or remove MyRequestsPage.tsx
    - Archive `src/pages/client/MyRequestsPage.tsx` file (or remove)
    - Update any documentation or help text that references "My Requests"
  - [ ] 15.10 Create file storage bucket for comment attachments
    - Create Supabase Storage bucket `project-comment-attachments` if not exists
    - Configure RLS policies: clients can upload files for their projects, admins can view all, clients can view files for their projects
    - File validation: PDF and images only (JPG, PNG, GIF, WebP)
    - Maximum file size: 50MB per file
  - [ ] 15.11 Ensure integration updates tests pass
    - Run ONLY the 3-4 tests written in 15.1
    - Verify all integrations work correctly
    - Verify route removal works

**Acceptance Criteria:**
- The 3-4 tests written in 15.1 pass
- Notification system includes new types
- Activity logging includes new events
- Status filtering works on both dashboards
- Routes and navigation are updated correctly
- File storage bucket is configured correctly

---

## Summary

This task breakdown covers all requirements from the Unified Project Management Workflow specification:

1. **Database Layer (Task Groups 1-6)**: Status enum replacement, projects table updates, comments schema, templates schema, status automation, and data migration
2. **Backend/API Layer (Task Groups 7-11)**: Comments API, status management, templates API, cloning API, and invoice integration
3. **Frontend - Client Side (Task Groups 12-14)**: Unified My Projects page, project creation form updates, and comment thread components
4. **Integration & Updates (Task Group 15)**: Notification system, activity logging, admin dashboard updates, route removal, and file storage

Each task group includes focused tests, implementation steps, and acceptance criteria to ensure quality and completeness.

