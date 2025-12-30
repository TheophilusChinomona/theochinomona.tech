# Specification: Client Project Requests & Approval Workflow

## Goal

Enable clients to create projects directly from their dashboard and request quotes, with a comprehensive admin approval workflow that supports both paid and unpaid projects. Integrate payment-before-approval flow for projects requiring deposits, and provide navigation access to existing payment routes. Support public project tracking for unauthenticated users via tracking codes.

## User Stories

- As a client, I want to create projects directly from my dashboard so that I can initiate new work without waiting for admin approval first.
- As a client, I want to request quotes for new projects with file attachments so that I can provide detailed requirements and get accurate pricing.
- As a client, I want to see the status of my project requests (pending, approved, denied) so that I know where my projects stand in the approval process.
- As an admin, I want to review and approve/deny client-created projects so that I can control which projects move forward.
- As an admin, I want to determine if a project requires payment and create invoices for deposits so that I can ensure payment before officially approving projects.
- As an admin, I want to access invoice management routes from the navigation so that I can manage billing efficiently.
- As a client, I want to pay deposits via Stripe Checkout so that I can officially approve my projects and begin work.
- As a visitor, I want to track project progress using tracking codes without logging in so that I can share project status with stakeholders.

## Specific Requirements

**Database Schema - Project Requests**
- Create `project_requests` table with fields: `id` (UUID), `client_id` (FK to users), `title` (text), `description` (text), `category` (text/enum), `budget_range` (text nullable), `timeline` (text nullable), `special_requirements` (text nullable), `status` (enum: 'pending', 'approved', 'denied', 'needs_info'), `admin_notes` (text nullable), `denial_reason` (text nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
- Create `project_request_attachments` table with fields: `id` (UUID), `request_id` (FK to project_requests, ON DELETE CASCADE), `file_url` (text), `file_name` (text), `file_type` (enum: 'pdf', 'image'), `file_size` (bigint - bytes), `created_at` (timestamptz)
- Enable RLS: clients can SELECT their own requests, admins can manage all
- Create indexes on `project_requests.client_id`, `project_requests.status`, `project_request_attachments.request_id`
- Link to existing `projects` table when approved (project_id FK nullable)

**Database Schema - Projects Table Updates**
- Extend `projects` table status enum to include: 'pending_approval', 'awaiting_payment' (or 'approved_pending_payment'), 'approved', 'denied', 'draft', 'published'
- Add `created_by` field (UUID, FK to users, nullable): tracks who created the project (admin vs client)
- Add `payment_preference` field (text/enum): 'upfront_deposit', 'milestone_based' - set by client as preference
- Add `requires_payment` field (boolean, nullable): set by ADMIN during review (not by client)
- Add `deposit_paid` field (boolean, default false): indicates if deposit has been paid
- Add `invoice_id` field (UUID, FK to invoices, nullable): links to deposit invoice (only if payment required)
- Update existing status enum migration or create new migration to extend status values
- Client-created projects: status = 'pending_approval', created_by = client_id, payment_preference set by client, requires_payment = null (admin decides)

**Client Project Creation Form**
- Create `/dashboard/projects/new` route with project creation form
- Add "Create Project" or "New Project" button to "My Projects" page (`src/pages/client/MyProjectsPage.tsx`)
- Form fields: title (required), description (required), category (select: Web, Mobile, Full-Stack, Design), tech stack (array input), budget range (text optional), timeline (text optional), special requirements (textarea optional), payment preference (select: upfront deposit, milestone-based), file attachments (PDFs and images only, max 50MB per file)
- Use React Hook Form + Zod validation following existing `ProjectForm.tsx` patterns
- File upload component: validate file types (PDF, JPG, PNG, GIF, WebP), enforce 50MB size limit, upload to Supabase Storage bucket `project-request-attachments`
- Store file metadata in `project_request_attachments` table
- On submit: create project record with status 'pending_approval', created_by = current user_id
- Display success toast and redirect to "My Projects" page
- Show validation errors inline using shadcn/ui Alert components

**Client Request History**
- Add "My Requests" or "Request Quote" link to ClientLayout navigation (`src/layouts/ClientLayout.tsx`)
- Create `/dashboard/requests` route showing client's project requests
- Display requests in table/card format with: title, category, status badge, created date, admin response (if any)
- Filter options: all, pending, approved, denied
- Click request to view details: full description, attachments, admin notes, denial reason (if denied)
- Show status badges: "Pending Approval" (yellow), "Approved" (green), "Denied" (red), "Needs Info" (blue)
- Empty state for clients with no requests

**Admin Project Approval Queue**
- Create `/admin/projects/pending` route or add filter to existing `/admin/projects` route
- Display client-created projects with status 'pending_approval' in table/list view
- Table columns: title, client name, category, payment preference, created date, actions
- Filter options: all pending, payment required, unpaid suggestions
- Click project to view full details: description, attachments, client info, budget range, timeline, special requirements
- Admin actions dropdown: Approve with Payment, Approve without Payment, Deny, Request More Info

**Admin Project Approval Workflow - Payment Required**
- When admin selects "Approve with Payment":
  - Admin marks project: requires_payment = true
  - Status changes to 'awaiting_payment' or 'approved_pending_payment'
  - Admin creates invoice (deposit amount) using existing invoice creation UI
  - Invoice is linked to project via project_id field
  - Invoice status: 'sent'
  - Client receives invoice notification (email + in-app)
  - Project remains in 'awaiting_payment' status until deposit is paid
- When client pays deposit via Stripe Checkout:
  - Payment webhook handler updates project status from 'awaiting_payment' to 'approved'
  - Sets deposit_paid = true
  - Sends email notifications to admin and client
  - Creates in-app notifications
  - Logs activity: 'project_deposit_paid'
- Only after deposit payment: Admin can add phases, tasks, and continue project setup

**Admin Project Approval Workflow - No Payment Required**
- When admin selects "Approve without Payment":
  - Admin marks project: requires_payment = false
  - Status changes directly to 'approved' or 'active'
  - No invoice created, no payment required
  - Client receives approval notification (email + in-app)
  - Admin can immediately add phases, tasks, and continue project setup
  - These are treated as suggestions/volunteer projects

**Admin Project Denial Workflow**
- When admin selects "Deny":
  - Status changes to 'denied'
  - Admin can optionally provide denial reason (textarea)
  - Client receives denial notification (email + in-app) with reason if provided
  - Project remains visible to client in "My Projects" with "Denied" status badge
  - Admin can add notes for internal reference

**Payment Webhook Integration**
- Extend existing Stripe webhook handler (`supabase/functions/stripe-webhook/index.ts`)
- When payment_intent.succeeded or checkout.session.completed event received:
  - Check if invoice is linked to a project (project_id not null)
  - Check if project status is 'awaiting_payment'
  - Update project: status = 'approved', deposit_paid = true
  - Create activity log entry: 'project_deposit_paid' with project_id and invoice_id
  - Send email notifications to admin and client
  - Create in-app notifications for both parties

**Navigation Updates**
- Add "Invoices" link to AdminLayout navigation (`src/layouts/AdminLayout.tsx`)
  - Add to `adminNavLinks` array: `{ name: 'Invoices', href: '/admin/invoices', icon: FileText }`
  - Routes already exist: `/admin/invoices`, `/admin/invoices/new`, `/admin/invoices/:id`
- Add "My Requests" link to ClientLayout navigation (`src/layouts/ClientLayout.tsx`)
  - Add to `clientNavLinks` array: `{ name: 'My Requests', href: '/dashboard/requests', icon: ClipboardList }`
  - Place between "My Projects" and "Portfolio" in navigation order

**Public Project Tracking**
- Verify `/track/:code` route works for unauthenticated users (already exists)
- Ensure RLS policies allow public SELECT access to projects with active tracking codes
- Public tracking page should display: project title, phases, tasks, notes, attachments
- No authentication required to access tracking page
- Display "Invalid or expired tracking code" for inactive/missing codes

**Email Notifications**
- Extend `notification_type` enum to include: 'project_created', 'project_approved_pending_payment', 'project_approved', 'project_denied', 'project_deposit_paid'
- Create email templates for:
  - Project created: "New project pending approval" → admin
  - Project approved (with payment): "Project approved - deposit required" → client (includes invoice link)
  - Project approved (without payment): "Project approved" → client
  - Project denied: "Project denied" → client (includes denial reason if provided)
  - Deposit paid: "Deposit received - project officially approved" → admin and client
- Use existing email infrastructure (Resend or similar)
- Include project details, tracking code (if applicable), and relevant links in emails

**Activity Logging**
- Extend `activity_log_event_type` enum to include: 'project_created', 'project_approved', 'project_denied', 'project_deposit_paid', 'project_status_changed'
- Log all project lifecycle events to activity log with relevant metadata (project_id, status, invoice_id if applicable)
- Use existing `logActivity()` function from `src/lib/db/activityLog.ts`
- Display project activity in client dashboard and admin dashboard

**File Storage**
- Create Supabase Storage bucket `project-request-attachments` if not exists
- Configure RLS policies: clients can upload their own files, admins can view all, public can view files for approved projects
- File validation: PDF and images only (JPG, PNG, GIF, WebP)
- Maximum file size: 50MB per file
- Store file metadata in `project_request_attachments` table
- Display file thumbnails for images, download links for PDFs

**API Layer - Project Requests**
- Create `src/lib/db/projectRequests.ts` with functions:
  - `createProjectRequest(data)` - creates new request
  - `getProjectRequestsForClient(clientId, filters?)` - returns client's requests
  - `getPendingProjectRequests()` - returns all pending requests for admin
  - `approveProjectRequest(requestId, requiresPayment, invoiceId?)` - approves request
  - `denyProjectRequest(requestId, reason?)` - denies request
  - `getProjectRequestById(id)` - returns single request with attachments
- Follow existing database patterns from `src/lib/db/projects.ts`

**API Layer - Project Status Updates**
- Create `src/lib/db/projects.ts` functions:
  - `updateProjectStatus(projectId, status, metadata?)` - updates project status
  - `markDepositPaid(projectId, invoiceId)` - marks deposit as paid and updates status
  - `getProjectsByStatus(status)` - returns projects filtered by status
- Extend existing `createProject()` to support client-created projects (created_by field)

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**ProjectForm Component (`src/components/admin/ProjectForm.tsx`)**
- Reuse form structure, validation patterns, and field components
- Adapt for client project creation form (remove admin-only fields, add payment preference)
- Follow same React Hook Form + Zod validation patterns
- Use same file upload handling for attachments

**ProjectList Component (`src/pages/admin/ProjectList.tsx`)**
- Reuse table/list view patterns for admin approval queue
- Follow same status badge patterns and filtering logic
- Use same action dropdown patterns for approve/deny actions

**ClientLayout (`src/layouts/ClientLayout.tsx`)**
- Add "My Requests" navigation item following existing pattern
- Reuse navigation structure and mobile menu patterns
- Follow same styling: zinc-950 background, indigo accents

**AdminLayout (`src/layouts/AdminLayout.tsx`)**
- Add "Invoices" navigation item following existing pattern
- Routes already exist, just need navigation link

**Invoice Creation (`src/components/admin/InvoiceForm.tsx`, `src/lib/db/invoices.ts`)**
- Reuse existing invoice creation system for deposit invoices
- Link invoices to projects via project_id field (already supported)
- Use existing Stripe Checkout integration

**Payment Webhook (`supabase/functions/stripe-webhook/index.ts`)**
- Extend existing webhook handler to update project status on payment
- Add project status update logic when invoice payment succeeds
- Follow existing webhook signature verification patterns

**Notification System (`src/lib/db/notifications.ts`, `src/components/client/NotificationBell.tsx`)**
- Extend `NotificationType` enum with project-related types
- Use `createNotification()` function for project lifecycle events
- Reuse notification display patterns

**Activity Logging (`src/lib/db/activityLog.ts`)**
- Extend `ActivityLogEventType` enum with project events
- Use `logActivity()` function for all project lifecycle activities
- Follow same JSONB `event_data` pattern

**Database Patterns (`src/lib/db/projects.ts`, `src/lib/db/users.ts`)**
- Follow TypeScript interface patterns for new types
- Replicate Supabase query patterns: `.select()`, `.insert()`, `.update()`, `.eq()`, `.order()`
- Use same error handling: `if (error) throw new Error(...)`
- Follow RLS policy patterns from existing migrations

**Tracking Code System (`src/lib/db/tracking.ts`)**
- Reuse existing tracking code generation for approved projects
- Ensure public access works for unauthenticated users
- Verify RLS policies allow public SELECT

## Out of Scope

- Guided quote builder with service selection (Phase 9 spec)
- Price estimation calculator (Phase 9 spec)
- Real-time messaging between client and admin (Phase 8 spec)
- Request templates or cloning functionality
- Bulk request operations (bulk approve/deny)
- Request scheduling or automation
- Advanced payment terms negotiation
- Multiple deposit installments (single deposit only)
- Project request versioning or history
- Client comments or feedback on requests
- Request assignment to multiple admins
- Request priority or urgency flags
- Automatic project creation from templates
- Project request analytics or reporting

