# Spec Requirements: Unified Project Management Workflow

## Initial Description

On the client side, "my projects" and "my requests" are redundant. I want the user to create the project on "my projects" and they can filter by status (pending, in progress, In testing, completed) and these statuses should carry on both admin and client dashboards. So when they create a project they can tick a box that shows if they are hiring me or suggesting a project for me to do.

As an admin when a client creates a project that needs more details i can ask for details and the client can upload or reply to my request, and the status changes should be automatic: 1. when a client creates a project and it hasn't been approved, "Pending" 2. when admin has reviewed the project and requests payment or something "Pending (payment/comments/etc)". 3. when admin has started on the job "in progress" 4. when admin is done and the project is ready for testing phase "in testing" 5. when the job is done "completed". As an admin i also want to be able to delete invoices or projects. and as a user i want to be able to delete projects i created.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll merge the existing "My Projects" and "My Requests" pages into a single "My Projects" page that shows both approved projects and pending requests in one list, with status-based filtering. Is that correct, or should we show them in separate sections/tabs within the same page?
**Answer:** Separate sections of the same page.

**Q2:** You mentioned statuses: "Pending", "In Progress", "In Testing", "Completed". I'm thinking the workflow would be: Pending - Client creates project, awaiting admin review; Pending (payment/comments/etc) - Admin reviewed, needs payment or more info; In Progress - Admin started work; In Testing - Work done, ready for client testing; Completed - Project finished. Should these statuses replace the current status system (draft, active, completed) or extend it? And should "Pending (payment/comments/etc)" be a single status with a note field, or separate statuses like "Pending Payment" and "Pending Info"?
**Answer:** The statuses replace what's there now and the pending should have separate statuses.

**Q3:** When creating a project, you mentioned a checkbox to indicate "hiring me" vs "suggesting a project for me to do". Should this be: A single checkbox: "I'm hiring you for this project" (checked = hiring, unchecked = suggestion)? Or two radio buttons: "Hire Me" vs "Project Suggestion"? And should this affect the approval workflow or just be informational?
**Answer:** A single checkbox and it does affect approval workflow because I will need to prioritize.

**Q4:** When an admin requests more details, should this: Create a comment/thread that the client can reply to with text and file uploads? Or be a simple message that changes the status to "Pending (comments)" until the client responds? Should there be a notification system to alert clients when admin requests details?
**Answer:** Create a comment/thread that the client can reply to with text and file uploads, and changes status to pending. And notification in app and on email.

**Q5:** You mentioned automatic status changes. Should these be: Fully automatic based on actions (e.g., admin creates invoice → status becomes "Pending Payment")? Or admin-manual with suggested statuses (e.g., admin clicks "Request Payment" button which changes status)? Should clients be able to change status, or only admins?
**Answer:** Fully automatic based on actions (e.g., admin creates invoice → status becomes "Pending Payment").

**Q6:** For deletion: Should clients only be able to delete projects they created (created_by = their user_id)? Should deletion be soft-delete (mark as deleted) or hard-delete (permanently remove)? Should there be restrictions (e.g., can't delete if status is "In Progress" or "Completed")? For admin deleting invoices: should this also delete the linked project, or just the invoice?
**Answer:** Clients only be able to delete projects they created (created_by = their user_id), deletion should be both but only admins can hard delete, so clients can delete from their dashboard, admins can delete from the database. But only at certain phases for the client. For the invoice it just deletes the invoice.

**Q7:** For the status filter dropdown, should it show: All statuses: "All", "Pending", "Pending Payment", "Pending Info", "In Progress", "In Testing", "Completed"? Or group them: "All", "Pending" (includes all pending variants), "Active" (In Progress + In Testing), "Completed"? Should the same filter options appear on both admin and client dashboards?
**Answer:** Group them: "All", "Pending" (includes all pending variants), "Active" (In Progress + In Testing), "Completed", and same filter both dashboards.

**Q8:** Since we're consolidating, should we: Remove the `/dashboard/requests` route entirely? Remove the "My Requests" link from the ClientLayout navigation? Migrate any existing project requests data into the unified projects table?
**Answer:** Remove the `/dashboard/requests` route entirely, and Migrate any existing project requests data into the unified projects table.

### Follow-up Questions

**Follow-up 1:** You mentioned "Pending (payment/comments/etc)" should be separate statuses. Should the new status enum include: `pending` (initial creation, awaiting admin review), `pending_payment` (admin reviewed, payment required), `pending_info` (admin requested more details)? Or are there other pending variants we should include?
**Answer:** pending (initial creation, awaiting admin review), pending_payment (admin reviewed, payment required), pending_info (admin requested more details).

**Follow-up 2:** You mentioned clients can only delete at "certain phases". Should clients be able to delete projects when status is: `pending` - Yes/No? `pending_payment` - Yes/No? `pending_info` - Yes/No? `in_progress` - Yes/No? `in_testing` - Yes/No? `completed` - Yes/No? Or should deletion be restricted to only `pending` and `pending_info` statuses (before work begins)?
**Answer:** pending - Yes, pending_payment - this would mean they are cancelling the project, same for the pending payment and pending info.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: My Projects Page - Path: `src/pages/client/MyProjectsPage.tsx`
- Feature: My Requests Page - Path: `src/pages/client/MyRequestsPage.tsx`
- Feature: Client Project Creation - Path: `src/pages/client/ClientCreateProjectPage.tsx`
- Feature: Project Requests Schema - Path: `supabase/migrations/20251230130002_create_project_requests_table.sql`
- Feature: Project Status Enum Extension - Path: `supabase/migrations/20251230130004_extend_project_status_enum.sql`
- Feature: Invoice Management - Path: `agent-os/specs/2025-12-30-client-payments-invoicing/spec.md`
- Components to potentially reuse: ClientProjectCard, status badge components, filter dropdowns
- Backend logic to reference: Project creation logic, status management, RLS policies for client-created projects

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Unified Project Management:**
- Merge "My Projects" and "My Requests" into a single "My Projects" page with separate sections
- Remove `/dashboard/requests` route entirely
- Migrate existing `project_requests` data into unified `projects` table
- Remove "My Requests" link from ClientLayout navigation

**Status System:**
- Replace current status enum with new unified statuses: `pending`, `pending_payment`, `pending_info`, `in_progress`, `in_testing`, `completed`
- Statuses must be consistent across both admin and client dashboards
- Status changes are fully automatic based on actions:
  - Client creates project → `pending`
  - Admin creates invoice → `pending_payment`
  - Admin requests more info → `pending_info`
  - Admin starts work → `in_progress`
  - Admin marks ready for testing → `in_testing`
  - Admin marks complete → `completed`

**Project Creation:**
- Add project creation form to "My Projects" page
- Include checkbox: "I'm hiring you for this project" (affects approval workflow/priorities)
- Checkbox state stored in database (new field: `is_hiring_request` boolean)
- Projects created by clients have `created_by` = client user_id

**Admin-Client Communication:**
- Admin can request more details via comment/thread system
- Clients can reply with text and file uploads
- Status automatically changes to `pending_info` when admin requests details
- Status changes back to `pending` when client responds
- Notifications: in-app and email when admin requests details

**Status Filtering:**
- Grouped filter options: "All", "Pending" (includes all pending variants), "Active" (In Progress + In Testing), "Completed"
- Same filter options on both admin and client dashboards
- Filter UI shows grouped options but filters by individual statuses internally

**Deletion Functionality:**
- Clients can soft-delete projects they created (`created_by` = their user_id)
- Clients can only delete at pending statuses: `pending`, `pending_payment`, `pending_info` (cancelling before work begins)
- Admins can hard-delete projects from database
- Admins can delete invoices (deletes invoice only, not linked project)
- Soft-delete: mark as deleted in database, hide from client view
- Hard-delete: permanently remove from database

**Data Migration:**
- Migrate all `project_requests` records to `projects` table
- Map `request_status` to new `project_status` enum values
- Preserve attachments, admin notes, and client information
- Link migrated projects to original client via `client_id` and `created_by`

### Reusability Opportunities

**Components to Reuse:**
- `ClientProjectCard` component for displaying projects
- Status badge components from existing pages
- Filter dropdown components from MyProjectsPage and MyRequestsPage
- File upload components from project request creation
- Comment/thread UI patterns (may need to create new)

**Backend Patterns to Investigate:**
- Project creation logic from `ClientCreateProjectPage`
- Status management from existing project workflows
- RLS policies for client-created projects (already exists)
- Notification system from existing implementations
- Invoice creation and linking logic from payments spec

**Similar Features to Model After:**
- Project creation form structure
- Status filtering UI patterns
- Admin approval workflow from project requests spec
- Comment/thread system (may need to create new or reference existing patterns)

### Scope Boundaries

**In Scope:**
- Merging "My Projects" and "My Requests" into unified page with separate sections
- Replacing status enum with new unified status system
- Automatic status changes based on admin/client actions
- Project creation with "hiring" checkbox affecting priorities
- Admin-client comment/thread system for requesting details
- Grouped status filtering on both dashboards
- Client soft-delete for their own projects (pending statuses only)
- Admin hard-delete for projects and invoices
- Migration of project_requests data to projects table
- Removal of `/dashboard/requests` route and navigation link

**Out of Scope:**
- Real-time messaging/chat (separate feature)
- Project editing by clients (admins manage project details)
- Status changes by clients (only admins can change status)
- Deletion of projects in "Active" or "Completed" status by clients
- Invoice editing (covered in payments spec)
- Payment processing UI (covered in payments spec)

### Technical Considerations

**Database Schema Changes:**
- Replace `project_status` enum with new values: `pending`, `pending_payment`, `pending_info`, `in_progress`, `in_testing`, `completed`
- Add `is_hiring_request` boolean field to projects table
- Add `deleted_at` timestamptz field for soft-delete
- Create comment/thread table for admin-client communication
- Migration script to convert `project_requests` to `projects`

**Integration Points:**
- Invoice creation automatically changes project status to `pending_payment`
- Comment creation automatically changes project status to `pending_info`
- Client response to comment changes status back to `pending`
- Notification system integration for admin requests
- Email notification integration for status changes

**RLS Policy Updates:**
- Clients can view projects where `client_id` OR `created_by` matches their user_id
- Clients can soft-delete projects where `created_by` matches their user_id AND status is pending
- Admins can manage all projects and comments
- Update existing policies to support new status values

**Status Change Automation:**
- Database triggers or application logic to automatically update status
- Webhook handlers for invoice creation → status change
- Comment creation → status change logic
- Admin action handlers for status transitions

**Migration Strategy:**
- Create migration script to move `project_requests` data to `projects`
- Map old status values to new enum values
- Preserve relationships and attachments
- Test migration on development database first

