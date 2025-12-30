# Spec Requirements: Admin Dashboard Foundation

## Initial Description

Protected admin-only UI, layout, basic controls + user list.

## Requirements Discussion

### First Round Questions

**Q1:** Dashboard Layout Structure: I'm assuming a standard admin layout with a sidebar navigation and a top header bar. Should we use a collapsible sidebar (desktop) that can expand/collapse, or a fixed sidebar? Should the layout be responsive with a mobile hamburger menu?

**Answer:** Mobile responsive but top bar navigation still

**Q2:** Navigation Structure: For this foundation phase, I'm thinking the sidebar should include at least a "Dashboard" (home/overview) link and a "Users" link. Should we also include placeholder links for future features (Projects, Settings, etc.) that will be implemented later, or keep it minimal with just what's functional now?

**Answer:** Yes to the placeholders

**Q3:** User List Functionality: For the user list, I'm assuming we need to display all users in a table with columns like name, email, role, and created date. Should admins be able to:
- View user details (read-only)?
- Edit user information (name, email, phone)?
- Change user roles (promote to admin, demote to client)?
- Delete users?
Or should the user list be view-only for this foundation phase?

**Answer:** Admins should be able to do everything including sending a password reset link

**Q4:** Basic Controls Definition: When you mention "basic controls," are you referring to:
- Navigation controls (sidebar, header actions)?
- User management controls (edit, delete, role change buttons)?
- Dashboard overview widgets/cards (user count, recent activity)?
- All of the above?

**Answer:** All of the above

**Q5:** Dashboard Overview Page: Should there be a dashboard home/overview page with summary statistics (total users, recent signups, etc.), or should the dashboard route directly to the user list as the primary view?

**Answer:** Dashboard overview

**Q6:** Route Protection: I see you already have `ProtectedRoute` with role checking. Should all admin routes be under `/admin/*` (e.g., `/admin`, `/admin/users`), and should we add a redirect so non-admin users who try to access `/admin` get redirected appropriately?

**Answer:** Yes to the redirect

**Q7:** Out of Scope: For this foundation phase, I'm assuming we're NOT building project management, theme toggles, or other advanced features (those come later per the roadmap). Is there anything else we should explicitly exclude from this phase?

**Answer:** You are right

### Existing Code to Reference

No similar existing features identified for reference.

**Note:** The codebase has:
- `ProtectedRoute` component with role checking (`src/components/ProtectedRoute.tsx`)
- Authentication middleware with role verification (`src/api/auth/middleware.ts`)
- User database functions (`src/lib/db/users.ts`)
- Main layout pattern (`src/layouts/MainLayout.tsx`) that can be referenced for layout structure
- Route structure in `src/routes.tsx` with commented admin route examples

### Follow-up Questions

None required - all requirements are clear.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - No visual assets to analyze.

## Requirements Summary

### Functional Requirements

- **Admin Dashboard Layout:**
  - Mobile-responsive layout with top bar navigation (not sidebar)
  - Top navigation bar with links to dashboard sections
  - Responsive design that works on mobile devices

- **Navigation Structure:**
  - Dashboard (home/overview) link
  - Users link (functional)
  - Placeholder links for future features (Projects, Settings, etc.) - non-functional but visible

- **Dashboard Overview Page:**
  - Summary statistics (total users, recent signups, etc.)
  - Overview widgets/cards showing key metrics
  - Recent activity display

- **User List & Management:**
  - Display all users in a table format
  - Columns: name, email, role, created date (and potentially other relevant fields)
  - Full CRUD operations:
    - View user details
    - Edit user information (name, email, phone)
    - Change user roles (promote to admin, demote to client)
    - Delete users
    - Send password reset link (using Supabase's built-in functionality)

- **Basic Controls:**
  - Navigation controls (top bar navigation)
  - User management controls (edit, delete, role change, password reset buttons)
  - Dashboard overview widgets/cards (user count, recent activity, etc.)

- **Route Protection:**
  - All admin routes under `/admin/*` (e.g., `/admin`, `/admin/users`)
  - Use existing `ProtectedRoute` component with `requiredRole="admin"`
  - Redirect non-admin users who try to access `/admin` routes appropriately

### Reusability Opportunities

- **Components to reuse:**
  - `ProtectedRoute` component for route protection (`src/components/ProtectedRoute.tsx`)
  - Main layout pattern from `MainLayout.tsx` as reference for layout structure
  - Existing shadcn/ui components (Button, Input, Card, Table, etc.)

- **Backend patterns to investigate:**
  - Authentication middleware with role verification (`src/api/auth/middleware.ts`)
  - User database functions (`src/lib/db/users.ts`) for user CRUD operations
  - Supabase auth functions for password reset (`resetPasswordForEmail`)

- **Similar features to model after:**
  - Route structure pattern from `src/routes.tsx`
  - Authentication flow patterns from existing auth implementation

### Scope Boundaries

**In Scope:**
- Admin dashboard layout with top bar navigation (mobile responsive)
- Dashboard overview page with summary statistics
- User list with full CRUD operations
- User role management (promote/demote)
- Password reset link sending functionality
- Navigation with placeholder links for future features
- Route protection for `/admin/*` routes
- Basic controls (navigation, user management, dashboard widgets)

**Out of Scope:**
- Project management features (coming in Phase 4)
- Theme toggles (coming in Phase 8)
- Blog management
- Advanced admin features beyond user management
- Client dashboard features (separate phase)
- Project tracking system (separate phase)

### Technical Considerations

- **Integration points:**
  - Supabase Auth for password reset functionality (`resetPasswordForEmail`)
  - Existing user database table with role field
  - Existing authentication system with role checking
  - React Router for route management

- **Existing system constraints:**
  - Must use existing `ProtectedRoute` component pattern
  - Must respect existing role system ('admin' | 'client')
  - Must work with existing Supabase authentication
  - Must follow existing tech stack (React, Tailwind, shadcn/ui)

- **Technology preferences stated:**
  - React (latest)
  - Tailwind CSS v3
  - shadcn/ui components
  - TypeScript
  - React Router for routing

- **Similar code patterns to follow:**
  - Layout structure similar to `MainLayout.tsx`
  - Route protection pattern from `src/routes.tsx` commented examples
  - User database operations from `src/lib/db/users.ts`
  - Authentication patterns from `src/lib/auth.ts`

