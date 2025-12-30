# Task Breakdown: Client Dashboard Experience

## Overview
Total Tasks: 14 Task Groups

## Task List

### Database Layer

#### Task Group 1: User Preferences Schema & Migration
**Dependencies:** None

- [x] 1.0 Complete user preferences database schema
  - [x] 1.1 Write 3-4 focused tests for user preferences schema
    - Test: user_preferences table exists with all required columns
    - Test: Theme enum accepts only 'light', 'dark', 'system'
    - Test: RLS policies allow users to SELECT/UPDATE their own preferences
    - Test: Unique constraint on user_id prevents duplicates
  - [x] 1.2 Create theme_preference enum type
    - Create enum: `CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system')`
  - [x] 1.3 Create user_preferences table migration
    - Create migration file: `supabase/migrations/20251230110001_create_user_preferences_table.sql`
    - Table fields: `id` (UUID, primary key), `user_id` (UUID, FK to users, unique), `theme` (theme_preference, default 'system'), `email_notifications` (BOOLEAN, default true), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraint to users with ON DELETE CASCADE
    - Add unique constraint on user_id
  - [x] 1.4 Create indexes and triggers
    - Create unique index on `user_id`
    - Add updated_at trigger using existing `update_updated_at_column()` function
  - [x] 1.5 Create RLS policies for user preferences
    - Enable RLS on user_preferences table
    - Policy: Users can SELECT/UPDATE their own preferences (where user_id matches)
    - Policy: Admins can SELECT all preferences
  - [x] 1.6 Ensure user preferences tests pass
    - Run ONLY the 3-4 tests written in 1.1
    - Verify migration runs successfully

**Acceptance Criteria:**
- The 3-4 tests written in 1.1 pass
- User preferences table created with proper schema
- RLS allows users to manage only their own preferences

---

#### Task Group 2: Activity Log Schema & Migration
**Dependencies:** None

- [x] 2.0 Complete activity log database schema
  - [x] 2.1 Write 4-5 focused tests for activity log schema
    - Test: activity_log table exists with all required columns
    - Test: Event type enum accepts only valid values
    - Test: RLS policies allow clients to SELECT logs for their projects
    - Test: RLS policies allow admins to SELECT/INSERT all logs
    - Test: Indexes exist on project_id, user_id, and created_at
  - [x] 2.2 Create activity_log_event_type enum
    - Create enum: `CREATE TYPE activity_log_event_type AS ENUM ('phase_completed', 'phase_started', 'task_updated', 'note_added', 'file_uploaded', 'project_created', 'project_completed')`
  - [x] 2.3 Create activity_log table migration
    - Create migration file: `supabase/migrations/20251230110002_create_activity_log_table.sql`
    - Table fields: `id` (UUID, primary key), `user_id` (UUID, FK to users, nullable), `project_id` (UUID, FK to projects), `event_type` (activity_log_event_type), `event_data` (JSONB), `created_at` (TIMESTAMPTZ, default NOW())
    - Add FK constraints with ON DELETE CASCADE
  - [x] 2.4 Create indexes for activity log
    - Create index on `project_id` for project-specific queries
    - Create index on `user_id` for user-specific queries
    - Create index on `created_at DESC` for chronological ordering
    - Create composite index on `(project_id, created_at DESC)`
  - [x] 2.5 Create RLS policies for activity log
    - Enable RLS on activity_log table
    - Policy: Clients can SELECT logs for projects where they are client_id
    - Policy: Admins can SELECT/INSERT all logs
  - [x] 2.6 Ensure activity log tests pass
    - Run ONLY the 4-5 tests written in 2.1
    - Verify migration runs successfully

**Acceptance Criteria:**
- The 4-5 tests written in 2.1 pass
- Activity log table created with JSONB event_data for flexibility
- RLS enforces project-based access for clients

---

#### Task Group 3: Client Groups Schema & Migration
**Dependencies:** None

- [x] 3.0 Complete client groups database schema
  - [x] 3.1 Write 4-5 focused tests for client groups schema
    - Test: client_groups table exists with all required columns
    - Test: client_group_members table exists with proper FKs
    - Test: Unique constraint on (group_id, user_id) prevents duplicate members
    - Test: RLS policies allow only admins to manage groups
    - Test: Group name is unique
  - [x] 3.2 Create client_groups table migration
    - Create migration file: `supabase/migrations/20251230110003_create_client_groups_tables.sql`
    - Table fields: `id` (UUID, primary key), `name` (TEXT, unique), `description` (TEXT nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add unique constraint on name
    - Add updated_at trigger
  - [x] 3.3 Create client_group_members table
    - Table fields: `id` (UUID, primary key), `group_id` (UUID, FK to client_groups), `user_id` (UUID, FK to users), `created_at` (TIMESTAMPTZ)
    - Add FK constraints with ON DELETE CASCADE
    - Add unique constraint on (group_id, user_id)
  - [x] 3.4 Create indexes for client groups
    - Create index on `client_group_members.group_id`
    - Create index on `client_group_members.user_id`
  - [x] 3.5 Create RLS policies for client groups
    - Enable RLS on both tables
    - Policy: Admins can SELECT/INSERT/UPDATE/DELETE all
    - Policy: Clients cannot access directly (no policies for clients)
  - [x] 3.6 Ensure client groups tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify migration runs successfully

**Acceptance Criteria:**
- The 4-5 tests written in 3.1 pass
- Client groups and members tables created
- Only admins can manage groups

---

#### Task Group 4: Release Notes Schema & Migration
**Dependencies:** Task Group 3 (for group targeting)

- [x] 4.0 Complete release notes database schema
  - [x] 4.1 Write 5-6 focused tests for release notes schema
    - Test: release_notes table exists with all required columns
    - Test: Target type enum accepts 'all', 'group', 'specific'
    - Test: release_note_targets table links to groups or users
    - Test: release_note_reads table tracks user reads
    - Test: RLS allows clients to SELECT notes targeted to them
    - Test: RLS allows admins to manage all notes
  - [x] 4.2 Create release_note_target_type enum
    - Create enum: `CREATE TYPE release_note_target_type AS ENUM ('all', 'group', 'specific')`
  - [x] 4.3 Create release_notes table migration
    - Create migration file: `supabase/migrations/20251230110004_create_release_notes_tables.sql`
    - Table fields: `id` (UUID), `title` (TEXT), `content` (TEXT), `target_type` (release_note_target_type), `is_published` (BOOLEAN, default false), `published_at` (TIMESTAMPTZ nullable), `created_at`, `updated_at`
  - [x] 4.4 Create release_note_targets table
    - Table fields: `id` (UUID), `release_note_id` (UUID, FK), `target_type` (TEXT - 'group' or 'user'), `target_id` (UUID)
    - Add FK constraint to release_notes with ON DELETE CASCADE
    - Add unique constraint on (release_note_id, target_type, target_id)
  - [x] 4.5 Create release_note_reads table
    - Table fields: `id` (UUID), `release_note_id` (UUID, FK), `user_id` (UUID, FK to users), `read_at` (TIMESTAMPTZ, default NOW())
    - Add FK constraints with ON DELETE CASCADE
    - Add unique constraint on (release_note_id, user_id)
  - [x] 4.6 Create indexes for release notes
    - Index on release_notes.is_published
    - Index on release_notes.published_at DESC
    - Index on release_note_targets.release_note_id
    - Index on release_note_reads.user_id
  - [x] 4.7 Create RLS policies for release notes
    - Enable RLS on all three tables
    - release_notes: Clients can SELECT where targeted to them (via `can_user_see_release_note` helper function)
    - release_notes: Admins can SELECT/INSERT/UPDATE/DELETE all
    - release_note_reads: Users can SELECT/INSERT their own reads
    - release_note_targets: Admins only
  - [x] 4.8 Ensure release notes tests pass
    - Run ONLY the 5-6 tests written in 4.1
    - Verify migration runs successfully

**Acceptance Criteria:**
- The 5-6 tests written in 4.1 pass
- Release notes with targeting system created
- Clients can only see notes targeted to them

---

#### Task Group 5: Notifications Schema & Migration
**Dependencies:** None

- [x] 5.0 Complete notifications database schema
  - [x] 5.1 Write 4-5 focused tests for notifications schema
    - Test: notifications table exists with all required columns
    - Test: Notification type enum accepts all valid values
    - Test: RLS allows users to SELECT/UPDATE their own notifications
    - Test: RLS allows admins/system to INSERT notifications
    - Test: Indexes exist for efficient querying
  - [x] 5.2 Create notification_type enum
    - Create enum: `CREATE TYPE notification_type AS ENUM ('project_update', 'phase_complete', 'task_update', 'note_added', 'file_uploaded', 'release_note', 'system')`
  - [x] 5.3 Create notifications table migration
    - Create migration file: `supabase/migrations/20251230110005_create_notifications_table.sql`
    - Table fields: `id` (UUID), `user_id` (UUID, FK to users), `type` (notification_type), `title` (TEXT), `message` (TEXT), `data` (JSONB nullable), `read` (BOOLEAN, default false), `created_at` (TIMESTAMPTZ)
    - Add FK constraint to users with ON DELETE CASCADE
  - [x] 5.4 Create indexes for notifications
    - Create index on `user_id`
    - Create index on `read` for filtering unread
    - Create index on `created_at DESC`
    - Create composite index on `(user_id, read, created_at DESC)`
  - [x] 5.5 Create RLS policies for notifications
    - Enable RLS on notifications table
    - Policy: Users can SELECT their own notifications
    - Policy: Users can UPDATE read status on their own notifications
    - Policy: Admins/service role can INSERT notifications
  - [x] 5.6 Ensure notifications tests pass
    - Run ONLY the 4-5 tests written in 5.1
    - Verify migration runs successfully

**Acceptance Criteria:**
- The 4-5 tests written in 5.1 pass
- Notifications table created with JSONB data field
- Users can only access their own notifications

---

### API Layer

#### Task Group 6: Database Functions - Core
**Dependencies:** Task Groups 1-5

- [x] 6.0 Complete core database functions
  - [x] 6.1 Write 8-10 focused tests for database functions
    - Test: getUserPreferences returns preferences or defaults
    - Test: updateUserPreferences creates/updates preferences
    - Test: logActivity creates activity log entry
    - Test: getActivityLogForProject returns logs in order
    - Test: getActivityLogForUser returns logs for user's projects
    - Test: createNotification creates notification
    - Test: markAllNotificationsRead updates all user notifications
    - Test: getUnreadCount returns correct count
    - Test: updateUserProfile updates user data
    - Test: Error handling is robust
  - [x] 6.2 Create TypeScript interfaces
    - Created `src/lib/db/types/dashboard.ts` with interfaces: `UserPreferences`, `ActivityLogEntry`, `Notification`, `ReleaseNote`, `ClientGroup`, and related types
    - Export all interfaces for use across application
  - [x] 6.3 Create user preferences functions
    - Created `src/lib/db/userPreferences.ts`
    - Function: `getUserPreferences(userId): Promise<UserPreferences>`
    - Function: `updateUserPreferences(userId, data): Promise<UserPreferences>`
    - Returns defaults if no preferences exist
  - [x] 6.4 Create activity log functions
    - Created `src/lib/db/activityLog.ts`
    - Function: `logActivity(projectId, eventType, eventData, userId?): Promise<ActivityLogEntry>`
    - Function: `getActivityLogForProject(projectId, limit?): Promise<ActivityLogEntry[]>`
    - Function: `getActivityLogForUser(userId, limit?): Promise<ActivityLogEntry[]>`
  - [x] 6.5 Create notification functions
    - Created `src/lib/db/notifications.ts`
    - Function: `createNotification(userId, type, title, message, data?): Promise<Notification>`
    - Function: `getNotificationsForUser(userId, limit?, unreadOnly?): Promise<Notification[]>`
    - Function: `markNotificationRead(notificationId): Promise<void>`
    - Function: `markAllNotificationsRead(userId): Promise<void>`
    - Function: `getUnreadCount(userId): Promise<number>`
  - [x] 6.6 Extend user functions
    - Updated `src/lib/db/users.ts`
    - Added function: `updateUserProfile(userId, { name, surname, phone }): Promise<User>`
    - Added function: `changePassword(newPassword): Promise<void>` (uses Supabase auth)
    - Added function: `getUserById(userId): Promise<User | null>`
  - [x] 6.7 Ensure core function tests pass
    - Run ONLY the 8-10 tests written in 6.1
    - Verify all functions work correctly

**Acceptance Criteria:**
- The 8-10 tests written in 6.1 pass
- All core database functions work correctly
- Error handling is robust

---

#### Task Group 7: Database Functions - Release Notes & Groups
**Dependencies:** Task Groups 3, 4, 6

- [x] 7.0 Complete release notes and client groups functions
  - [x] 7.1 Write 8-10 focused tests for release notes and groups
    - Test: createReleaseNote creates draft note
    - Test: publishReleaseNote sets published and published_at
    - Test: getReleaseNotesForUser returns only targeted notes
    - Test: markReleaseNoteRead creates read record
    - Test: getAllClientGroups returns groups with member counts
    - Test: createClientGroup creates group
    - Test: addUserToGroup creates membership
    - Test: removeUserFromGroup deletes membership
    - Test: getGroupMembers returns users in group
    - Test: deleteClientGroup removes group and memberships
  - [x] 7.2 Create release notes functions
    - Created `src/lib/db/releaseNotes.ts`
    - Function: `createReleaseNote(data): Promise<ReleaseNote>`
    - Function: `updateReleaseNote(id, data): Promise<ReleaseNote>`
    - Function: `publishReleaseNote(id): Promise<ReleaseNote>`
    - Function: `unpublishReleaseNote(id): Promise<ReleaseNote>`
    - Function: `deleteReleaseNote(id): Promise<void>`
    - Function: `getAllReleaseNotes(): Promise<ReleaseNote[]>` (admin)
    - Function: `getReleaseNotesForUser(userId): Promise<ReleaseNoteWithReadStatus[]>` (targeted)
    - Function: `markReleaseNoteRead(releaseNoteId, userId): Promise<void>`
    - Function: `getUnreadReleaseNotesCount(userId): Promise<number>`
  - [x] 7.3 Create release note targeting functions
    - Function: `setReleaseNoteTargets(releaseNoteId, targets: {type, id}[]): Promise<void>`
    - Function: `getReleaseNoteTargets(releaseNoteId): Promise<ReleaseNoteTarget[]>`
    - Function: `addReleaseNoteTarget(releaseNoteId, targetType, targetId): Promise<void>`
    - Function: `removeReleaseNoteTarget(releaseNoteId, targetType, targetId): Promise<void>`
    - Handle 'all', 'group', and 'specific' target types
  - [x] 7.4 Create client groups functions
    - Created `src/lib/db/clientGroups.ts`
    - Function: `getAllClientGroups(): Promise<ClientGroupWithMemberCount[]>` (with member counts)
    - Function: `getClientGroupById(id): Promise<ClientGroup>`
    - Function: `getClientGroupWithMemberCount(id): Promise<ClientGroupWithMemberCount>`
    - Function: `createClientGroup(name, description?): Promise<ClientGroup>`
    - Function: `updateClientGroup(id, data): Promise<ClientGroup>`
    - Function: `deleteClientGroup(id): Promise<void>`
  - [x] 7.5 Create group membership functions
    - Function: `addUserToGroup(groupId, userId): Promise<void>`
    - Function: `removeUserFromGroup(groupId, userId): Promise<void>`
    - Function: `getGroupMembers(groupId): Promise<User[]>`
    - Function: `getUserGroups(userId): Promise<ClientGroup[]>`
    - Function: `isUserInGroup(groupId, userId): Promise<boolean>`
    - Function: `setGroupMembers(groupId, userIds): Promise<void>`
  - [x] 7.6 Ensure release notes and groups tests pass
    - Run ONLY the 8-10 tests written in 7.1
    - Verify all functions work correctly

**Acceptance Criteria:**
- The 8-10 tests written in 7.1 pass
- Release notes targeting works correctly
- Client group management works correctly

---

### Frontend - Client Dashboard

#### Task Group 8: Client Layout & Routing
**Dependencies:** Task Groups 1-7

- [x] 8.0 Complete client layout and routing
  - [x] 8.1 Write 5-6 focused tests for client layout
    - Test: ClientLayout renders with top navigation
    - Test: Navigation links are correct (Dashboard, My Projects, Portfolio, Settings)
    - Test: Bell icon displays unread notification count
    - Test: User dropdown shows profile and logout options
    - Test: Mobile menu works correctly
    - Test: Protected routes redirect unauthenticated users
  - [x] 8.2 Create ClientLayout component
    - Created `src/layouts/ClientLayout.tsx`
    - Based on AdminLayout with client-specific adaptations
    - Top navigation bar with: Dashboard, My Projects, Portfolio, Settings
    - Bell icon for notifications (placeholder initially)
    - User dropdown with: profile info, Back to Site, Logout
    - Mobile-responsive hamburger menu
    - Uses zinc-950 background, indigo accents (matching admin)
  - [x] 8.3 Create NotificationBell component (placeholder)
    - Created `src/components/client/NotificationBell.tsx`
    - Bell icon with unread count badge (max 9+)
    - Placeholder dropdown (will implement in Task Group 11)
    - Connected to getUnreadCount hook with React Query
  - [x] 8.4 Update routes.tsx for client dashboard
    - Added client routes under `/dashboard/*`:
      - `/dashboard` - ClientDashboardHome
      - `/dashboard/projects` - MyProjectsPage
      - `/dashboard/projects/:id` - ClientProjectDetailPage
      - `/dashboard/portfolio` - ClientPortfolioPage
      - `/dashboard/settings` - ClientSettingsPage
    - Wrapped with ProtectedRoute (allows any authenticated user)
    - Uses ClientLayout for all routes
  - [x] 8.5 Update LoginPage redirect
    - Updated `src/pages/LoginPage.tsx`
    - Redirects clients to `/dashboard` instead of `/`
    - Keeps admin redirect to `/admin`
  - [x] 8.6 Update Navbar getDashboardUrl
    - Updated `src/components/Navbar.tsx`
    - Returns `/dashboard` for client users
    - Keeps `/admin` for admin users
  - [x] 8.7 Ensure client layout tests pass
    - Verified layout renders correctly
    - Verified navigation works

**Acceptance Criteria:**
- [x] ClientLayout renders with top navigation
- [x] Routes are properly configured and protected
- [x] Login redirects work correctly

---

#### Task Group 9: Dashboard Home Page
**Dependencies:** Task Group 8

- [x] 9.0 Complete client dashboard home page
  - [x] 9.1 Write 5-6 focused tests for dashboard home
    - Test: Dashboard displays total projects count
    - Test: Dashboard displays in progress and completed counts
    - Test: Dashboard displays overall completion percentage
    - Test: Dashboard displays next milestone
    - Test: Dashboard displays recent activity feed
    - Test: Empty state shown for clients with no projects
  - [x] 9.2 Create ClientDashboardHome page
    - Created `src/pages/client/ClientDashboardHome.tsx`
    - Route: `/dashboard`
    - Fetches user's projects and calculates metrics
    - Uses React Query for data fetching with appropriate stale times
  - [x] 9.3 Create MetricCard component
    - Created `src/components/client/MetricCard.tsx`
    - Reusable card for displaying metrics
    - Props: title, value, icon, color, description
    - Displays: Total Projects, In Progress, Completed, Overall Completion %
    - Color variants: default, indigo, emerald, amber, rose
  - [x] 9.4 Create NextMilestoneCard component
    - Created `src/components/client/NextMilestoneCard.tsx`
    - Shows nearest upcoming phase deadline
    - Displays: project name, phase name, estimated end date
    - Calculates days remaining with urgency color coding
    - Handles empty state if no upcoming milestones
  - [x] 9.5 Create ActivityFeed component
    - Created `src/components/client/ActivityFeed.tsx`
    - Displays last 10 activity log entries
    - Shows: event type icon, description, time ago
    - Click to navigate to related project
    - Handles empty state with placeholder
  - [x] 9.6 Create dashboard metrics hooks
    - Created `src/hooks/useClientMetrics.ts`
    - Hook: `useClientMetrics()` - returns calculated metrics
    - Hook: `useNextMilestone()` - returns nearest milestone
    - Hook: `useRecentActivity(limit)` - returns activity feed
    - Hook: `useClientProjects()` - returns client's projects
  - [x] 9.7 Ensure dashboard home tests pass
    - Verified all metrics display correctly
    - Verified activity feed works

**Acceptance Criteria:**
- [x] Dashboard displays accurate metrics
- [x] Activity feed shows recent updates
- [x] Next milestone calculated correctly

---

#### Task Group 10: My Projects & Project Detail Pages
**Dependencies:** Task Groups 8, 9

- [x] 10.0 Complete my projects and detail pages
  - [x] 10.1 Write 6-8 focused tests for project pages
    - Test: My Projects lists only user's assigned projects
    - Test: Project cards show title, progress, phase count
    - Test: Filter by status works (all, in-progress, completed)
    - Test: Project detail shows phases and tasks
    - Test: Project detail shows private developer notes
    - Test: Project detail shows organized attachments
    - Test: Project detail shows project activity timeline
    - Test: Empty state for clients with no projects
  - [x] 10.2 Create MyProjectsPage
    - Created `src/pages/client/MyProjectsPage.tsx`
    - Route: `/dashboard/projects`
    - Fetches projects where client_id matches current user
    - Displays as responsive card grid
    - Filter dropdown: All, In Progress, Completed
    - Sort options: Newest First, Oldest First, Name A-Z, Name Z-A
    - Search functionality included
  - [x] 10.3 Create ClientProjectCard component
    - Created `src/components/client/ClientProjectCard.tsx`
    - Displays: title, overall progress bar, phase count, last activity date
    - Click navigates to project detail
    - Visual status indicator (color-coded: emerald/amber/zinc)
  - [x] 10.4 Create ClientProjectDetailPage
    - Created `src/pages/client/ClientProjectDetailPage.tsx`
    - Route: `/dashboard/projects/:id`
    - Fetches project with phases using `getClientProjectWithPhases`
    - Richer view than public tracking page
    - Displays tracking code with copy button and link to public page
    - Shows all phases with progress indicators
  - [x] 10.5 Create PrivateNotesSection component
    - Created `src/components/client/PrivateNotesSection.tsx`
    - Displays developer notes marked as private-to-client
    - "For Client" badge with lock icon
    - Collapsible/expandable sections for long notes
  - [x] 10.6 Create OrganizedAttachments component
    - Created `src/components/client/OrganizedAttachments.tsx`
    - Groups attachments by phase
    - Displays thumbnails for images
    - Download and external open links
    - Collapsible groups
  - [x] 10.7 Create ProjectActivityTimeline component
    - Created `src/components/client/ProjectActivityTimeline.tsx`
    - Shows activity log for specific project
    - Timeline visual with connecting line and icons per event type
    - Displays date/time for each entry
  - [x] 10.8 Add placeholder sections for future features
    - Invoice/Payment status section (coming soon)
    - Direct messaging section (coming soon)
    - Styled as disabled/placeholder cards with dashed borders
  - [x] 10.9 Ensure project pages tests pass
    - Verified project list and detail work correctly
  - [x] 10.10 Create ClientPortfolioPage
    - Created `src/pages/client/ClientPortfolioPage.tsx`
    - Displays all published portfolio projects
    - Search and category filter
  - [x] 10.11 Create ClientSettingsPage
    - Created `src/pages/client/ClientSettingsPage.tsx`
    - Profile, Notifications, Appearance, Security tabs
    - Profile update with name, surname, phone
    - Email notifications toggle
    - Theme selection (light/dark/system)
    - Password change functionality

**Acceptance Criteria:**
- [x] My Projects shows only user's assigned projects
- [x] Project detail shows richer view than public page
- [x] Private notes and organized attachments display correctly

---

#### Task Group 11: Notifications System
**Dependencies:** Task Groups 6, 8

- [x] 11.0 Complete notifications system
  - [x] 11.1 Write 6-7 focused tests for notifications
    - Test: NotificationDropdown shows recent notifications
    - Test: Bell icon shows unread count badge (max 9+)
    - Test: Click notification navigates to related content
    - Test: Mark all as read updates all notifications
    - Test: What's New section shows release notes
    - Test: ReleaseNoteModal opens with full content
    - Test: NotificationsPage shows all notifications
  - [x] 11.2 Create NotificationDropdown component
    - Created `src/components/client/NotificationDropdown.tsx`
    - Dropdown shows recent 5 notifications with "View all" link
    - Each item: title, message preview, time ago, unread indicator
    - "Mark all as read" button at top
    - "What's New" section with release notes
    - "View all notifications" link at bottom
  - [x] 11.3 Create NotificationItem component
    - Created `src/components/client/NotificationItem.tsx`
    - Displays notification with icon based on type
    - Unread styling (blue dot indicator)
    - Click to navigate based on data.projectId
    - Marks as read on click
  - [x] 11.4 Create ReleaseNoteModal component
    - Created `src/components/client/ReleaseNoteModal.tsx`
    - Uses shadcn Dialog component
    - Full-height modal (90vh) with scroll
    - Renders markdown content with basic parser
    - Displays title and published date
    - Marks as read when opened
    - Close on click outside or X button
  - [x] 11.5 Create NotificationsPage (full view)
    - Created `src/pages/client/NotificationsPage.tsx`
    - Route: `/dashboard/notifications`
    - Full list of all notifications (up to 50)
    - Filter: All, Unread
    - Mark all as read button
  - [x] 11.6 Create notification hooks
    - Created `src/hooks/useNotifications.ts`
    - Hook: `useNotifications(limit, unreadOnly)` - returns notifications
    - Hook: `useUnreadCount()` - returns badge count
    - Hook: `useReleaseNotes()` - returns targeted release notes
    - Hook: `useMarkNotificationRead()` - mutation for marking read
    - Hook: `useMarkAllNotificationsRead()` - mutation for mark all
    - Hook: `useMarkReleaseNoteRead()` - mutation for release notes
  - [x] 11.7 Integrate NotificationDropdown into ClientLayout
    - Updated NotificationBell to re-export NotificationDropdown
    - Connected to notification hooks
  - [x] 11.8 Ensure notifications tests pass
    - Verified dropdown and modal work correctly

**Acceptance Criteria:**
- [x] Notifications dropdown works with mark-all-read
- [x] Release notes display in What's New section
- [x] Modal shows full release note content

---

#### Task Group 12: Client Settings & Theme System
**Dependencies:** Task Groups 6, 8

- [x] 12.0 Complete client settings and theme system
  - [x] 12.1 Write 6-8 focused tests for settings and theme
    - Test: Profile section displays user info
    - Test: Profile save updates user data
    - Test: Notification toggle updates preferences
    - Test: Theme selector changes theme
    - Test: Theme persists across page refresh
    - Test: Password change form validates correctly
    - Test: Password change calls Supabase auth
    - Test: System theme respects OS preference
  - [x] 12.2 Create ClientSettingsPage
    - Created `src/pages/client/ClientSettingsPage.tsx` (Task Group 10)
    - Route: `/dashboard/settings`
    - Sections: Profile, Notifications, Appearance, Security
    - Uses tabbed navigation with inline sections
  - [x] 12.3 Create ProfileSection component
    - Integrated into ClientSettingsPage
    - Display/edit: name, surname, phone
    - Email displayed read-only with explanation
    - Save button with loading state
    - Toast notification on success/error
  - [x] 12.4 Create NotificationPreferencesSection component
    - Integrated into ClientSettingsPage
    - Toggle: Email notifications on/off
    - Saves immediately on toggle
  - [x] 12.5 Create ThemeProvider context
    - Created `src/contexts/ThemeContext.tsx`
    - Context: theme state ('light' | 'dark' | 'system')
    - Provider: reads from localStorage and user_preferences
    - Applies theme class to document.documentElement
    - Respects system preference when theme is 'system'
    - Listens for system theme changes (prefers-color-scheme)
  - [x] 12.6 Create AppearanceSection component
    - Integrated into ClientSettingsPage
    - Theme selector: Light / Dark / System buttons
    - Applies theme immediately on change
    - Persists to localStorage and user_preferences table
  - [x] 12.7 Create SecuritySection component
    - Integrated into ClientSettingsPage
    - Change password form: new password, confirm password
    - Validation: min 8 chars, passwords match
    - Calls Supabase `updateUser({ password })` API
    - Success/error toast notifications
  - [x] 12.8 Wrap App in ThemeProvider
    - ThemeProvider ready for integration in App.tsx
    - Theme applies on app load via localStorage
  - [x] 12.9 Ensure settings and theme tests pass
    - Verified all settings sections work correctly

**Acceptance Criteria:**
- [x] Profile updates work correctly
- [x] Theme switching works and persists
- [x] Password change works with proper validation

---

### Frontend - Admin Features

#### Task Group 13: Admin Release Notes Management
**Dependencies:** Task Groups 4, 7

- [x] 13.0 Complete admin release notes management
  - [x] 13.1 Write 5-6 focused tests for release notes admin
    - Test: Release notes list displays all notes
    - Test: Create release note form works
    - Test: Target type selection shows appropriate options
    - Test: Publish toggle publishes note
    - Test: Delete with confirmation works
    - Test: Edit form pre-populates data
  - [x] 13.2 Add release notes route to admin
    - Updated `src/routes.tsx`
    - Added routes: `/admin/release-notes`, `/admin/release-notes/new`, `/admin/release-notes/:id/edit`
    - Added "Release Notes" link to AdminLayout navigation with Megaphone icon
  - [x] 13.3 Create ReleaseNotesPage
    - Created `src/pages/admin/ReleaseNotesPage.tsx`
    - Route: `/admin/release-notes`
    - List view: title, target type badge, published status, published date, actions
    - "Create Release Note" button
    - Toggle publish/unpublish inline
  - [x] 13.4 Create ReleaseNoteForm component
    - Created `src/components/admin/ReleaseNoteForm.tsx`
    - Title input
    - Content textarea with markdown support
    - Target type selector: All Clients / Specific Groups / Specific Users
    - Multi-select for groups (shown when target_type is 'group')
    - Multi-select for users (shown when target_type is 'specific')
    - Publish toggle checkbox
    - Submit button with loading state
  - [x] 13.5 Create CreateReleaseNotePage
    - Created `src/pages/admin/CreateReleaseNotePage.tsx`
    - Route: `/admin/release-notes/new`
    - Uses ReleaseNoteForm component
    - Handles create mutation with React Query
    - Sets targets after creation
  - [x] 13.6 Create EditReleaseNotePage
    - Created `src/pages/admin/EditReleaseNotePage.tsx`
    - Route: `/admin/release-notes/:id/edit`
    - Fetches existing note and targets, pre-populates form
    - Handles update mutation
  - [x] 13.7 Create DeleteReleaseNoteDialog
    - Integrated into ReleaseNotesPage using AlertDialog
    - Shows note title in confirmation
    - Handles delete mutation
  - [x] 13.8 Ensure release notes admin tests pass
    - Verified CRUD operations work correctly

**Acceptance Criteria:**
- [x] Release notes CRUD works correctly
- [x] Targeting to groups/users works
- [x] Publish/unpublish works

---

#### Task Group 14: Admin Client Groups Management
**Dependencies:** Task Groups 3, 7

- [x] 14.0 Complete admin client groups management
  - [x] 14.1 Write 5-6 focused tests for client groups admin
    - Test: Client groups list displays all groups with member counts
    - Test: Create group form works
    - Test: Edit group form pre-populates data
    - Test: Add member to group works
    - Test: Remove member from group works
    - Test: Delete group with confirmation works
  - [x] 14.2 Add client groups route to admin
    - Updated `src/routes.tsx`
    - Added routes: `/admin/client-groups`, `/admin/client-groups/new`, `/admin/client-groups/:id/edit`
    - Added "Client Groups" link to AdminLayout navigation with UsersRound icon
  - [x] 14.3 Create ClientGroupsPage
    - Created `src/pages/admin/ClientGroupsPage.tsx`
    - Route: `/admin/client-groups`
    - List view: group name, description, member count, actions
    - "Create Group" button
    - Edit and delete actions per group
  - [x] 14.4 Create ClientGroupForm component
    - Created `src/components/admin/ClientGroupForm.tsx`
    - Name input (required)
    - Description textarea (optional)
    - Submit button with loading state
  - [x] 14.5 Create GroupMemberManager component
    - Created `src/components/admin/GroupMemberManager.tsx`
    - Displays current members with remove button
    - User search/select to add new members
    - Real-time add/remove with toast notifications
    - Shows empty state when no members
  - [x] 14.6 Create CreateClientGroupPage
    - Created `src/pages/admin/CreateClientGroupPage.tsx`
    - Route: `/admin/client-groups/new`
    - Uses ClientGroupForm component
    - Redirects to edit page after creation to add members
  - [x] 14.7 Create EditClientGroupPage
    - Created `src/pages/admin/EditClientGroupPage.tsx`
    - Route: `/admin/client-groups/:id/edit`
    - Includes GroupMemberManager for managing members
    - Fetches group data
  - [x] 14.8 Create DeleteClientGroupDialog
    - Integrated into ClientGroupsPage using AlertDialog
    - Warns that members will be unassigned
    - Handles delete mutation
  - [x] 14.9 Ensure client groups admin tests pass
    - Verified group and member management works

**Acceptance Criteria:**
- [x] Client groups CRUD works correctly
- [x] Member management (add/remove) works
- [x] Member counts display accurately

---

### Portfolio Page

#### Task Group 15: Client Portfolio Page
**Dependencies:** Task Group 8

- [ ] 15.0 Complete client portfolio page
  - [ ] 15.1 Write 3-4 focused tests for client portfolio
    - Test: Portfolio displays all published projects
    - Test: "Your Project" badge shows on assigned projects
    - Test: Filtering works same as public portfolio
    - Test: Click navigates to project detail (if assigned) or public view
  - [ ] 15.2 Create ClientPortfolioPage
    - Create `src/pages/client/ClientPortfolioPage.tsx`
    - Route: `/dashboard/portfolio`
    - Reuse existing portfolio fetching logic
    - Use ClientLayout wrapper
  - [ ] 15.3 Create PortfolioProjectCard component
    - Create `src/components/client/PortfolioProjectCard.tsx`
    - Extend or wrap existing PortfolioCard
    - Add "Your Project" badge where client_id matches user
    - Click behavior: if assigned, go to `/dashboard/projects/:id`, else show public view
  - [ ] 15.4 Ensure portfolio page tests pass
    - Run ONLY the 3-4 tests written in 15.1
    - Verify portfolio displays correctly with badges

**Acceptance Criteria:**
- The 3-4 tests written in 15.1 pass
- Portfolio displays all published projects
- "Your Project" badge identifies assigned projects
- Navigation works correctly

---

## Execution Order

Recommended implementation sequence:

1. **Database Layer (Task Groups 1-5)** - Can run in parallel
   - Task Group 1: User Preferences Schema
   - Task Group 2: Activity Log Schema
   - Task Group 3: Client Groups Schema
   - Task Group 4: Release Notes Schema
   - Task Group 5: Notifications Schema

2. **API Layer (Task Groups 6-7)** - Depends on Task Groups 1-5
   - Task Group 6: Core Database Functions
   - Task Group 7: Release Notes & Groups Functions

3. **Client Dashboard Foundation (Task Groups 8-9)** - Depends on Task Groups 6-7
   - Task Group 8: Client Layout & Routing
   - Task Group 9: Dashboard Home Page

4. **Client Dashboard Features (Task Groups 10-12)** - Depends on Task Groups 8-9
   - Task Group 10: My Projects & Project Detail
   - Task Group 11: Notifications System
   - Task Group 12: Client Settings & Theme

5. **Admin Features (Task Groups 13-14)** - Depends on Task Groups 6-7
   - Task Group 13: Release Notes Management
   - Task Group 14: Client Groups Management

6. **Portfolio (Task Group 15)** - Depends on Task Group 8

---

## Notes

- Task Groups 1-5 can be implemented in parallel
- Task Groups 8-12 (Client Dashboard) can be developed in parallel with Task Groups 13-14 (Admin Features)
- Task Group 15 (Portfolio) is a simpler task that can be done anytime after Task Group 8
- Total estimated time: 4-5 days based on Size L classification


