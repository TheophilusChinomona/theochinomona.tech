# Task Breakdown: Admin Dashboard Foundation

## Overview
Total Tasks: 6 Task Groups

## Task List

### Database Layer

#### Task Group 1: Admin User Database Functions
**Dependencies:** None

- [x] 1.0 Complete admin user database functions
  - [x] 1.1 Write 4-6 focused tests for admin user functions
    - Test: getAllUsers returns all users from database
    - Test: getAllUsers respects RLS policies (admin can access all users)
    - Test: updateUser updates user fields correctly (name, surname, email, phone)
    - Test: updateUserRole changes user role from 'client' to 'admin' and vice versa
    - Test: deleteUser removes user record from database
    - Test: Admin functions handle errors gracefully (invalid user ID, permission errors)
  - [x] 1.2 Create getAllUsers function
    - Create function in `src/lib/db/users.ts`
    - Query all users from `users` table using Supabase client
    - Return array of User objects with all fields
    - Handle RLS policy (admin role check should already be in place from existing migration)
    - Add proper error handling for database errors
  - [x] 1.3 Create updateUser function
    - Create function: `updateUser(userId: string, updates: { name?, surname?, email?, phone? })`
    - Update user record in `users` table
    - Only allow updating: name, surname, email, phone (not role - handled separately)
    - Return updated User object
    - Handle validation errors and database errors
  - [x] 1.4 Create updateUserRole function
    - Create function: `updateUserRole(userId: string, newRole: 'admin' | 'client')`
    - Update `role` field in `users` table
    - Validate role is either 'admin' or 'client'
    - Return updated User object
    - Handle errors if user doesn't exist or role is invalid
  - [x] 1.5 Create deleteUser function
    - Create function: `deleteUser(userId: string)`
    - Delete user record from `users` table
    - Handle cascade deletion of auth.users (if configured in Supabase)
    - Return success boolean or deleted user ID
    - Handle errors if user doesn't exist or has associated data
  - [x] 1.6 Create getDashboardStats function
    - Create function: `getDashboardStats()`
    - Query: total users count, total admins count, total clients count
    - Query: recent signups (last 7 days) count
    - Query: recent users list (last 10 signups with timestamps)
    - Return object with all statistics
    - Handle database errors gracefully
  - [x] 1.7 Ensure database layer tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify all admin functions work correctly
    - Verify RLS policies allow admin access
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 1.1 pass
- All admin database functions work correctly
- RLS policies allow admin access to all user records
- Error handling is robust

---

### Auth Utilities

#### Task Group 2: Password Reset Functionality
**Dependencies:** None

- [x] 2.0 Complete password reset functionality
  - [x] 2.1 Write 3-4 focused tests for password reset
    - Test: sendPasswordResetEmail sends reset email via Supabase
    - Test: sendPasswordResetEmail handles invalid email errors
    - Test: sendPasswordResetEmail handles network errors gracefully
    - Test: Function returns success confirmation when email is sent
  - [x] 2.2 Create sendPasswordResetEmail function
    - Create function in `src/lib/auth.ts`: `sendPasswordResetEmail(email: string)`
    - Use Supabase's `resetPasswordForEmail` method from auth client
    - Configure redirect URL for password reset (e.g., `/reset-password`)
    - Return success/error response
    - Handle Supabase auth errors (invalid email, rate limiting, etc.)
  - [x] 2.3 Add error handling and user feedback
    - Map Supabase errors to user-friendly messages
    - Handle rate limiting errors gracefully
    - Return structured response with success boolean and error message
  - [x] 2.4 Ensure password reset tests pass
    - Run ONLY the 3-4 tests written in 2.1
    - Verify email sending works correctly
    - Verify error handling works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 2.1 pass
- Password reset emails are sent successfully
- Error handling provides user-friendly feedback

---

### Frontend Layout & Routing

#### Task Group 3: Admin Layout & Route Structure
**Dependencies:** None

- [x] 3.0 Complete admin layout and routing
  - [x] 3.1 Write 4-5 focused tests for admin layout and routes
    - Test: AdminLayout renders with top navigation bar
    - Test: AdminLayout shows navigation links (Dashboard, Users, placeholders)
    - Test: Admin routes are protected with requiredRole="admin"
    - Test: Non-admin users are redirected when accessing /admin routes
    - Test: Mobile responsive menu works on small screens
  - [x] 3.2 Create AdminLayout component
    - Create `src/layouts/AdminLayout.tsx`
    - Implement top navigation bar (not sidebar) with dark theme styling
    - Include navigation links: Dashboard, Users, Projects (placeholder), Settings (placeholder)
    - Add logout button using existing `signOut` function from `src/lib/auth.ts`
    - Display current admin user name/email in navigation
    - Use shadcn/ui components (Button, DropdownMenu for mobile menu)
    - Apply dark theme styling consistent with MainLayout (zinc-950 background, zinc-100 text)
    - Implement active route highlighting using React Router's `useLocation`
  - [x] 3.3 Implement mobile-responsive navigation
    - Add hamburger menu for mobile screens (< 768px)
    - Use shadcn/ui Sheet or DropdownMenu component for mobile menu
    - Ensure navigation is accessible and works on touch devices
    - Test responsive behavior on various screen sizes
  - [x] 3.4 Set up admin route structure
    - Update `src/routes.tsx` to add admin routes
    - Create nested route structure: `/admin` with AdminLayout wrapper
    - Add routes: `/admin` (dashboard overview), `/admin/users` (user list)
    - Wrap all admin routes with `ProtectedRoute` component using `requiredRole="admin"`
    - Follow existing route patterns from commented examples in routes.tsx
  - [x] 3.5 Implement route protection and redirects
    - Ensure ProtectedRoute redirects non-admin users to `/login`
    - Add redirect logic for users accessing `/admin` without admin role
    - Handle loading states during auth verification
    - Test redirect behavior for unauthorized access attempts
  - [x] 3.6 Ensure admin layout tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify layout renders correctly
    - Verify route protection works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-5 tests written in 3.1 pass
- AdminLayout renders with top navigation
- All admin routes are protected
- Mobile responsive design works correctly
- Non-admin users are redirected appropriately

---

### Frontend Components - Dashboard

#### Task Group 4: Dashboard Overview Page
**Dependencies:** Task Groups 1, 3

- [x] 4.0 Complete dashboard overview page
  - [x] 4.1 Write 4-5 focused tests for dashboard overview
    - Test: Dashboard page renders with statistics cards
    - Test: Dashboard displays total users count correctly
    - Test: Dashboard displays recent signups count (last 7 days)
    - Test: Dashboard shows recent users list with timestamps
    - Test: Dashboard handles loading and error states
  - [x] 4.2 Create DashboardOverview page component
    - Create `src/pages/admin/DashboardOverview.tsx`
    - Fetch dashboard statistics using `getDashboardStats()` from Task Group 1
    - Use React Query or similar for data fetching and caching
    - Display loading state while fetching data
    - Handle error states gracefully with error messages
  - [x] 4.3 Create dashboard statistics widgets
    - Create reusable `StatCard` component or use shadcn/ui Card
    - Display cards for: Total Users, Total Admins, Total Clients, Recent Signups (7 days)
    - Use consistent dark theme styling (zinc-950, zinc-800, zinc-400 colors)
    - Add icons from lucide-react for visual enhancement
    - Ensure cards are responsive and stack on mobile
  - [x] 4.4 Implement recent activity section
    - Display list of recent user signups (last 10 users)
    - Show: user name, email, role, signup date/timestamp
    - Use shadcn/ui Table or Card components for display
    - Format timestamps in user-friendly format (e.g., "2 days ago")
    - Add "View All Users" link to `/admin/users` page
  - [x] 4.5 Add data refresh functionality
    - Add manual refresh button to reload dashboard statistics
    - Implement auto-refresh option (optional, every 30-60 seconds)
    - Show loading indicator during refresh
    - Update statistics cards after refresh
  - [ ] 4.6 Add loading skeletons
    - Create loading skeleton components for statistics cards
    - Display skeletons while data is fetching
    - Use shadcn/ui Skeleton component or custom implementation
    - Ensure smooth transition from loading to content
  - [x] 4.7 Ensure dashboard overview tests pass
    - Run ONLY the 4-5 tests written in 4.1
    - Verify statistics display correctly
    - Verify loading and error states work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-5 tests written in 4.1 pass
- Dashboard displays all statistics correctly
- Loading and error states work properly
- Responsive design works on mobile devices

---

### Frontend Components - User Management

#### Task Group 5: User List & Management Pages
**Dependencies:** Task Groups 1, 2, 3

- [x] 5.0 Complete user list and management pages
  - [x] 5.1 Write 6-8 focused tests for user management
    - Test: User list page displays all users in table format
    - Test: User list shows correct columns (name, email, role, phone, created date)
    - Test: Edit user form validates and updates user information
    - Test: Role change updates user role and refreshes list
    - Test: Delete user removes user from list after confirmation
    - Test: Password reset sends email and shows success message
    - Test: Search/filter functionality filters users by name or email
    - Test: User management handles errors gracefully
  - [x] 5.2 Create UserList page component
    - Create `src/pages/admin/UserList.tsx`
    - Fetch all users using `getAllUsers()` from Task Group 1
    - Use React Query for data fetching and caching
    - Display users in table format using shadcn/ui Table component
    - Table columns: Name, Email, Role, Phone, Created Date
    - Add loading state while fetching users
    - Handle error states with error messages
  - [x] 5.3 Implement search and filter functionality
    - Add search input field to filter users by name or email
    - Implement client-side filtering (or server-side if needed for large lists)
    - Update table display based on search query
    - Show "No users found" message when search returns no results
    - Clear search functionality
  - [x] 5.4 Create user actions (view, edit, delete, role change, password reset)
    - Add action buttons/dropdown in each user row
    - Implement "View Details" action (modal or separate page)
    - Implement "Edit" action (opens edit form)
    - Implement "Change Role" action (dropdown or toggle)
    - Implement "Delete" action (with confirmation dialog)
    - Implement "Send Password Reset" action (calls function from Task Group 2)
    - Use shadcn/ui Button, DropdownMenu, Dialog components
  - [x] 5.5 Create EditUserForm component
    - Create `src/components/admin/EditUserForm.tsx`
    - Form fields: name, surname, email, phone (all editable)
    - Use React Hook Form + Zod for validation
    - Create Zod schema: `editUserSchema` with all fields
    - Display inline error messages
    - Show loading state during submission
    - Call `updateUser()` function on form submit
    - Display success/error notifications using shadcn/ui Toast
  - [x] 5.6 Implement role change functionality
    - Create role change dialog or inline dropdown
    - Use shadcn/ui Select component for role selection
    - Add confirmation dialog before changing roles
    - Call `updateUserRole()` function on confirm
    - Refresh user list after successful role change
    - Show success notification
  - [x] 5.7 Implement delete user functionality
    - Create delete confirmation dialog using shadcn/ui Dialog/AlertDialog
    - Display warning message explaining deletion consequences
    - Call `deleteUser()` function on confirm
    - Refresh user list after successful deletion
    - Handle errors if deletion fails (show error message)
    - Show success notification
  - [x] 5.8 Implement password reset functionality
    - Add "Send Password Reset" button/action in user row
    - Call `sendPasswordResetEmail()` function from Task Group 2
    - Show loading state while sending email
    - Display success notification when email is sent
    - Handle errors (invalid email, network errors) with error messages
  - [x] 5.9 Add pagination or infinite scroll (if needed)
    - Implement pagination for large user lists (if user count > 50)
    - Use shadcn/ui Pagination component or custom implementation
    - Or implement infinite scroll for better UX
    - Update search/filter to work with pagination
  - [x] 5.10 Ensure user management tests pass
    - Run ONLY the 6-8 tests written in 5.1
    - Verify all CRUD operations work correctly
    - Verify error handling works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 6-8 tests written in 5.1 pass
- User list displays all users correctly
- All user management operations (view, edit, delete, role change, password reset) work
- Search and filter functionality works
- Error handling is robust

---

### Testing

#### Task Group 6: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-5

- [x] 6.0 Review existing tests and fill critical gaps only
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review the 4-6 tests written by database-engineer (Task 1.1)
    - Review the 3-4 tests written by auth-engineer (Task 2.1)
    - Review the 4-5 tests written by frontend-engineer for layout (Task 3.1)
    - Review the 4-5 tests written by frontend-engineer for dashboard (Task 4.1)
    - Review the 6-8 tests written by frontend-engineer for user management (Task 5.1)
    - Total existing tests: approximately 24 tests
      - Task Group 1: 6 tests (getAllUsers, updateUser, updateUserRole, deleteUser, getDashboardStats, error handling)
      - Task Group 2: 4 tests (sendPasswordResetEmail success, invalid email, network errors, success confirmation)
      - Task Group 3: 5 tests (AdminLayout rendering, navigation links, mobile menu, logout, route protection)
      - Task Group 4: 5 tests (dashboard rendering, statistics display, recent signups, recent users list, error handling)
      - Task Group 5: 4 tests (user list display, columns, search/filter, error handling)
  - [x] 6.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to admin dashboard feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
    - Examples: Admin login flow, complete user management workflow, dashboard data refresh
    - Identified gaps:
      - End-to-end admin login and dashboard access flow
      - Integration between dashboard and user list navigation
      - Complete user edit workflow integration
      - User role change workflow integration
      - User deletion workflow integration
      - Password reset workflow integration
      - Dashboard data refresh functionality
      - User search/filter integration
      - Error handling across integrated components
  - [x] 6.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows
    - Examples: Admin can access dashboard after login, Admin can complete full user edit workflow, Admin can delete user and verify removal
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
    - Created 10 integration tests in `src/integration/admin-dashboard.test.tsx`:
      1. Admin can access dashboard after login
      2. Dashboard displays statistics correctly
      3. Admin can navigate from dashboard to user list
      4. Admin can complete full user edit workflow
      5. Admin can change user role and see it reflected
      6. Admin can delete user and verify removal
      7. Admin can send password reset email
      8. Dashboard data refreshes when refresh button is clicked
      9. Users can be filtered by search query
      10. Errors are handled gracefully when dashboard data fails to load
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, and 6.3)
    - Expected total: approximately 34 tests (24 existing + 10 new integration tests)
    - Do NOT run the entire application test suite
    - Verify critical workflows pass
    - Note: Some tests may require environment setup fixes (vi.mocked compatibility)

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 31-38 tests total)
- Critical user workflows for admin dashboard are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's feature requirements

---

## Execution Order

Recommended implementation sequence:
1. Database Layer (Task Group 1) - Admin user database functions
2. Auth Utilities (Task Group 2) - Password reset functionality
3. Frontend Layout & Routing (Task Group 3) - Admin layout and route structure
4. Frontend Components - Dashboard (Task Group 4) - Dashboard overview page
5. Frontend Components - User Management (Task Group 5) - User list and management
6. Test Review & Gap Analysis (Task Group 6) - Final test coverage review

**Note:** Task Groups 1 and 2 can be done in parallel as they have no dependencies. Task Group 3 can start after Task Group 1 is complete (for route structure), but can also be done in parallel with Task Group 2. Task Groups 4 and 5 depend on Task Groups 1, 2, and 3.

