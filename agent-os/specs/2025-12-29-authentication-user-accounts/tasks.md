# Task Breakdown: Authentication & User Accounts

## Overview
Total Tasks: 8 Task Groups

## Task List

### Database Layer

#### Task Group 1: Users Table Schema & RLS Policies
**Dependencies:** None

- [ ] 1.0 Complete database layer
  - [ ] 1.1 Write 3-5 focused tests for users table functionality
    - Test: Users table can be queried with valid auth_user_id
    - Test: Role enum accepts only 'admin' or 'client' values
    - Test: Foreign key constraint enforces valid auth_user_id reference
    - Test: RLS policy allows users to read their own data
    - Test: RLS policy prevents unauthorized access
  - [ ] 1.2 Create users table migration
    - Fields: `id` (UUID, primary key), `auth_user_id` (UUID, foreign key to `auth.users.id`, unique), `name` (text), `surname` (text), `email` (text, unique), `phone` (text), `role` (enum: 'admin', 'client'), `created_at` (timestamp), `updated_at` (timestamp)
    - Add index on: `auth_user_id`, `email`
    - Foreign key: `auth_user_id` references `auth.users(id)` on delete cascade
    - Create role enum type: `user_role` with values 'admin', 'client'
  - [ ] 1.3 Set up Row Level Security (RLS) policies
    - Policy: Users can SELECT their own row (WHERE auth_user_id = auth.uid())
    - Policy: Users can UPDATE their own row (name, surname, phone only)
    - Policy: Admins can SELECT all rows (WHERE role = 'admin' check)
    - Policy: Service role can INSERT/UPDATE/DELETE (for backend operations)
    - Enable RLS on users table
  - [ ] 1.4 Create database helper functions (if needed)
    - Function: Get user by auth_user_id
    - Function: Get user role by auth_user_id
    - Function: Create user record after Supabase auth signup
  - [ ] 1.5 Ensure database layer tests pass
    - Run ONLY the 3-5 tests written in 1.1
    - Verify migration runs successfully in Supabase
    - Verify RLS policies work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 1.1 pass
- Users table migration runs successfully
- RLS policies enforce correct access control
- Foreign key constraints work correctly

---

### Supabase Setup & Configuration

#### Task Group 2: Supabase Client & Auth Configuration
**Dependencies:** None

- [ ] 2.0 Complete Supabase setup and configuration
  - [ ] 2.1 Write 3-5 focused tests for Supabase client
    - Test: Supabase client initializes with environment variables
    - Test: Supabase client can connect to Supabase instance
    - Test: Auth methods are accessible (signUp, signIn, signOut)
    - Test: Session can be retrieved from client
  - [ ] 2.2 Install and configure Supabase packages
    - Install: `@supabase/supabase-js`
    - Create `src/lib/supabase.ts` with client initialization
    - Configure environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
    - Create `.env.example` with required variables
  - [ ] 2.3 Set up Firebase Realtime Database fallback (structure only)
    - Install: `firebase` package
    - Create `src/lib/firebase.ts` with Firebase initialization
    - Configure environment variables for Firebase (prepare for future use)
    - Create placeholder auth helper functions structure
  - [ ] 2.4 Configure Supabase email templates (in Supabase dashboard)
    - Set up email verification template
    - Configure email sender settings
    - Test email delivery (optional, can be done manually)
  - [ ] 2.5 Ensure Supabase setup tests pass
    - Run ONLY the 3-5 tests written in 2.1
    - Verify client connects successfully
    - Verify environment variables are loaded
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 2.1 pass
- Supabase client initializes correctly
- Environment variables are configured
- Firebase fallback structure is prepared

---

### Auth Utilities & Helpers

#### Task Group 3: Auth Helper Functions
**Dependencies:** Task Groups 1, 2

- [ ] 3.0 Complete auth utilities and helpers
  - [ ] 3.1 Write 4-6 focused tests for auth helpers
    - Test: signUp creates auth user and users table record
    - Test: signIn returns session with valid credentials
    - Test: signOut clears session and auth state
    - Test: getCurrentUser retrieves user with role from users table
    - Test: verifyEmail handles verification token correctly
    - Test: Helper functions handle errors gracefully
  - [ ] 3.2 Create auth helper functions
    - Create `src/lib/auth.ts` with auth utilities
    - Function: `signUp(email, password, name, surname, phone)` - creates auth user and users table record
    - Function: `signIn(email, password)` - authenticates and returns session
    - Function: `signOut()` - clears session and local storage
    - Function: `getCurrentUser()` - retrieves current user with role from users table
    - Function: `getSession()` - gets current session from Supabase
    - Function: `verifyEmail(token)` - handles email verification callback
  - [ ] 3.3 Implement user record creation after signup
    - After Supabase auth signup, create corresponding users table record
    - Set default role to 'client' for new signups
    - Handle errors if users table insert fails
    - Link auth_user_id to Supabase auth.users.id
  - [ ] 3.4 Create API auth middleware structure
    - Create `src/api/auth/middleware.ts` (per tech stack structure)
    - Middleware: Verify JWT token from request
    - Middleware: Check user role from users table
    - Middleware: Protect routes based on role requirements
  - [ ] 3.5 Ensure auth utilities tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify all helper functions work correctly
    - Verify error handling works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- All auth helper functions work correctly
- User records are created after signup
- Error handling is robust

---

### Auth State Management

#### Task Group 4: Global Auth State & Hooks
**Dependencies:** Task Groups 2, 3

- [ ] 4.0 Complete auth state management
  - [ ] 4.1 Write 3-5 focused tests for auth state
    - Test: useAuth hook returns current user when authenticated
    - Test: useAuth hook returns null when not authenticated
    - Test: Auth state updates after signIn
    - Test: Auth state clears after signOut
    - Test: Session refresh updates auth state
  - [ ] 4.2 Set up auth state management (React Query or Zustand)
    - Choose: React Query (recommended) or Zustand
    - Create `src/contexts/AuthContext.tsx` or `src/store/authStore.ts`
    - Implement auth state: `user`, `session`, `isLoading`, `isAuthenticated`
    - Create `useAuth()` hook for components to access auth state
  - [ ] 4.3 Implement session management
    - Store JWT tokens in localStorage (non-persistent - cleared on browser restart)
    - Implement session refresh logic for active sessions
    - Handle token expiration and automatic logout
    - Clear all auth data on explicit logout action
  - [ ] 4.4 Create auth provider/wrapper
    - Wrap app with AuthProvider (if using Context) or initialize store
    - Initialize auth state on app load (check for existing session)
    - Set up session refresh interval (if needed)
  - [ ] 4.5 Ensure auth state tests pass
    - Run ONLY the 3-5 tests written in 4.1
    - Verify auth state updates correctly
    - Verify session management works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 4.1 pass
- useAuth hook provides correct auth state
- Session management works correctly
- Auth state persists during active session only

---

### Frontend Components

#### Task Group 5: Login/Signup Modal Component
**Dependencies:** Task Groups 3, 4

- [ ] 5.0 Complete login/signup modal component
  - [ ] 5.1 Write 4-6 focused tests for auth modal
    - Test: Modal opens when auth button is clicked
    - Test: Login form submits with valid credentials
    - Test: Signup form validates required fields (name, surname, email, phone, password)
    - Test: Form shows error messages for invalid input
    - Test: Tab switching between Login and Sign Up works
    - Test: Modal closes after successful login/signup
  - [ ] 5.2 Create auth modal component structure
    - Create `src/components/AuthModal.tsx`
    - Use shadcn/ui Dialog component for modal
    - Implement tabbed interface: "Login" and "Sign Up" tabs
    - Apply dark theme styling (zinc-950 background, matching existing design)
  - [ ] 5.3 Implement signup form
    - Fields: name, surname, email, phone number, password (all required)
    - Use React Hook Form with Zod validation
    - Create Zod schema: `signupSchema` with all required fields
    - Password validation: minimum 8 characters (simple requirements)
    - Email validation: proper email format
    - Phone validation: basic phone number format
    - Display inline error messages using shadcn/ui components
    - Show loading state during submission (Loader2 icon)
  - [ ] 5.4 Implement login form
    - Fields: email, password
    - Use React Hook Form with Zod validation
    - Create Zod schema: `loginSchema` with email and password
    - Display inline error messages
    - Show loading state during submission
  - [ ] 5.5 Integrate forms with auth helpers
    - Connect signup form to `signUp()` helper function
    - Connect login form to `signIn()` helper function
    - Handle success: close modal, update auth state, show success message
    - Handle errors: display user-friendly error messages (invalid credentials, email not verified, etc.)
    - After signup: show "Check your email" confirmation message
  - [ ] 5.6 Add form UI polish
    - Use shadcn/ui Input, Button, Label components
    - Match ContactForm component styling patterns
    - Add smooth transitions and animations
    - Implement proper focus states and accessibility
  - [ ] 5.7 Ensure auth modal tests pass
    - Run ONLY the 4-6 tests written in 5.1
    - Verify forms validate and submit correctly
    - Verify error handling works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 5.1 pass
- Modal opens and closes correctly
- Both forms validate and submit correctly
- Error messages display appropriately
- Matches existing design system

---

### Navbar Integration

#### Task Group 6: Navbar Auth Button Integration
**Dependencies:** Task Groups 4, 5

- [ ] 6.0 Complete navbar integration
  - [ ] 6.1 Write 3-4 focused tests for navbar auth button
    - Test: Auth button renders in navbar (desktop and mobile)
    - Test: Button opens auth modal when clicked
    - Test: Button text changes to user name/email when authenticated
    - Test: Button shows "Login" when not authenticated
  - [ ] 6.2 Add auth button to Navbar component
    - Extend `src/components/Navbar.tsx`
    - Add "Login" button in desktop navigation (right side)
    - Add "Login" button in mobile menu
    - Button opens AuthModal when clicked
    - Maintain existing Navbar styling and responsive behavior
  - [ ] 6.3 Implement authenticated state display
    - Use `useAuth()` hook to get current user
    - When authenticated: show user name or email in button
    - When not authenticated: show "Login" text
    - Add logout functionality to button (dropdown menu or direct logout)
  - [ ] 6.4 Ensure navbar integration tests pass
    - Run ONLY the 3-4 tests written in 6.1
    - Verify button appears and functions correctly
    - Verify authenticated state displays correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 6.1 pass
- Auth button appears in navbar (desktop and mobile)
- Button opens modal correctly
- Authenticated state displays correctly

---

### Route Protection

#### Task Group 7: Protected Route Component
**Dependencies:** Task Groups 3, 4

- [ ] 7.0 Complete route protection system
  - [ ] 7.1 Write 4-5 focused tests for ProtectedRoute
    - Test: ProtectedRoute redirects to /login when unauthenticated
    - Test: ProtectedRoute renders children when authenticated
    - Test: ProtectedRoute checks role when requiredRole prop is provided
    - Test: ProtectedRoute redirects when role doesn't match
    - Test: ProtectedRoute handles loading state during auth check
  - [ ] 7.2 Create ProtectedRoute component
    - Create `src/components/ProtectedRoute.tsx`
    - Component checks Supabase auth session status using `useAuth()` hook
    - Verifies user role permissions from users table
    - Supports optional `requiredRole` prop (e.g., `requiredRole="admin"`)
    - Redirects to `/login` route if unauthenticated
    - Renders protected route children if authorized
    - Shows loading state while checking auth
  - [ ] 7.3 Integrate with React Router
    - Update `src/routes.tsx` to use ProtectedRoute wrapper
    - Add `/login` route for auth modal/page (if separate page needed)
    - Wrap future admin/client dashboard routes with `<ProtectedRoute>`
    - Example: `<Route element={<ProtectedRoute requiredRole="admin" />}>`
  - [ ] 7.4 Ensure route protection tests pass
    - Run ONLY the 4-5 tests written in 7.1
    - Verify route protection works correctly
    - Verify role-based access control works
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 4-5 tests written in 7.1 pass
- ProtectedRoute component works correctly
- Route protection enforces authentication
- Role-based access control works

---

### Email Verification & Polish

#### Task Group 8: Email Verification Flow & Error Handling
**Dependencies:** Task Groups 3, 5

- [ ] 8.0 Complete email verification and polish
  - [ ] 8.1 Write 3-4 focused tests for email verification
    - Test: Email verification callback handler processes token correctly
    - Test: User cannot login until email is verified
    - Test: Success message shows after email verification
    - Test: Error handling for invalid verification tokens
  - [ ] 8.2 Implement email verification callback handler
    - Create `/verify-email` route or callback handler
    - Extract verification token from URL parameters
    - Call Supabase `verifyEmail()` helper function
    - Redirect to login after successful verification
    - Show success message using Toast/Alert component
  - [ ] 8.3 Add email verification check to login
    - Prevent login if email is not verified
    - Show user-friendly error: "Please verify your email before logging in"
    - Provide link to resend verification email (optional, can be simple)
  - [ ] 8.4 Implement comprehensive error handling
    - Display user-friendly error messages for all auth failures
    - Use shadcn/ui Toast or Alert components for notifications
    - Handle network errors gracefully with retry options
    - Show success messages after signup and email verification
  - [ ] 8.5 Add loading states and polish
    - Implement proper loading states for all async auth operations
    - Add smooth transitions and animations
    - Ensure all forms have proper accessibility attributes
    - Match existing design system patterns
  - [ ] 8.6 Ensure email verification tests pass
    - Run ONLY the 3-4 tests written in 8.1
    - Verify email verification flow works
    - Verify error handling works correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- The 3-4 tests written in 8.1 pass
- Email verification flow works correctly
- Error handling is comprehensive and user-friendly
- All loading states and polish are implemented

---

### Testing

#### Task Group 9: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-8

- [ ] 9.0 Review existing tests and fill critical gaps only
  - [ ] 9.1 Review tests from Task Groups 1-8
    - Review the 3-5 tests written by database-engineer (Task 1.1)
    - Review the 3-5 tests written by Supabase-setup (Task 2.1)
    - Review the 4-6 tests written by auth-utilities (Task 3.1)
    - Review the 3-5 tests written by auth-state (Task 4.1)
    - Review the 4-6 tests written by frontend-components (Task 5.1)
    - Review the 3-4 tests written by navbar-integration (Task 6.1)
    - Review the 4-5 tests written by route-protection (Task 7.1)
    - Review the 3-4 tests written by email-verification (Task 8.1)
    - Total existing tests: approximately 28-40 tests
  - [ ] 9.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to authentication feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end workflows over unit test gaps
  - [ ] 9.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points and end-to-end workflows (e.g., full signup → email verification → login flow)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 9.4 Run feature-specific tests only
    - Run ONLY tests related to authentication feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, and 9.3)
    - Expected total: approximately 38-50 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 38-50 tests total)
- Critical user workflows for authentication are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on authentication feature requirements

---

## Execution Order

Recommended implementation sequence:
1. Database Layer (Task Group 1) - Foundation for user data
2. Supabase Setup & Configuration (Task Group 2) - Auth provider setup
3. Auth Utilities & Helpers (Task Group 3) - Core auth functions
4. Auth State Management (Task Group 4) - Global state for UI
5. Frontend Components (Task Group 5) - Login/signup UI
6. Navbar Integration (Task Group 6) - User access point
7. Route Protection (Task Group 7) - Secure routes
8. Email Verification & Polish (Task Group 8) - Complete flow
9. Test Review & Gap Analysis (Task Group 9) - Final verification

**Note:** Task Groups 1 and 2 can be done in parallel as they have no dependencies. Task Groups 5 and 6 should be done after Task Groups 3 and 4 are complete.

