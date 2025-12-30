# Specification: Admin Dashboard Foundation

## Goal

Create a protected admin-only dashboard interface with mobile-responsive top navigation, dashboard overview page with statistics, and comprehensive user management capabilities including full CRUD operations and password reset functionality.

## User Stories

- As an admin, I want to access a secure dashboard with overview statistics so that I can quickly understand the current state of the application and user base.
- As an admin, I want to view, edit, delete, and manage user accounts including role changes and password resets so that I can effectively manage the user base.
- As an admin, I want a mobile-responsive navigation interface so that I can access admin features from any device.

## Specific Requirements

**Admin Dashboard Layout**
- Create `AdminLayout` component with top navigation bar (not sidebar) for mobile-responsive design
- Top navigation should include links to Dashboard, Users, and placeholder links for future features (Projects, Settings, etc.)
- Layout should use dark theme styling consistent with existing MainLayout (zinc-950 background, zinc-100 text)
- Implement responsive design that works on mobile devices with collapsible menu if needed
- Use shadcn/ui components for navigation elements (Button, DropdownMenu for mobile menu)
- Layout should wrap all admin routes and provide consistent navigation structure

**Route Protection & Structure**
- All admin routes should be under `/admin/*` path structure (e.g., `/admin`, `/admin/users`)
- Use existing `ProtectedRoute` component with `requiredRole="admin"` for all admin routes
- Implement redirect logic so non-admin users attempting to access `/admin` routes are redirected to login or appropriate page
- Create nested route structure within admin layout using React Router `<Outlet>` pattern
- Add admin routes to `src/routes.tsx` following existing route patterns

**Dashboard Overview Page**
- Create dashboard home page at `/admin` route showing summary statistics
- Display key metrics in card/widget format: total users count, recent signups (last 7 days), total admins, total clients
- Show recent activity feed or list of recent user signups with timestamps
- Use shadcn/ui Card components for metric widgets with consistent dark theme styling
- Implement data fetching using React Query or similar for efficient data loading
- Display loading states while fetching dashboard statistics

**User List Page**
- Create user list page at `/admin/users` route displaying all users in table format
- Table columns: name, email, role, phone (if available), created date
- Use shadcn/ui Table component for consistent styling with existing design system
- Implement pagination or infinite scroll for large user lists (if needed)
- Add search/filter functionality to find users by name or email
- Display loading states and error handling for user list data fetching

**User Management - View & Edit**
- Implement view user details functionality (modal or separate page) showing full user information
- Create edit user form allowing admins to update: name, surname, email, phone
- Use React Hook Form + Zod for form validation following existing validation patterns
- Display success/error feedback using shadcn/ui Toast or Alert components
- Update user records in Supabase `users` table using existing database functions or new admin-specific functions
- Ensure RLS policies allow admin access to all user records (already configured in existing migration)

**User Management - Role Changes**
- Implement role change functionality allowing admins to promote users to admin or demote to client
- Use dropdown or toggle component (shadcn/ui Select) for role selection
- Display confirmation dialog before changing user roles to prevent accidental changes
- Update `role` field in `users` table via Supabase client
- Show success notification after role change and refresh user list

**User Management - Delete Users**
- Implement delete user functionality with confirmation dialog before deletion
- Delete should remove user record from `users` table (cascade will handle auth.users deletion if configured)
- Display warning message explaining deletion consequences
- Refresh user list after successful deletion
- Handle errors gracefully if deletion fails (e.g., user has associated data)

**Password Reset Functionality**
- Implement "Send Password Reset" action for each user in user list
- Use Supabase's built-in `resetPasswordForEmail` function from auth client
- Display success notification confirming password reset email was sent
- Handle errors if email sending fails (invalid email, network error, etc.)
- Add button/action in user list row or user details view

**Navigation Controls**
- Top navigation bar should include active route highlighting
- Add logout functionality in navigation (using existing auth signOut function)
- Display current admin user name/email in navigation if needed
- Implement mobile-responsive menu (hamburger menu) for smaller screens
- Placeholder links for future features should be visible but non-functional (can show "Coming Soon" or be disabled)

**Dashboard Widgets & Controls**
- Create reusable widget/card components for dashboard statistics
- Implement data refresh functionality (manual refresh button or auto-refresh)
- Use consistent spacing and typography from existing design system
- Ensure widgets are responsive and stack properly on mobile devices
- Add loading skeletons for better UX during data fetching

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)**
- Use existing component with `requiredRole="admin"` prop for all admin routes
- Component already handles authentication check and role verification
- Follows existing pattern of redirecting unauthorized users to login

**MainLayout Component (`src/layouts/MainLayout.tsx`)**
- Reference layout structure pattern (Outlet, main content area, consistent styling)
- Follow dark theme styling approach (zinc-950 background, zinc-100 text)
- Use similar component organization and structure for AdminLayout

**User Database Functions (`src/lib/db/users.ts`)**
- Extend existing `getUserByAuthId` and related functions for admin user queries
- Create new admin-specific functions: `getAllUsers()`, `updateUser()`, `deleteUser()`, `updateUserRole()`
- Follow existing Supabase query patterns and error handling
- Leverage existing User interface type definition

**Route Structure (`src/routes.tsx`)**
- Follow existing route organization pattern with MainLayout wrapper
- Use commented admin route examples as reference for route structure
- Integrate admin routes alongside existing public routes
- Maintain consistent route naming conventions

**Authentication & Auth State (`src/lib/auth.ts`, `src/hooks/useAuth.ts`)**
- Use existing `signOut` function for logout functionality in admin navigation
- Leverage existing auth state management for current user information
- Follow existing session management patterns for admin access verification

## Out of Scope

- Project management features (CRUD for projects, project phases, tasks) - coming in Phase 4
- Theme toggle functionality and admin theme controls - coming in Phase 8
- Blog management and content editing features - deferred to later phase
- Advanced admin features beyond user management (analytics, reports, etc.)
- Client dashboard features and client-specific functionality - separate phase
- Project tracking system and tracking code generation - separate phase
- Quote builder and pricing management - separate phase
- Email template customization or advanced email features
- User activity logging or audit trails beyond basic created_at timestamps
- Bulk user operations (bulk delete, bulk role changes, CSV import/export)

