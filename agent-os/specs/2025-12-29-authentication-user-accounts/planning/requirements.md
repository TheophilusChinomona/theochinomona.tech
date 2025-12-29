# Spec Requirements: Authentication & User Accounts

## Initial Description
Authentication & User Accounts

Supabase/Firebase auth, signup/login, role metadata prepared.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll use **Supabase** as the primary auth provider (as specified in your tech stack), with Firebase as a fallback option. Is that correct, or should we start with Firebase?

**Answer:** Use Supabase with Firebase Realtime Database as the fallback.

**Q2:** I'm thinking the signup should include email/password, with email verification required before account activation. Should we also include social auth options (Google, GitHub) from the start, or add those later?

**Answer:** Social auth options (Google) later.

**Q3:** Based on your roadmap mentioning "admin" and "client" users, I'm assuming we need at least these roles: `admin`, `client`, and possibly `guest`/`public`. Should role metadata be stored in Supabase's `auth.users` metadata, or in a separate `users` table with a foreign key?

**Answer:** Separate table.

**Q4:** I'm assuming login/signup pages will be separate routes (e.g., `/login`, `/signup`), styled with shadcn/ui components matching your existing design system. Should these pages be accessible from the Navbar, or only shown when accessing protected routes?

**Answer:** One button in the navbar to represent both. We will have a login page/modal and on the modal we also have the sign up which will require name, surname, email address for communication, phone number and password.

**Q5:** I'm assuming standard requirements: minimum 8 characters, with validation using Zod schemas (as per your standards). Should we require uppercase, numbers, or special characters, or keep it simple?

**Answer:** Keep it simple for now.

**Q6:** I'm thinking we'll use Supabase's built-in session management with JWT tokens stored in cookies/localStorage, and React Query or Zustand for auth state. Should sessions persist across browser restarts, or require re-login?

**Answer:** That's correct and we should require re-login.

**Q7:** I assume we'll need route protection middleware that checks auth status and roles before allowing access to admin/client dashboards. Should this be implemented at the route level using React Router guards, or component-level checks?

**Answer:** Which one is better? (Follow-up provided route-level protection recommendation)

**Q8:** Beyond email/password, should we collect any additional profile information during signup (name, company, etc.), or keep signup minimal and allow profile completion later?

**Answer:** Allow completion later.

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** For React Router, route-level protection is generally better because it's centralized, cleaner, better UX, and easier to maintain. I recommend creating a `<ProtectedRoute>` wrapper component that checks auth status, verifies role permissions (admin/client), redirects to `/login` if unauthenticated, and renders the protected route if authorized. Does this approach work for you, or do you prefer component-level checks?

**Answer:** Confirmed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- **Auth Provider**: Supabase as primary, Firebase Realtime Database as fallback
- **Signup Flow**: 
  - Single modal/page accessible from navbar button
  - Required fields: name, surname, email address, phone number, password
  - Email verification required before account activation
  - Social auth (Google) to be added later
- **Login Flow**: 
  - Same modal/page as signup, accessible from navbar button
  - Email/password authentication
  - Sessions do NOT persist - require re-login on browser restart
- **Role Management**: 
  - Roles stored in separate `users` table (not in Supabase auth metadata)
  - Roles needed: `admin`, `client` (and possibly `guest`/`public`)
- **Password Requirements**: 
  - Minimum 8 characters
  - Simple validation (no complex requirements)
  - Validation using Zod schemas (per project standards)
- **Route Protection**: 
  - Route-level protection using `<ProtectedRoute>` wrapper component
  - Checks auth status and role permissions
  - Redirects to `/login` if unauthenticated
  - Protects admin/client dashboard routes
- **User Profile**: 
  - Minimal signup (name, surname, email, phone, password)
  - Profile completion allowed later
- **Session Management**: 
  - Supabase built-in session management with JWT tokens
  - React Query or Zustand for auth state management
  - Sessions do not persist across browser restarts

### Reusability Opportunities
- Use existing Navbar component (`src/components/Navbar.tsx`) - add auth button
- Follow existing form validation patterns (React Hook Form + Zod) from `agent-os/standards/global/validation.md`
- Use shadcn/ui components matching existing design system
- Follow React Router patterns from `src/routes.tsx`

### Scope Boundaries
**In Scope:**
- Supabase authentication setup
- Firebase Realtime Database fallback configuration
- Login/signup modal/page with required fields
- Email verification flow
- Role-based access control (admin/client)
- Route-level protection for protected routes
- Session management (non-persistent)
- User table schema with role metadata
- Navbar integration (single auth button)

**Out of Scope:**
- Social authentication (Google) - to be added later
- Profile completion UI - to be added later
- Password reset flow - not explicitly mentioned
- Complex password requirements
- Persistent sessions
- Component-level route protection

### Technical Considerations
- **Frontend**: React + Tailwind CSS v3 + shadcn/ui components
- **Forms**: React Hook Form + Zod validation (per project standards)
- **Routing**: React Router with route-level guards
- **State Management**: React Query or Zustand for auth state
- **Auth Provider**: Supabase Auth (primary), Firebase Realtime Database (fallback)
- **Database**: Separate `users` table for role metadata (PostgreSQL via Supabase)
- **Session Storage**: JWT tokens (cookies/localStorage via Supabase)
- **Integration Points**: 
  - Navbar component needs auth button
  - Routes need `<ProtectedRoute>` wrapper
  - API layer needs auth helpers & middleware (per tech stack)
- **Design System**: Match existing shadcn/ui styling and dark theme (zinc-950 background)

