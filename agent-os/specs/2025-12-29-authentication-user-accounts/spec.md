# Specification: Authentication & User Accounts

## Goal

Implement user authentication system with Supabase (Firebase Realtime Database as fallback), enabling signup/login flows, role-based access control, and route protection for admin/client dashboards.

## User Stories

- As a prospective client, I want to create an account with my contact information so that I can access my project dashboard and track progress.
- As an admin, I want secure authentication with role-based access so that only authorized users can access admin features.
- As a user, I want a simple login process accessible from the navbar so that I can quickly access my account without navigating to a separate page.

## Specific Requirements

**Supabase Authentication Setup**
- Configure Supabase client with environment variables for URL and anon key
- Set up Firebase Realtime Database as fallback authentication provider
- Install and configure `@supabase/supabase-js` package
- Create Supabase auth helpers for signup, login, logout, and session management
- Implement email verification flow (required before account activation)
- Configure JWT token storage (non-persistent sessions - require re-login on browser restart)

**User Database Schema**
- Create separate `users` table in PostgreSQL (not using Supabase auth metadata)
- Table structure: `id` (UUID, primary key), `auth_user_id` (foreign key to Supabase `auth.users.id`), `name`, `surname`, `email`, `phone`, `role` (enum: 'admin', 'client'), `created_at`, `updated_at`
- Set up Row Level Security (RLS) policies for user data access
- Create database migration for users table schema

**Login/Signup Modal Component**
- Create unified auth modal/page accessible via single navbar button
- Modal contains tabbed interface: "Login" and "Sign Up" tabs
- Signup form fields: name, surname, email, phone number, password (all required)
- Login form fields: email, password
- Use shadcn/ui Dialog/Modal component with dark theme styling (zinc-950 background)
- Form validation using React Hook Form + Zod schemas (per project standards)
- Password validation: minimum 8 characters, simple requirements (no complex rules)
- Display form errors inline with appropriate error messages
- Show loading states during form submission

**Navbar Integration**
- Add single "Login" or "Account" button to existing Navbar component (`src/components/Navbar.tsx`)
- Button opens auth modal when clicked
- Button text changes to user name/email when authenticated
- Button positioned in desktop navigation area (right side) and mobile menu
- Maintain existing Navbar styling and responsive behavior

**Route Protection System**
- Create `<ProtectedRoute>` wrapper component for route-level protection
- Component checks Supabase auth session status
- Verifies user role permissions (admin/client) from users table
- Redirects to `/login` route if unauthenticated
- Renders protected route children if authorized
- Support optional `requiredRole` prop for role-specific protection (e.g., `requiredRole="admin"`)
- Integrate with React Router using `<Route element={<ProtectedRoute />}>` pattern

**Auth State Management**
- Use React Query or Zustand for global auth state management
- Create auth context/hook to provide current user and session status
- Expose `useAuth()` hook for components to access auth state
- Handle session refresh and token validation
- Clear auth state on logout and browser restart (non-persistent sessions)

**API Layer & Backend Integration**
- Create `/api/auth` module with helpers and middleware (per tech stack structure)
- Implement auth middleware for protected API routes
- Create endpoints for user profile operations (if needed for future profile completion)
- Set up Supabase client-side auth methods (no separate backend auth endpoints needed initially)
- Prepare structure for Firebase Realtime Database fallback integration

**Email Verification Flow**
- Configure Supabase email templates for verification emails
- After signup, show "Check your email" confirmation message
- Create email verification callback handler route
- Redirect to login after successful email verification
- Prevent login until email is verified

**Session Management**
- Use Supabase built-in JWT token management
- Store tokens in localStorage (non-persistent - cleared on browser restart)
- Implement session refresh logic for active sessions
- Handle token expiration and automatic logout
- Clear all auth data on explicit logout action

**Error Handling & User Feedback**
- Display user-friendly error messages for auth failures (invalid credentials, email not verified, etc.)
- Show success messages after signup and email verification
- Handle network errors gracefully with retry options
- Implement proper loading states for all async auth operations
- Use shadcn/ui Toast or Alert components for notifications

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**Navbar Component (`src/components/Navbar.tsx`)**
- Extend existing Navbar to add auth button in desktop and mobile navigation
- Maintain current styling patterns (zinc-950 background, transparent/blur effects)
- Follow existing responsive menu structure and animations
- Use existing `cn()` utility and styling patterns

**Form Validation Patterns (`agent-os/standards/global/validation.md`)**
- Follow React Hook Form + Zod validation patterns from standards
- Use `zodResolver` for form validation
- Implement error display patterns matching existing ContactForm component
- Follow schema definition patterns for login and signup forms

**ContactForm Component (`src/components/ContactForm.tsx`)**
- Reference form structure and error handling patterns
- Use same shadcn/ui form components (Input, Button, Label, Card)
- Follow loading state patterns with Loader2 icon
- Match success/error feedback UI patterns

**React Router Setup (`src/routes.tsx`)**
- Extend existing route structure with protected routes
- Follow current MainLayout wrapper pattern
- Add `/login` route for auth modal/page
- Integrate ProtectedRoute wrapper for future admin/client dashboard routes

**shadcn/ui Components**
- Use Dialog/Modal component for auth modal
- Leverage existing Input, Button, Label, Card components for forms
- Match dark theme styling (zinc-950, zinc-800, zinc-400 color scheme)
- Follow existing component patterns and accessibility standards

## Out of Scope

- Social authentication (Google OAuth) - to be added in future iteration
- Profile completion UI and functionality - deferred to later feature
- Password reset/forgot password flow - not included in initial implementation
- Complex password requirements (uppercase, numbers, special characters) - keeping simple for now
- Persistent sessions across browser restarts - explicitly non-persistent per requirements
- Component-level route protection - using route-level protection instead
- User profile editing and management pages - profile completion deferred
- Admin user management UI - will be part of Admin Dashboard Foundation spec
- Multi-factor authentication (MFA) - not required for initial implementation
- Session timeout warnings or automatic extension - basic session management only

