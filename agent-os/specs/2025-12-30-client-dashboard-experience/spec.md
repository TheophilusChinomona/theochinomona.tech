# Specification: Client Dashboard Experience

## Goal

Create a dedicated dashboard for authenticated client users with top navigation, project metrics, activity history, notifications with "What's New" release notes, and client-specific settings, providing a richer experience than the public tracking page.

## User Stories

- As a client, I want a dedicated dashboard where I can see all my assigned projects and their progress so that I don't need to remember tracking codes.
- As a client, I want to see project metrics (total count, completion percentage, next milestone) so that I have a quick overview of my project status.
- As a client, I want to view activity history (phase completions, task updates, notes added) so that I can track recent progress on my projects.
- As a client, I want notifications about project updates and platform announcements so that I stay informed without checking constantly.
- As a client, I want to manage my profile, notification preferences, and theme settings so that I can customize my experience.
- As an admin, I want to create release notes targeted to specific clients or client groups so that I can communicate updates effectively.

## Specific Requirements

**Database Schema - User Preferences**
- Create `user_preferences` table with fields: `id` (UUID), `user_id` (FK to users, unique), `theme` (enum: 'light', 'dark', 'system', default 'system'), `email_notifications` (boolean, default true), `created_at`, `updated_at`
- Enable RLS: users can SELECT/UPDATE their own preferences, admins can view all
- Create trigger for `updated_at` using existing `update_updated_at_column()` function

**Database Schema - Activity Log**
- Create `activity_log_event_type` enum with values: 'phase_completed', 'phase_started', 'task_updated', 'note_added', 'file_uploaded', 'project_created', 'project_completed'
- Create `activity_log` table with fields: `id` (UUID), `user_id` (FK to users, nullable - for system events), `project_id` (FK to projects), `event_type` (activity_log_event_type), `event_data` (JSONB - flexible payload), `created_at`
- Enable RLS: clients can SELECT logs for projects where they are `client_id`, admins can SELECT/INSERT all
- Create indexes on `project_id`, `user_id`, and `created_at DESC`

**Database Schema - Client Groups**
- Create `client_groups` table with fields: `id` (UUID), `name` (text, unique), `description` (text nullable), `created_at`, `updated_at`
- Create `client_group_members` table with fields: `id` (UUID), `group_id` (FK to client_groups), `user_id` (FK to users), `created_at`, with unique constraint on `(group_id, user_id)`
- Enable RLS: admins can manage all, clients cannot access directly
- Create indexes on `group_id` and `user_id`

**Database Schema - Release Notes**
- Create `release_note_target_type` enum with values: 'all', 'group', 'specific'
- Create `release_notes` table with fields: `id` (UUID), `title` (text), `content` (text - markdown supported), `target_type` (release_note_target_type), `is_published` (boolean, default false), `published_at` (timestamptz nullable), `created_at`, `updated_at`
- Create `release_note_targets` table with fields: `id` (UUID), `release_note_id` (FK), `target_type` ('group' or 'user'), `target_id` (UUID - references either client_groups.id or users.id), with unique constraint on `(release_note_id, target_type, target_id)`
- Create `release_note_reads` table with fields: `id` (UUID), `release_note_id` (FK), `user_id` (FK to users), `read_at` (timestamptz default NOW()), with unique constraint on `(release_note_id, user_id)`
- Enable RLS: clients can SELECT release notes targeted to them (via target_type logic), admins can manage all

**Database Schema - Notifications**
- Create `notification_type` enum with values: 'project_update', 'phase_complete', 'task_update', 'note_added', 'file_uploaded', 'release_note', 'system'
- Create `notifications` table with fields: `id` (UUID), `user_id` (FK to users), `type` (notification_type), `title` (text), `message` (text), `data` (JSONB nullable - for deep links like project_id), `read` (boolean, default false), `created_at`
- Enable RLS: users can SELECT/UPDATE (read status) their own notifications, admins can INSERT
- Create indexes on `user_id`, `read`, and `created_at DESC`

**Client Dashboard Layout**
- Create `ClientLayout.tsx` component with top navigation bar (similar pattern to AdminLayout)
- Navigation items: Dashboard (home), My Projects, Portfolio, Settings
- Bell icon for notifications in top-right with unread count badge
- User dropdown menu with profile info, "Back to Site", and Logout options
- Mobile-responsive hamburger menu matching AdminLayout patterns
- Route all client pages under `/dashboard/*`

**Client Dashboard Home Page**
- Create `/dashboard` route showing overview metrics
- Display cards for: Total Projects Count, In Progress Count, Completed Count, Overall Completion %
- Show "Next Milestone" card with nearest upcoming phase deadline
- Display recent activity feed (last 10 items from activity_log)
- Quick links to My Projects and Portfolio sections

**My Projects Page**
- Create `/dashboard/projects` route listing projects where `client_id` matches current user
- Display project cards with: title, overall progress percentage, phase count, last activity date
- Click project to navigate to `/dashboard/projects/:id` for detailed view
- Filter/sort options: by status (all/in-progress/completed), by date
- Empty state for clients with no assigned projects

**Client Project Detail Page**
- Create `/dashboard/projects/:id` route with richer view than public tracking page
- Show all public tracking page content PLUS:
  - Private developer notes marked with "For Client" badge (notes with `is_private_to_client: true` flag)
  - File attachments organized by phase/task with preview thumbnails
  - Activity timeline for this specific project
- Display tracking code for sharing with others
- (Placeholder sections for Invoice/Payment and Messaging - future specs)

**Portfolio Browsing**
- Create `/dashboard/portfolio` route showing all published projects
- Reuse existing PortfolioPage component/logic but within ClientLayout
- Add "This is your project" badge on cards where client is assigned
- Same filtering capabilities as public portfolio

**Notifications System**
- Create `NotificationDropdown.tsx` component for top nav
- Bell icon with red badge showing unread count (max display "9+")
- Dropdown shows recent 10 notifications with title, message preview, time ago
- "Mark all as read" button at top of dropdown
- "What's New" section separator showing recent release notes
- Click release note to open `ReleaseNoteModal.tsx` with full markdown content
- Click project notification to navigate to project detail page
- "View all notifications" link to `/dashboard/notifications` page

**Release Notes Modal**
- Create `ReleaseNoteModal.tsx` with shadcn Dialog component
- Full-height modal (90vh) with scrollable content area
- Render markdown content with proper styling
- Display published date and mark as read on open
- Close button and click-outside-to-close behavior

**Admin Release Notes Management**
- Create `/admin/release-notes` route for managing release notes
- List view with: title, target type, published status, published date, actions
- Create/Edit form with:
  - Title input
  - Rich text/markdown editor for content (use existing textarea with markdown preview)
  - Target type radio: All Clients / Specific Groups / Specific Users
  - Multi-select for groups (if target_type is 'group')
  - Multi-select for users (if target_type is 'specific')
  - Publish toggle and save as draft option
- Delete with confirmation dialog

**Admin Client Groups Management**
- Create `/admin/client-groups` route for managing client groups
- List view with: group name, description, member count, actions
- Create/Edit form with: name, description
- Member management: add/remove users from group via multi-select
- Delete group with confirmation (unassigns members, doesn't delete users)

**Client Settings Page**
- Create `/dashboard/settings` route with settings sections
- Profile Section:
  - Display and edit: name, surname, phone (email read-only)
  - Save button with optimistic update and toast notification
- Notification Preferences Section:
  - Toggle for email notifications (on/off)
  - Toggle for each notification type (future enhancement placeholder)
- Appearance Section:
  - Theme selector: Light / Dark / System
  - Persist to user_preferences table and localStorage
  - Apply theme immediately on change
- Security Section:
  - Change password form with current password, new password, confirm password
  - Use Supabase `updateUser({ password })` API

**API Layer - Activity Log**
- Create `src/lib/db/activityLog.ts` with functions:
  - `logActivity(projectId, eventType, eventData, userId?)` - inserts log entry
  - `getActivityLogForProject(projectId, limit?)` - returns recent logs for a project
  - `getActivityLogForUser(userId, limit?)` - returns recent logs for user's projects
- Create database triggers or call `logActivity` from existing phase/task update functions

**API Layer - Notifications**
- Create `src/lib/db/notifications.ts` with functions:
  - `createNotification(userId, type, title, message, data?)` - creates notification
  - `getNotificationsForUser(userId, limit?, unreadOnly?)` - returns notifications
  - `markNotificationRead(notificationId)` - marks single as read
  - `markAllNotificationsRead(userId)` - marks all as read
  - `getUnreadCount(userId)` - returns count for badge

**API Layer - Release Notes**
- Create `src/lib/db/releaseNotes.ts` with functions:
  - `createReleaseNote(data)` - creates draft release note
  - `updateReleaseNote(id, data)` - updates release note
  - `publishReleaseNote(id)` - sets is_published=true, published_at=now()
  - `deleteReleaseNote(id)` - deletes release note and targets
  - `getReleaseNotesForUser(userId)` - returns published notes targeted to user
  - `markReleaseNoteRead(releaseNoteId, userId)` - inserts read record

**API Layer - Client Groups**
- Create `src/lib/db/clientGroups.ts` with functions:
  - `getAllClientGroups()` - returns all groups with member counts
  - `createClientGroup(name, description?)` - creates group
  - `updateClientGroup(id, data)` - updates group
  - `deleteClientGroup(id)` - deletes group and memberships
  - `addUserToGroup(groupId, userId)` - adds member
  - `removeUserFromGroup(groupId, userId)` - removes member
  - `getGroupMembers(groupId)` - returns users in group
  - `getUserGroups(userId)` - returns groups user belongs to

**API Layer - User Preferences**
- Create `src/lib/db/userPreferences.ts` with functions:
  - `getUserPreferences(userId)` - returns preferences or defaults
  - `updateUserPreferences(userId, data)` - upserts preferences
- Extend existing `src/lib/db/users.ts` with `updateUserProfile(userId, { name, surname, phone })`

**Routing Updates**
- Add client routes to `src/routes.tsx`:
  - `/dashboard` - ClientLayout with ProtectedRoute (requiredRole="client" OR "admin")
  - `/dashboard/projects` - My Projects list
  - `/dashboard/projects/:id` - Project detail
  - `/dashboard/portfolio` - Portfolio browser
  - `/dashboard/settings` - Client settings
  - `/dashboard/notifications` - All notifications page
- Add admin routes:
  - `/admin/release-notes` - Release notes management
  - `/admin/client-groups` - Client groups management
- Update `LoginPage.tsx` to redirect clients to `/dashboard` instead of `/`
- Update `Navbar.tsx` getDashboardUrl() to return `/dashboard` for clients

**Theme System**
- Create `ThemeProvider.tsx` context with theme state ('light' | 'dark' | 'system')
- Persist theme preference to localStorage and user_preferences table
- Apply theme class to document root element
- Respect system preference when theme is 'system'
- Wrap app in ThemeProvider in App.tsx

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**AdminLayout (`src/layouts/AdminLayout.tsx`)**
- Clone and adapt for ClientLayout with simplified navigation
- Reuse mobile menu patterns, dropdown menu, and logout flow
- Follow same styling: zinc-950 background, indigo accents

**Admin Settings Page (`src/pages/admin/SettingsPage.tsx`)**
- Adapt card-based layout for client settings sections
- Follow same "Coming Soon" pattern for placeholder features

**ProtectedRoute (`src/components/ProtectedRoute.tsx`)**
- Already supports `requiredRole` prop - use with 'client'
- Pattern for combining admin OR client access if needed

**Database Patterns (`src/lib/db/users.ts`, `src/lib/db/tracking.ts`)**
- Follow TypeScript interface patterns for new types
- Replicate Supabase query patterns and error handling
- Use same null checking and type assertions

**Migration Patterns (existing migrations)**
- Follow same structure for CREATE TYPE, CREATE TABLE, indexes, RLS
- Reuse `update_updated_at_column()` trigger function
- Follow FK constraint naming conventions

**shadcn/ui Components**
- Dialog for modals (release notes, confirmations)
- Card for dashboard metrics and settings sections
- Badge for notification counts
- Switch for toggles
- Tabs for settings sections (if needed)

## Out of Scope

- Stripe payment gateway and invoicing (separate Phase 7 spec)
- Real-time direct messaging/chat between client and admin (separate Phase 8 spec)
- Invoice/payment status display (depends on Phase 7)
- Email notification sending (already implemented in Phase 5)
- Push notifications / browser notifications
- Notification preference granularity (per notification type)
- Bulk notification actions beyond "mark all as read"
- Release note scheduling (publish now only)
- Rich text editor for release notes (use markdown)
- Client avatar/profile picture upload
- Two-factor authentication settings
- Session management / device list
- Data export functionality


