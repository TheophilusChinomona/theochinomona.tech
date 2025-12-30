# Spec Requirements: Client Project Requests & Approval Workflow

## Initial Description

Clients should be able to create projects or request a quote, and admins should be able to approve or deny these project requests. Additionally, payment functionality was implemented but no routes were created to access it.

## Requirements Discussion

### First Round Questions

**Q1:** I assume "create project" and "request quote" are two separate flows. Should "request quote" be a simpler form (project description, budget range, timeline) that becomes a project after approval, while "create project" is a full project creation with phases/tasks? Or should they be the same flow with different approval paths?
**Answer:** Same flow and both are approved the same way.

**Q2:** For the client request form, I'm thinking it should include: project title, description, category/type, estimated budget range, timeline/deadline, and any special requirements. Should we also collect client contact info (if not logged in) or company details?
**Answer:** Yes to collecting client contact info and company details.

**Q3:** After a client submits a request, I assume it should appear in an admin queue/list with status "pending". Should admins be able to: view request details, approve (which creates the project), deny (with optional reason), and request more information? Is that correct?
**Answer:** Correct - admins can view request details, approve (which creates the project), deny (with optional reason), and request more information.

**Q4:** When an admin approves a request, should it automatically: create a project record, assign the client to the project, generate a tracking code, and notify the client? Or should approval just change the status and require manual project creation?
**Answer:** It is automatic - when approved, it creates a project record, assigns the client to the project, generates a tracking code, and notifies the client.

**Q5:** For payment routes, I see `/dashboard/billing` and `/admin/invoices` routes already exist in the codebase. Are these routes not working, or are you referring to different payment-related routes that should exist? For example, should there be routes for: requesting quotes with payment terms, viewing payment history, or accessing payment forms from project requests?
**Answer:** They might be working but they are not shown on the frontend nav bar or anything like that, especially admin invoices. There is no way to navigate to there.

**Q6:** Should clients be able to view their own request history (pending, approved, denied) in their dashboard? Should there be a "My Requests" or "Quote Requests" section?
**Answer:** Yes to all - clients should be able to view their request history (pending, approved, denied) in their dashboard with a "My Requests" or "Quote Requests" section.

**Q7:** Should there be email notifications when: a request is submitted (to admin), a request is approved (to client), a request is denied (to client with reason)? Or should notifications be in-app only?
**Answer:** Email notifications as well - when a request is submitted (to admin), when a request is approved (to client), and when a request is denied (to client with reason).

**Q8:** For the quote request flow, should clients be able to attach files (project briefs, mockups, requirements docs) when submitting? Should there be a file size limit or file type restrictions?
**Answer:** Yes, PDFs and images only, not more than 50MB.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Project Creation Form - Path: `src/components/admin/ProjectForm.tsx`
  - Components to potentially reuse: Form structure, validation patterns, file upload handling
  - Backend logic to reference: `src/lib/db/projects.ts` - `createProject()` function
- Feature: Invoice Form - Path: `src/components/admin/InvoiceForm.tsx`
  - Components to potentially reuse: Form patterns, client selection dropdown
- Feature: Admin Project List - Path: `src/pages/admin/ProjectList.tsx`
  - Components to potentially reuse: Table/list view patterns, status badges, action buttons
- Feature: Client Dashboard Navigation - Path: `src/layouts/ClientLayout.tsx`
  - Components to potentially reuse: Navigation structure, "My Requests" section can follow similar pattern to "My Projects"

### Follow-up Questions

No follow-up questions needed - all requirements are clear.

### Additional Requirements (Added After Initial Questions)

**Additional Requirement 1:** Clients should be able to create projects directly on their dashboard in "My Projects" section (not just request them for approval).

**Additional Requirement 2:** "Track progress" functionality should be available for non-signed-in members (unauthenticated users should be able to track project progress, likely using tracking codes).

**Additional Requirement 3 (Workflow Clarification):** When a client creates a project, the workflow is:
1. Client creates project → project status is "pending approval"
2. Admin sees the project in admin site and can approve or deny
3. If approved, admin can then add phases, tasks, and billing (if billing is needed)
4. Client sees the status update on their project (pending → approved/denied)

**Additional Requirement 4 (Payment Integration - CLARIFIED):** Payment workflow:
1. Payment is required BEFORE official approval: Client creates project → Admin approves and sends billing/invoice → Client pays deposit → Project officially approved (only after deposit payment)
2. Clients can indicate payment preference (upfront, milestone-based, etc.) when creating the project
3. Different workflows for paid vs. unpaid projects: Unpaid projects are just suggestions, admin can approve or not, status updates accordingly

**Additional Requirement 1:** Clients should be able to create projects directly on their dashboard in "My Projects" section (not just request them for approval).

**Additional Requirement 2:** "Track progress" functionality should be available for non-signed-in members (unauthenticated users should be able to track project progress, likely using tracking codes).

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets to analyze.

## Requirements Summary

### Functional Requirements

- **Client Project/Quote Request Form:**
  - Single unified flow for both "create project" and "request quote"
  - Form fields: project title, description, category/type, estimated budget range, timeline/deadline, special requirements
  - Client contact info collection (name, email, phone, company details)
  - File attachments: PDFs and images only, max 50MB per file
  - Submit request which creates a pending request record

- **Admin Request Approval Workflow (Quote/Request Flow):**
  - Admin queue/list showing all pending requests with status badges
  - Admin can view full request details including attachments
  - Admin actions: Approve (automatically creates project, assigns client, generates tracking code, notifies client), Deny (with optional reason, notifies client), Request More Information (sends message to client)
  - Request statuses: pending, approved, denied, needs_info
  - When approved, project is created and admin can then add phases, tasks, and billing

- **Automatic Project Creation on Approval (Request Flow):**
  - When admin approves a request: automatically creates project record, assigns client_id to project, generates tracking code, sends email notification to client, creates in-app notification
  - Project starts in "approved" or "draft" status, ready for admin to add phases, tasks, and billing

- **Project Status Management:**
  - Project statuses: 
    - "pending_approval" (client-created, awaiting admin review)
    - "awaiting_payment" or "approved_pending_payment" (admin approved WITH payment required, invoice sent, waiting for deposit)
    - "approved" or "active" (deposit paid OR admin approved WITHOUT payment, project officially approved, ready for phases/tasks)
    - "denied" (admin rejected)
    - "draft" (admin-created, not published)
    - "published" (active project, visible publicly)
  - Client-created projects start as "pending_approval"
  - **Admin decides payment requirement** during review
  - Admin can change status: 
    - pending_approval → awaiting_payment (if admin determines payment required)
    - pending_approval → approved/active (if admin determines no payment required)
    - pending_approval → denied (admin rejects)
  - After deposit payment: awaiting_payment → approved/active
  - Only after official approval (deposit paid OR admin approved without payment): Admin can set up project (phases, tasks, billing)
  - Unpaid projects: Admin determines "no payment required" and approves directly

- **Client Request History:**
  - "My Requests" or "Quote Requests" section in client dashboard
  - Display request history: pending, approved, denied requests
  - Show request details, status, admin responses/reasons

- **Client Direct Project Creation:**
  - Clients can create projects directly from "My Projects" page in their dashboard
  - "Create Project" or "New Project" button on My Projects page
  - Form includes: project title, description, category, tech stack, budget range, timeline, special requirements, file attachments
  - **Payment preference field**: Client can indicate payment preference (upfront deposit, milestone-based) - this is just a preference, admin decides if payment is required
  - When client submits, project is created with status "pending approval"
  - Projects created by clients appear in their "My Projects" list with status badges:
    - "Pending Approval" (awaiting admin review)
    - "Awaiting Payment" (admin approved, invoice sent, waiting for deposit)
    - "Approved" (deposit paid, project officially approved)
    - "Denied" (admin rejected)
  - Client can see project status updates throughout the workflow

- **Admin Project Approval Workflow:**
  - Admin sees client-created projects in admin dashboard (filter by status "pending approval")
  - Admin can view full project details including client info, description, attachments, budget range, payment preference
  - **Admin decides if payment is required** (not determined by client)
  - Admin actions: 
    - **Approve project WITH payment required**: 
      - Admin marks project as requiring payment
      - Changes status to "awaiting_payment" or "approved_pending_payment"
      - Admin creates invoice/billing (deposit amount) and sends to client (links invoice to project via project_id)
      - Client receives invoice notification (email + in-app)
      - After client pays deposit: Project status changes to "officially approved" or "active"
    - **Approve project WITHOUT payment** (unpaid/suggestion):
      - Admin marks project as "no payment required"
      - Changes status directly to "approved" or "active"
      - No invoice created, no payment required
      - Admin can choose to work on these unpaid projects or not
    - **Deny project**: Changes status to "denied" with optional reason
  - Only after official approval (deposit paid OR admin approved without payment): Admin can add phases, tasks, and continue project setup

- **Payment Integration Workflow (Payment Before Official Approval):**
  - Client creates project (indicates payment preference: upfront, milestone-based, etc.)
  - Project status: "pending approval"
  - Admin reviews project and approves (initial approval)
  - Admin creates invoice/billing (deposit amount) and sends to client
  - Project status changes to "awaiting_payment" or "approved_pending_payment"
  - Client receives invoice notification (email + in-app)
  - Client can pay deposit via existing payment flow (Stripe Checkout from `/dashboard/billing/:id`)
  - After successful payment: Project status changes to "officially approved" or "active"
  - Only after deposit payment: Project is officially approved and admin can add phases/tasks
  - If client doesn't pay: Project remains in "awaiting_payment" status (not officially approved)

- **Unpaid Projects (Suggestions) Workflow:**
  - Client creates project (indicates payment preference, but admin decides if payment is required)
  - Admin reviews project and determines if payment is required
  - **If admin determines no payment required**: Admin can approve without payment requirement
  - Status updates directly to "approved" (no payment step)
  - No invoice created, no payment required
  - Admin can choose to work on these unpaid projects or not
  - These are treated as suggestions/volunteer projects

- **Public Project Tracking (Unauthenticated):**
  - Non-signed-in members can track project progress using tracking codes
  - Public tracking page at `/track/:code` (already exists but may need enhancements)
  - No authentication required to view project progress via tracking code
  - Display phases, tasks, notes, and attachments for projects with active tracking codes

- **Navigation & Routes:**
  - Add "Invoices" link to AdminLayout navigation (routes exist but not accessible)
  - Ensure client billing routes are accessible (already in ClientLayout)
  - Add "My Requests" or "Request Quote" link to ClientLayout navigation

- **Email Notifications:**
  - Request submitted → email to admin
  - Request approved → email to client (with project details and tracking code)
  - Request denied → email to client (with denial reason)
  - Client creates project → email to admin (new project pending approval)
  - Admin approves client project (initial approval) → email to client (project approved, invoice sent, deposit required)
  - Admin denies client project → email to client (project denied with reason)
  - Invoice created for project → email to client (invoice sent notification with deposit amount)
  - Deposit payment received → email to admin (client paid deposit, project officially approved)
  - Deposit payment received → email to client (payment confirmed, project officially approved, admin will set up phases/tasks)

### Reusability Opportunities

- **Components:**
  - `ProjectForm.tsx` - Form structure and validation patterns
  - `InvoiceForm.tsx` - Client selection and form patterns
  - `ProjectList.tsx` - Table/list view with status badges
  - `ClientLayout.tsx` - Navigation structure for adding "My Requests" section

- **Backend Patterns:**
  - `src/lib/db/projects.ts` - `createProject()` function pattern for automatic project creation
  - Existing notification system for email and in-app notifications
  - Existing activity logging patterns

- **Similar Features to Model After:**
  - Admin project management workflow (approve/deny pattern)
  - Client dashboard "My Projects" section (can model "My Requests" similarly)

### Scope Boundaries

**In Scope:**
- Client project/quote request form with file attachments (PDFs/images, max 50MB)
- Admin request queue/list with filtering and status management
- Admin approval workflow (approve, deny, request more info)
- Automatic project creation on approval (project record, client assignment, tracking code generation)
- Client request history view in dashboard
- Client direct project creation from "My Projects" page (authenticated clients can create projects directly)
- Client-created projects start with "pending approval" status
- Client can indicate payment preference (upfront deposit, milestone-based) when creating project (preference only, admin decides)
- Admin project approval workflow (approve/deny client-created projects)
- **Admin decides if payment is required** (not determined by client)
- **Payment-before-approval workflow** (if admin determines payment required): Admin approves → sends invoice/deposit → client pays deposit → project officially approved
- **Unpaid project workflow** (if admin determines no payment): Admin approves directly → project officially approved without payment
- If payment is required: Admin creates invoice after initial approval (deposit amount), links to project
- Client can pay deposit via existing payment flow (Stripe Checkout)
- After deposit payment: Project status changes to "officially approved", admin can add phases/tasks
- Unpaid projects: Admin determines "no payment required" and approves directly (no invoice, no payment step)
- Client sees status updates on their projects (pending → awaiting payment → approved OR pending → approved directly)
- Payment webhook integration to update project status when deposit is paid
- Public project tracking for non-signed-in members via tracking codes (unauthenticated access to `/track/:code`)
- Email notifications for request and project lifecycle events
- Adding "Invoices" navigation link to AdminLayout
- Adding "My Requests" or "Request Quote" navigation link to ClientLayout

**Out of Scope:**
- Guided quote builder with service selection (Phase 9 spec)
- Price estimation calculator (Phase 9 spec)
- Payment processing from requests (handled by existing payment system)
- Real-time messaging between client and admin (Phase 8 spec)
- Request templates or cloning
- Bulk request operations
- Request scheduling or automation

### Technical Considerations

- **Database Schema:**
  - New table: `project_requests` with fields: id, client_id, title, description, category, budget_range, timeline, special_requirements, status (pending/approved/denied/needs_info), admin_notes, denial_reason, created_at, updated_at
  - New table: `project_request_attachments` with fields: id, request_id, file_url, file_name, file_type, file_size, created_at
  - Link to existing `projects` table when approved (project_id FK nullable)
  - Update `projects` table: 
    - Extend status enum to include: "pending_approval", "awaiting_payment" (or "approved_pending_payment"), "approved", "denied", "draft", "published"
    - Ensure `client_id` field supports client-created projects
    - Add `created_by` field (user_id) to track who created the project (admin vs client)
    - Add `payment_preference` field (text/enum): "upfront_deposit", "milestone_based" - set by client as preference
    - Add `requires_payment` field (boolean): set by ADMIN during review (not by client)
    - Add `deposit_paid` field (boolean): indicates if deposit has been paid
    - Add `invoice_id` field (FK to invoices, nullable): links to deposit invoice (only if payment required)
  - Ensure `tracking_codes` table supports public access (RLS policies already configured)
  - Client-created projects: status = "pending_approval", created_by = client_id, payment_preference set by client, requires_payment = null (admin decides)
  - After admin review: 
    - If admin determines payment required: requires_payment = true, status = "awaiting_payment", invoice created and linked
    - If admin determines no payment: requires_payment = false, status = "approved", no invoice created
  - After deposit payment: status changes to "approved", deposit_paid = true, admin can add phases/tasks/billing
  - Unpaid projects: requires_payment = false (set by admin), approved directly without payment step

- **File Storage:**
  - Use Supabase Storage bucket for request attachments
  - Validate file types: PDF and images only
  - Enforce 50MB file size limit
  - Store file metadata in `project_request_attachments` table

- **Integration Points:**
  - Reuse existing `createProject()` function for automatic project creation
  - Reuse existing notification system for email and in-app notifications
  - Reuse existing activity logging system
  - Reuse existing tracking code generation system
  - Reuse existing invoice creation system (`src/lib/db/invoices.ts` - `createInvoice()`)
  - Link invoices to projects via `project_id` field (already supported in invoices table)
  - Admin can create invoices from approved projects using existing invoice creation UI
  - Client payment flow already exists via `/dashboard/billing/:id` with Stripe Checkout
  - **Payment webhook integration**: When deposit payment succeeds, update project status from "awaiting_payment" to "approved"
  - Extend Stripe webhook handler to update project status on successful payment
  - Add project status update logic when invoice payment is received

- **Navigation Updates:**
  - Add "Invoices" link to `adminNavLinks` array in `AdminLayout.tsx`
  - Add "My Requests" or "Request Quote" link to `clientNavLinks` array in `ClientLayout.tsx`
  - Add "Create Project" button to "My Projects" page (`src/pages/client/MyProjectsPage.tsx`)

- **Public Tracking Enhancements:**
  - Ensure `/track/:code` route works for unauthenticated users (verify RLS policies)
  - Public tracking page should display all project information available via tracking code
  - No authentication required to access tracking page

- **Similar Code Patterns to Follow:**
  - Form validation: React Hook Form + Zod (like `ProjectForm.tsx`)
  - File upload: Supabase Storage patterns (like existing attachment handling)
  - Status management: Enum types and status badges (like project status)
  - Admin queue: Table/list view with filters (like `ProjectList.tsx`)

