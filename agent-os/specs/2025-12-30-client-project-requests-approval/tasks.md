# Task Breakdown: Client Project Requests & Approval Workflow

## Overview
Total Tasks: 10 Task Groups

## Task List

### Database Layer

#### Task Group 1: Project Requests Schema & Migrations
**Dependencies:** None

- [x] 1.0 Complete project requests database schema
  - [ ] 1.1 Write 4-5 focused tests for project requests schema
    - Test: project_requests table exists with all required columns
    - Test: request_status enum accepts only valid values ('pending', 'approved', 'denied', 'needs_info')
    - Test: RLS policies allow clients to SELECT their own requests
    - Test: RLS policies allow admins to manage all requests
    - Test: project_request_attachments table links correctly to requests
  - [ ] 1.2 Create request_status enum type
    - Create enum: `CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied', 'needs_info')`
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_request_status_enum.sql`
  - [ ] 1.3 Create project_requests table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_requests_table.sql`
    - Table fields: `id` (UUID, primary key), `client_id` (UUID, FK to users), `title` (TEXT), `description` (TEXT), `category` (TEXT/enum), `budget_range` (TEXT nullable), `timeline` (TEXT nullable), `special_requirements` (TEXT nullable), `status` (request_status, default 'pending'), `admin_notes` (TEXT nullable), `denial_reason` (TEXT nullable), `project_id` (UUID, FK to projects, nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraints with appropriate ON DELETE behavior
    - Add updated_at trigger using existing `update_updated_at_column()` function
  - [ ] 1.4 Create project_request_attachments table migration
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_project_request_attachments_table.sql`
    - Table fields: `id` (UUID, primary key), `request_id` (UUID, FK to project_requests, ON DELETE CASCADE), `file_url` (TEXT), `file_name` (TEXT), `file_type` (enum: 'pdf', 'image'), `file_size` (BIGINT - bytes), `created_at` (TIMESTAMPTZ)
    - Add FK constraint to project_requests
  - [ ] 1.5 Create indexes for project requests
    - Create index on `project_requests.client_id`
    - Create index on `project_requests.status`
    - Create index on `project_requests.project_id`
    - Create index on `project_request_attachments.request_id`
  - [ ] 1.6 Create RLS policies for project requests
    - Enable RLS on project_requests and project_request_attachments tables
    - Policy: Clients can SELECT their own requests (where client_id matches user_id)
    - Policy: Admins can SELECT/INSERT/UPDATE/DELETE all requests
    - Policy: Service role full access for backend operations
  - [ ] 1.7 Ensure project requests schema tests pass
    - Run ONLY the 4-5 tests written in 1.1
    - Verify migrations run successfully

**Acceptance Criteria:**
- The 4-5 tests written in 1.1 pass
- project_requests and project_request_attachments tables created with proper schema
- RLS enforces client access to only their requests
- Request attachments link correctly to requests

---

#### Task Group 2: Projects Table Updates & Migrations
**Dependencies:** None

- [x] 2.0 Complete projects table schema updates
  - [ ] 2.1 Write 4-5 focused tests for projects table updates
    - Test: projects table has new status enum values ('pending_approval', 'awaiting_payment', 'approved', 'denied')
    - Test: projects table has created_by field (FK to users, nullable)
    - Test: projects table has payment_preference field (text/enum)
    - Test: projects table has requires_payment field (boolean, nullable)
    - Test: projects table has deposit_paid field (boolean, default false)
    - Test: projects table has invoice_id field (FK to invoices, nullable)
  - [ ] 2.2 Extend project status enum
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_extend_project_status_enum.sql`
    - Add new enum values: 'pending_approval', 'awaiting_payment' (or 'approved_pending_payment'), 'approved', 'denied'
    - Use ALTER TYPE to add values to existing enum
    - Handle existing 'draft' and 'published' values
  - [ ] 2.3 Add new fields to projects table
    - Create migration file: `supabase/migrations/YYYYMMDDHHMMSS_add_project_approval_fields.sql`
    - Add `created_by` field (UUID, FK to users, nullable)
    - Add `payment_preference` field (TEXT/enum: 'upfront_deposit', 'milestone_based', nullable)
    - Add `requires_payment` field (BOOLEAN, nullable)
    - Add `deposit_paid` field (BOOLEAN, default false)
    - Add `invoice_id` field (UUID, FK to invoices, nullable)
    - Add FK constraints with appropriate ON DELETE behavior
  - [ ] 2.4 Create indexes for new fields
    - Create index on `projects.created_by`
    - Create index on `projects.requires_payment`
    - Create index on `projects.status` (if not exists)
    - Create index on `projects.invoice_id`
  - [ ] 2.5 Update RLS policies if needed
    - Verify existing RLS policies work with new fields
    - Ensure clients can SELECT projects where they are client_id OR created_by
    - Ensure admins can manage all projects
  - [ ] 2.6 Ensure projects table update tests pass
    - Run ONLY the 4-5 tests written in 2.1
    - Verify migrations run successfully
    - Verify existing projects still work correctly

**Acceptance Criteria:**
- The 4-5 tests written in 2.1 pass
- Projects table has all new fields with proper types
- Status enum includes all new values
- Existing projects remain functional
- RLS policies work correctly with new fields

---

#### Task Group 3: File Storage Setup
**Dependencies:** Task Group 1

- [x] 3.0 Complete file storage setup for project request attachments
  - [ ] 3.1 Write 3-4 focused tests for file storage
    - Test: Storage bucket 'project-request-attachments' exists
    - Test: RLS policies allow clients to upload their own files
    - Test: RLS policies allow admins to view all files
    - Test: File size validation (max 50MB)
    - Test: File type validation (PDF and images only)
  - [ ] 3.2 Create Supabase Storage bucket
    - Create bucket: `project-request-attachments`
    - Configure bucket as public or private (based on requirements)
    - Set up bucket policies
  - [ ] 3.3 Create RLS policies for storage bucket
    - Policy: Clients can upload files (INSERT) to their own folder or with metadata
    - Policy: Clients can view their own uploaded files (SELECT)
    - Policy: Admins can view all files (SELECT)
    - Policy: Admins can delete files (DELETE)
    - Policy: Public can view files for approved projects (SELECT, conditional)
  - [ ] 3.4 Create file validation utility
    - Create function in `src/lib/storage.ts` or new file
    - Validate file types: PDF, JPG, PNG, GIF, WebP
    - Validate file size: max 50MB (52,428,800 bytes)
    - Return validation errors clearly
  - [ ] 3.5 Ensure file storage tests pass
    - Run ONLY the 3-4 tests written in 3.1
    - Verify bucket creation and policies work

**Acceptance Criteria:**
- The 3-4 tests written in 3.1 pass
- Storage bucket exists with proper configuration
- RLS policies enforce correct access
- File validation utility works correctly

---

### API Layer

#### Task Group 4: Project Requests Database Functions
**Dependencies:** Task Group 1

- [x] 4.0 Complete project requests database functions
  - [ ] 4.1 Write 5-6 focused tests for project requests functions
    - Test: createProjectRequest creates request with all fields
    - Test: getProjectRequestsForClient returns only client's requests
    - Test: getPendingProjectRequests returns only pending requests
    - Test: approveProjectRequest updates status and creates project
    - Test: denyProjectRequest updates status with reason
    - Test: getProjectRequestById returns request with attachments
  - [ ] 4.2 Create TypeScript interfaces
    - Create `src/lib/db/types/projectRequests.ts`
    - Define `ProjectRequest` interface
    - Define `ProjectRequestAttachment` interface
    - Define `CreateProjectRequestInput` interface
    - Export all types
  - [ ] 4.3 Create createProjectRequest function
    - Create function in `src/lib/db/projectRequests.ts`
    - Function: `createProjectRequest(data: CreateProjectRequestInput)`
    - Insert into project_requests table
    - Handle file attachments (store metadata, upload files)
    - Return created request with attachments
    - Error handling for validation and database errors
  - [ ] 4.4 Create getProjectRequestsForClient function
    - Create function: `getProjectRequestsForClient(clientId: string, filters?: { status?: string })`
    - Query project_requests where client_id matches
    - Apply status filter if provided
    - Include attachments via join or separate query
    - Return array of requests with attachments
  - [ ] 4.5 Create getPendingProjectRequests function
    - Create function: `getPendingProjectRequests()`
    - Query project_requests where status = 'pending'
    - Include client info via join
    - Include attachments
    - Return array of pending requests
  - [ ] 4.6 Create approveProjectRequest function
    - Create function: `approveProjectRequest(requestId: string, requiresPayment: boolean, invoiceId?: string)`
    - Update request status to 'approved'
    - If requiresPayment: create project with status 'awaiting_payment', link invoice
    - If not requiresPayment: create project with status 'approved'
    - Create project using existing `createProject()` function
    - Assign client_id, set created_by, set payment_preference
    - Generate tracking code (reuse existing function)
    - Link request to project via project_id
    - Return created project
  - [ ] 4.7 Create denyProjectRequest function
    - Create function: `denyProjectRequest(requestId: string, reason?: string)`
    - Update request status to 'denied'
    - Set denial_reason if provided
    - Return updated request
  - [ ] 4.8 Create getProjectRequestById function
    - Create function: `getProjectRequestById(id: string)`
    - Query project_requests by id
    - Include attachments via join
    - Include client info
    - Return request with all related data
  - [ ] 4.9 Ensure project requests function tests pass
    - Run ONLY the 5-6 tests written in 4.1
    - Verify all functions work correctly

**Acceptance Criteria:**
- The 5-6 tests written in 4.1 pass
- All project request functions work correctly
- Functions handle errors gracefully
- RLS policies are respected

---

#### Task Group 5: Project Status Update Functions
**Dependencies:** Task Group 2

- [x] 5.0 Complete project status update functions
  - [ ] 5.1 Write 4-5 focused tests for project status functions
    - Test: updateProjectStatus updates status correctly
    - Test: markDepositPaid updates status and deposit_paid flag
    - Test: getProjectsByStatus filters by status correctly
    - Test: Functions handle invalid project IDs
    - Test: Functions respect RLS policies
  - [ ] 5.2 Create updateProjectStatus function
    - Create function in `src/lib/db/projects.ts`
    - Function: `updateProjectStatus(projectId: string, status: string, metadata?: object)`
    - Update project status field
    - Store additional metadata if provided
    - Return updated project
    - Error handling for invalid status values
  - [ ] 5.3 Create markDepositPaid function
    - Create function: `markDepositPaid(projectId: string, invoiceId: string)`
    - Update project: status = 'approved', deposit_paid = true
    - Link invoice_id if not already linked
    - Return updated project
    - Error handling for invalid project or invoice
  - [ ] 5.4 Create getProjectsByStatus function
    - Create function: `getProjectsByStatus(status: string)`
    - Query projects where status matches
    - Include client info via join
    - Include related data (phases, tasks if needed)
    - Return array of projects
  - [ ] 5.5 Extend createProject function
    - Update existing `createProject()` in `src/lib/db/projects.ts`
    - Add support for `created_by` field
    - Add support for `payment_preference` field
    - Set default status based on created_by (client = 'pending_approval', admin = 'draft')
    - Maintain backward compatibility with existing calls
  - [ ] 5.6 Ensure project status function tests pass
    - Run ONLY the 4-5 tests written in 5.1
    - Verify all functions work correctly

**Acceptance Criteria:**
- The 4-5 tests written in 5.1 pass
- All project status functions work correctly
- createProject supports client-created projects
- Functions handle errors gracefully

---

#### Task Group 6: File Upload Functions
**Dependencies:** Task Group 3

- [x] 6.0 Complete file upload functions for project requests
  - [ ] 6.1 Write 3-4 focused tests for file upload functions
    - Test: uploadProjectRequestAttachment uploads file to storage
    - Test: uploadProjectRequestAttachment validates file type
    - Test: uploadProjectRequestAttachment validates file size
    - Test: uploadProjectRequestAttachment stores metadata in database
  - [ ] 6.2 Create uploadProjectRequestAttachment function
    - Create function in `src/lib/storage.ts` or new file
    - Function: `uploadProjectRequestAttachment(file: File, requestId: string)`
    - Validate file type (PDF, images only)
    - Validate file size (max 50MB)
    - Upload to Supabase Storage bucket 'project-request-attachments'
    - Store file metadata in project_request_attachments table
    - Return file URL and metadata
    - Error handling for validation and upload failures
  - [ ] 6.3 Create deleteProjectRequestAttachment function
    - Create function: `deleteProjectRequestAttachment(attachmentId: string)`
    - Delete file from storage bucket
    - Delete metadata from database
    - Error handling for missing files
  - [ ] 6.4 Create getProjectRequestAttachments function
    - Create function: `getProjectRequestAttachments(requestId: string)`
    - Query project_request_attachments for request
    - Return array of attachments with URLs
  - [ ] 6.5 Ensure file upload function tests pass
    - Run ONLY the 3-4 tests written in 6.1
    - Verify file upload and validation work

**Acceptance Criteria:**
- The 3-4 tests written in 6.1 pass
- File upload validates type and size correctly
- Files are stored in correct bucket
- Metadata is stored in database

---

### Frontend - Client Side

#### Task Group 7: Client Project Creation Form
**Dependencies:** Task Group 4, Task Group 6

- [x] 7.0 Complete client project creation form
  - [ ] 7.1 Write 4-5 focused tests for client project creation form
    - Test: Form renders all required fields
    - Test: Form validation works (required fields, file types, file size)
    - Test: Form submission creates project with correct status
    - Test: File upload works correctly
    - Test: Form shows success message and redirects
  - [ ] 7.2 Create ClientProjectForm component
    - Create component: `src/components/client/ClientProjectForm.tsx`
    - Use React Hook Form + Zod validation
    - Form fields: title (required), description (required), category (select), tech stack (array), budget range (optional), timeline (optional), special requirements (optional), payment preference (select), file attachments
    - File upload component with validation
    - Follow patterns from `ProjectForm.tsx`
    - Use shadcn/ui components (Input, Textarea, Select, Button, etc.)
  - [ ] 7.3 Create CreateProjectPage component
    - Create page: `src/pages/client/CreateProjectPage.tsx`
    - Use ClientLayout wrapper
    - Display form in Card component
    - Handle form submission
    - Call `createProjectRequest()` or `createProject()` function
    - Show loading states
    - Show success toast and redirect to "My Projects"
    - Error handling with toast notifications
  - [ ] 7.4 Add "Create Project" button to My Projects page
    - Update `src/pages/client/MyProjectsPage.tsx`
    - Add "Create Project" or "New Project" button
    - Link to `/dashboard/projects/new`
    - Style consistently with existing buttons
  - [ ] 7.5 Add route for project creation
    - Update `src/routes.tsx`
    - Add route: `/dashboard/projects/new` → CreateProjectPage
    - Ensure route is protected (client role required)
  - [ ] 7.6 Ensure client project creation form tests pass
    - Run ONLY the 4-5 tests written in 7.1
    - Verify form works end-to-end

**Acceptance Criteria:**
- The 4-5 tests written in 7.1 pass
- Form validates all fields correctly
- Form submission creates project with status 'pending_approval'
- File upload works with validation
- User sees success message and is redirected

---

#### Task Group 8: Client Request History Page
**Dependencies:** Task Group 4

- [x] 8.0 Complete client request history page
  - [ ] 8.1 Write 3-4 focused tests for request history page
    - Test: Page displays client's requests
    - Test: Filtering by status works
    - Test: Status badges display correctly
    - Test: Clicking request shows details
  - [ ] 8.2 Create MyRequestsPage component
    - Create page: `src/pages/client/MyRequestsPage.tsx`
    - Use ClientLayout wrapper
    - Fetch requests using `getProjectRequestsForClient()`
    - Display requests in table or card format
    - Show: title, category, status badge, created date, admin response
    - Filter options: all, pending, approved, denied
    - Empty state for no requests
  - [ ] 8.3 Create RequestDetailModal or RequestDetailPage
    - Create component to show full request details
    - Display: full description, attachments (with preview/download), admin notes, denial reason (if denied)
    - Use shadcn/ui Dialog or separate page
  - [ ] 8.4 Create status badge components
    - Create reusable StatusBadge component or use existing
    - Colors: "Pending Approval" (yellow), "Approved" (green), "Denied" (red), "Needs Info" (blue)
    - Use shadcn/ui Badge component
  - [ ] 8.5 Add "My Requests" link to ClientLayout
    - Update `src/layouts/ClientLayout.tsx`
    - Add to `clientNavLinks` array: `{ name: 'My Requests', href: '/dashboard/requests', icon: ClipboardList }`
    - Place between "My Projects" and "Portfolio"
  - [ ] 8.6 Add route for request history
    - Update `src/routes.tsx`
    - Add route: `/dashboard/requests` → MyRequestsPage
    - Ensure route is protected (client role required)
  - [ ] 8.7 Ensure client request history tests pass
    - Run ONLY the 3-4 tests written in 8.1
    - Verify page displays and filters correctly

**Acceptance Criteria:**
- The 3-4 tests written in 8.1 pass
- Page displays all client requests
- Filtering works correctly
- Status badges display with correct colors
- Request details are accessible

---

### Frontend - Admin Side

#### Task Group 9: Admin Project Approval Queue
**Dependencies:** Task Group 4, Task Group 5

- [ ] 9.0 Complete admin project approval queue
  - [ ] 9.1 Write 4-5 focused tests for admin approval queue
    - Test: Page displays pending projects
    - Test: Filtering works (all pending, payment required, unpaid)
    - Test: Project details modal/page shows all information
    - Test: Action dropdown displays correct options
  - [ ] 9.2 Create PendingProjectsPage component
    - Create page: `src/pages/admin/PendingProjectsPage.tsx` OR add filter to existing ProjectList
    - Use AdminLayout wrapper
    - Fetch pending projects using `getProjectsByStatus('pending_approval')`
    - Display in table format: title, client name, category, payment preference, created date, actions
    - Filter options: all pending, payment required, unpaid suggestions
    - Follow patterns from `ProjectList.tsx`
  - [ ] 9.3 Create ProjectApprovalModal or ProjectApprovalPage
    - Create component to show full project details for approval
    - Display: description, attachments (with preview), client info, budget range, timeline, special requirements, payment preference
    - Action buttons: Approve with Payment, Approve without Payment, Deny, Request More Info
    - Use shadcn/ui Dialog or separate page
  - [ ] 9.4 Create approval action handlers
    - Create functions to handle approval actions
    - "Approve with Payment": Update project status, create invoice, send notifications
    - "Approve without Payment": Update project status, send notifications
    - "Deny": Update project status with reason, send notifications
    - "Request More Info": Update request status to 'needs_info', send notification
    - Use React Query mutations
    - Show loading states and success/error toasts
  - [ ] 9.5 Add filter to existing ProjectList (if not creating separate page)
    - Update `src/pages/admin/ProjectList.tsx`
    - Add filter dropdown: All Projects, Pending Approval, Active Projects, etc.
    - Filter by status using `getProjectsByStatus()`
  - [ ] 9.6 Add route for pending projects
    - Update `src/routes.tsx`
    - Add route: `/admin/projects/pending` → PendingProjectsPage (if separate page)
    - OR ensure existing `/admin/projects` supports filtering
  - [ ] 9.7 Ensure admin approval queue tests pass
    - Run ONLY the 4-5 tests written in 9.1
    - Verify queue displays and actions work

**Acceptance Criteria:**
- The 4-5 tests written in 9.1 pass
- Page displays all pending projects
- Filtering works correctly
- Approval actions update project status correctly
- Notifications are sent appropriately

---

#### Task Group 10: Navigation Updates
**Dependencies:** None

- [x] 10.0 Complete navigation updates
  - [ ] 10.1 Write 2-3 focused tests for navigation
    - Test: AdminLayout shows "Invoices" link
    - Test: ClientLayout shows "My Requests" link
    - Test: Navigation links route correctly
  - [ ] 10.2 Add "Invoices" link to AdminLayout
    - Update `src/layouts/AdminLayout.tsx`
    - Add to `adminNavLinks` array: `{ name: 'Invoices', href: '/admin/invoices', icon: FileText }`
    - Import FileText icon from lucide-react
    - Ensure link is visible in desktop and mobile menus
  - [ ] 10.3 Add "My Requests" link to ClientLayout
    - Update `src/layouts/ClientLayout.tsx`
    - Add to `clientNavLinks` array: `{ name: 'My Requests', href: '/dashboard/requests', icon: ClipboardList }`
    - Import ClipboardList icon from lucide-react
    - Place between "My Projects" and "Portfolio" in array order
    - Ensure link is visible in desktop and mobile menus
  - [ ] 10.4 Verify existing routes are accessible
    - Verify `/admin/invoices` routes work (already exist)
    - Verify `/dashboard/billing` routes work (already exist)
    - Test navigation from new links
  - [ ] 10.5 Ensure navigation tests pass
    - Run ONLY the 2-3 tests written in 10.1
    - Verify links appear and route correctly

**Acceptance Criteria:**
- The 2-3 tests written in 10.1 pass
- "Invoices" link appears in AdminLayout navigation
- "My Requests" link appears in ClientLayout navigation
- Links route to correct pages
- Mobile menu includes new links

---

### Payment Integration

#### Task Group 11: Payment Webhook Integration
**Dependencies:** Task Group 5

- [ ] 11.0 Complete payment webhook integration for project approval
  - [ ] 11.1 Write 3-4 focused tests for payment webhook
    - Test: Webhook updates project status on successful payment
    - Test: Webhook sets deposit_paid flag
    - Test: Webhook creates activity log entry
    - Test: Webhook sends notifications
  - [ ] 11.2 Extend Stripe webhook handler
    - Update `supabase/functions/stripe-webhook/index.ts`
    - In `payment_intent.succeeded` handler: Check if invoice has project_id
    - In `checkout.session.completed` handler: Check if invoice has project_id
    - If project_id exists and project status is 'awaiting_payment': Call `markDepositPaid()`
    - Update project status to 'approved'
  - [ ] 11.3 Add project status update logic
    - After payment succeeds: Update project status
    - Set deposit_paid = true
    - Link invoice_id if not already linked
    - Create activity log entry: 'project_deposit_paid'
    - Include project_id and invoice_id in event_data
  - [ ] 11.4 Add notification triggers
    - After project status update: Send email to admin
    - After project status update: Send email to client
    - Create in-app notifications for both parties
    - Use existing notification system
  - [ ] 11.5 Test webhook integration
    - Test with Stripe webhook test events
    - Verify project status updates correctly
    - Verify notifications are sent
    - Verify activity log entries are created
  - [ ] 11.6 Ensure payment webhook tests pass
    - Run ONLY the 3-4 tests written in 11.1
    - Verify webhook integration works end-to-end

**Acceptance Criteria:**
- The 3-4 tests written in 11.1 pass
- Webhook updates project status on payment
- deposit_paid flag is set correctly
- Notifications are sent to admin and client
- Activity log entries are created

---

### Notifications & Activity

#### Task Group 12: Email Notifications & Activity Logging
**Dependencies:** Task Group 4, Task Group 5

- [ ] 12.0 Complete email notifications and activity logging
  - [ ] 12.1 Write 3-4 focused tests for notifications
    - Test: Project created notification sent to admin
    - Test: Project approved notification sent to client
    - Test: Project denied notification sent to client with reason
    - Test: Deposit paid notification sent to admin and client
  - [ ] 12.2 Extend notification_type enum
    - Update migration or create new migration
    - Add enum values: 'project_created', 'project_approved_pending_payment', 'project_approved', 'project_denied', 'project_deposit_paid'
    - Update `src/lib/db/types/dashboard.ts` NotificationType type
  - [ ] 12.3 Create email notification functions
    - Create or update email notification functions
    - Project created: "New project pending approval" → admin
    - Project approved (with payment): "Project approved - deposit required" → client (include invoice link)
    - Project approved (without payment): "Project approved" → client
    - Project denied: "Project denied" → client (include denial reason)
    - Deposit paid: "Deposit received - project officially approved" → admin and client
    - Use existing email infrastructure (Resend or similar)
  - [ ] 12.4 Extend activity_log_event_type enum
    - Update migration or create new migration
    - Add enum values: 'project_created', 'project_approved', 'project_denied', 'project_deposit_paid', 'project_status_changed'
    - Update `src/lib/db/types/dashboard.ts` ActivityLogEventType type
  - [ ] 12.5 Add activity logging calls
    - Add `logActivity()` calls in project creation flow
    - Add `logActivity()` calls in approval/denial flow
    - Add `logActivity()` calls in payment flow
    - Include relevant metadata (project_id, status, invoice_id if applicable)
    - Use existing `logActivity()` function from `src/lib/db/activityLog.ts`
  - [ ] 12.6 Create in-app notifications
    - Use `createNotification()` function for project lifecycle events
    - Create notifications when: project created, approved, denied, deposit paid
    - Include project details and relevant links
    - Use existing notification system
  - [ ] 12.7 Ensure notification tests pass
    - Run ONLY the 3-4 tests written in 12.1
    - Verify notifications are sent correctly

**Acceptance Criteria:**
- The 3-4 tests written in 12.1 pass
- Email notifications are sent for all project lifecycle events
- Activity log entries are created for all events
- In-app notifications are created
- Notification types are properly extended

---

### Public Tracking

#### Task Group 13: Public Project Tracking Verification
**Dependencies:** None

- [ ] 13.0 Verify public project tracking works
  - [ ] 13.1 Write 2-3 focused tests for public tracking
    - Test: Unauthenticated users can access `/track/:code`
    - Test: Tracking page displays project information
    - Test: Invalid tracking codes show error message
  - [ ] 13.2 Verify RLS policies for public tracking
    - Check existing RLS policies on projects table
    - Verify public can SELECT projects with active tracking codes
    - Verify public can SELECT project_phases, project_tasks for projects with active tracking codes
    - Verify public can SELECT project_attachments for projects with active tracking codes
  - [ ] 13.3 Test public tracking page
    - Test `/track/:code` route with valid code (unauthenticated)
    - Verify project title, phases, tasks, notes, attachments are displayed
    - Test with invalid/expired code
    - Verify error message displays correctly
  - [ ] 13.4 Ensure public tracking tests pass
    - Run ONLY the 2-3 tests written in 13.1
    - Verify public access works correctly

**Acceptance Criteria:**
- The 2-3 tests written in 13.1 pass
- Unauthenticated users can access tracking page
- Project information displays correctly
- Invalid codes show appropriate error

---

## Summary

This task breakdown covers:
- Database schema for project requests and projects table updates
- File storage setup for attachments
- API layer functions for project requests and status updates
- Client-side project creation form and request history
- Admin-side approval queue and workflow
- Navigation updates for both layouts
- Payment webhook integration
- Email notifications and activity logging
- Public tracking verification

Total: 13 Task Groups with comprehensive subtasks and acceptance criteria.

