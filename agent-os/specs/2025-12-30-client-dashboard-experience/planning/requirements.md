# Spec Requirements: Client Dashboard Experience

## Initial Description

Logged-in users see their projects + summary + history.

This is Phase 6 of the product roadmap (Size: M). It provides a dedicated dashboard for authenticated client users where they can view their assigned projects, track progress, and see their activity history.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the client dashboard will be at `/dashboard` and use a dedicated layout (similar to AdminLayout but simpler). Should clients see any navigation sidebar, or just a clean single-page view?
**Answer:** Navigation top bar for clients (not sidebar).

**Q2:** Currently projects have a `client_id` field linking them to users. Should clients ONLY see projects where they are the assigned client, or should they also see an "All Projects" public view of your published portfolio?
**Answer:** Both - they can see projects they are assigned as clients AND also see the published portfolio.

**Q3:** When a client clicks on their project, should they: (A) Navigate to public tracking page, (B) See embedded view in dashboard, or (C) See a richer "client-only" view with more information?
**Answer:** Option C - richer "client-only" view with more information than the public tracking page.

**Q4:** What metrics/summary should appear on the dashboard home?
**Answer:** 
- Total projects count
- Projects by status (in progress, completed)
- Next upcoming milestone/phase
- Overall completion percentage across all projects

**Q5:** What should "history" include?
**Answer:**
- Phase completions (e.g., "Phase 2 completed on Dec 28")
- Task updates
- Developer notes added
- File attachments uploaded
- Previous/past projects

**Q6:** Should the dashboard show a notifications panel/bell icon for recent activity?
**Answer:** Yes - notification dropdown with "mark all as read" feature. Also includes a "What's New" section with release notes. The "What's New" items should be clickable to open full details in a modal that doesn't cut off content.

**Q7:** Should clients be able to edit their profile from this dashboard?
**Answer:** Yes - they should have a Settings page just like admin, but with client-specific settings.

### Follow-up Questions

**Follow-up 1:** Where do the release notes come from?
**Answer:** Admin creates release notes from Admin Dashboard and can select which clients receive them. Also need a client grouping system to assign clients to groups for targeted release notes.

**Follow-up 2:** What additional information should the client-only project view show?
**Answer:**
- Private developer notes (visible to client but not public)
- Invoice/payment status
- Direct messaging/comments
- More detailed file organization
- Payment gateway using Stripe

**Follow-up 3:** What specific settings should be available to clients?
**Answer:**
- Profile info (name, phone, email)
- Notification preferences (email on/off)
- Theme/display preferences
- Password change

**Follow-up 4:** Should the notification dropdown show an unread count badge?
**Answer:** Yes

**Follow-up 5:** Should we create an activity_log table or derive history from timestamps?
**Answer:** Create the activity_log table

### Scope Clarification

**Stripe Payment Gateway Scope:**
**Answer:** Split into separate spec - keep Phase 6 focused on dashboard experience, create separate spec for payments/invoicing.

**Direct Messaging Scope:**
**Answer:** Full real-time chat feature - but also split into separate spec due to complexity.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No visuals to analyze.

## Requirements Summary

### Functional Requirements

**Client Dashboard Layout:**
- Dedicated route at `/dashboard` for authenticated client users
- Top navigation bar (not sidebar like admin)
- Clean, client-focused experience

**Dashboard Home:**
- Total projects count (assigned to client)
- Projects by status breakdown (in progress, completed)
- Next upcoming milestone/phase indicator
- Overall completion percentage across all client's projects

**My Projects View:**
- List of projects where user is assigned as `client_id`
- Richer view than public tracking page:
  - Private developer notes (visible to client, not public)
  - More detailed file organization
  - (Invoice/payment status - future spec)
  - (Direct messaging - future spec)

**Portfolio View:**
- Browse all published portfolio projects (same as public)
- Separate tab/section from "My Projects"

**Activity History:**
- Activity log showing:
  - Phase completions with dates
  - Task updates
  - Developer notes added
  - File attachments uploaded
  - Previous/completed projects
- Stored in dedicated `activity_log` table

**Notifications System:**
- Bell icon with unread count badge
- Dropdown showing recent notifications
- "Mark all as read" functionality
- "What's New" section for release notes
- Clickable release notes open full details in modal (no content cutoff)

**Release Notes (Admin Side):**
- Admin can create/manage release notes
- Target specific clients or client groups
- Client grouping system for targeting

**Client Settings:**
- Profile management (name, phone, email)
- Notification preferences (email on/off)
- Theme/display preferences
- Password change

### Database Schema Additions

**Activity Log Table:**
- `activity_log`: id, user_id, project_id, event_type, event_data, created_at

**Client Groups:**
- `client_groups`: id, name, description, created_at
- `client_group_members`: id, group_id, user_id, created_at

**Release Notes:**
- `release_notes`: id, title, content, target_type (all/group/specific), created_at, published_at
- `release_note_targets`: id, release_note_id, target_type, target_id
- `release_note_reads`: id, release_note_id, user_id, read_at

**Notifications:**
- `notifications`: id, user_id, type, title, message, data, read, created_at

### Reusability Opportunities

- Existing Admin Dashboard patterns for layout structure
- Existing ProtectedRoute with `requiredRole="client"`
- Existing project/phase/task database functions
- Existing shadcn/ui components
- Existing auth system and user management

### Scope Boundaries

**In Scope:**
- Client dashboard route and layout with top navigation
- Dashboard home with project metrics
- My Projects list with richer client-only view
- Portfolio browsing (published projects)
- Activity history with dedicated log table
- Notification dropdown with badge and mark-all-read
- "What's New" release notes with modal view
- Admin release notes CRUD with client/group targeting
- Client groups management (admin side)
- Client settings (profile, notifications, theme, password)

**Out of Scope (Separate Specs):**
- Stripe payment gateway and invoicing
- Real-time direct messaging/chat
- Invoice/payment status display (depends on Stripe spec)
- Email notification sending (already in Phase 5)

### Technical Considerations

- New ClientLayout component with top navigation
- Client-specific routing under `/dashboard/*`
- Activity log triggers or application-level logging
- Release notes targeting logic
- Theme persistence (localStorage or user preferences table)
- Password change via Supabase auth API


