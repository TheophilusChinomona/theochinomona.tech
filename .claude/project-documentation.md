# theochinomona.tech - Project Documentation

*Last Updated: 2025-01-02*

---

## Project Overview

**theochinomona.tech** is a full-stack web application that serves as both a developer portfolio website and a comprehensive client portal system. The application provides:

- **Public Portfolio**: Showcase of completed projects with filtering and search
- **Client Dashboard**: Project tracking, billing, notifications, and communication tools
- **Admin Dashboard**: Complete project and user management, invoicing, client groups, and analytics
- **Project Management**: Phases, tasks, comments, templates, and activity tracking
- **Billing System**: Invoices, payments, subscriptions, tax rates, and refunds
- **Communication**: Project comments with attachments, notifications, and release notes

The application is built as a modern React SPA with Supabase as the backend, providing real-time capabilities, file storage, and secure authentication.

---

## Tech Stack

### Frontend
- **React 19.0.0** - UI framework with latest features
- **TypeScript 5.7.2** - Type-safe JavaScript
- **Vite 6.0.5** - Build tool and dev server
- **React Router DOM 7.11.0** - Client-side routing
- **TanStack React Query 5.90.15** - Server state management
- **Zustand 5.0.9** - Global state management (auth)
- **React Hook Form 7.69.0** - Form state management
- **Zod 4.2.1** - Schema validation
- **shadcn/ui** - Component library (Radix UI primitives)
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **Framer Motion 12.23.26** - Animation library
- **Lucide React 0.562.0** - Icon library
- **Sonner 2.0.7** - Toast notifications
- **date-fns 4.1.0** - Date manipulation

### Backend & Database
- **Supabase 2.89.0** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Supabase Auth (email/password, invitations)
  - Supabase Storage (file uploads)
  - Real-time subscriptions
- **Firebase 12.7.0** - Additional authentication capabilities

### Testing
- **Vitest 4.0.16** - Test runner
- **@testing-library/react 16.3.1** - Component testing
- **@testing-library/user-event 14.6.1** - User interaction testing

### Development Tools
- **ESLint 9.17.0** - Linting
- **TypeScript ESLint 8.18.2** - TypeScript linting
- **Bun/npm** - Package managers

---

## Architecture Overview

### Project Structure

```
theochinomona.tech/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── admin/         # Admin dashboard components
│   │   ├── client/        # Client dashboard components
│   │   ├── project/       # Project-related components
│   │   ├── tracking/      # Public tracking components
│   │   └── ui/            # shadcn/ui base components
│   ├── pages/             # Route page components
│   │   ├── admin/         # Admin pages
│   │   └── client/        # Client pages
│   ├── layouts/           # Layout wrappers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries
│   │   ├── db/           # Database access layer
│   │   ├── api/          # API utilities
│   │   └── ...           # Other utilities
│   ├── store/             # Zustand stores
│   ├── contexts/          # React contexts
│   ├── routes.tsx         # Route definitions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
├── public/                # Static assets
└── .cursor/               # Cursor IDE rules
```

### Design Patterns

- **Component-Based Architecture**: Modular React components with clear separation of concerns
- **Database Access Layer**: Centralized database functions in `lib/db/`
- **Protected Routes**: Role-based access control with `ProtectedRoute` component
- **State Management**: 
  - Zustand for global auth state
  - React Query for server state and caching
- **Form Management**: React Hook Form + Zod validation
- **Type Safety**: Full TypeScript coverage with inferred types from Zod schemas

### Layer Separation

- **Presentation Layer**: React components in `components/` and `pages/`
- **Business Logic Layer**: Database functions in `lib/db/`
- **Data Layer**: Supabase PostgreSQL with RLS policies
- **State Layer**: Zustand stores and React Query
- **Routing Layer**: React Router with protected routes

---

## Functional Requirements

### Core Features

#### 1. Public Portfolio
- **Routes**: `/`, `/portfolio`, `/about`, `/blog`, `/contact`
- **Features**:
  - Project showcase with filtering by category/tech
  - Featured projects highlighting
  - Responsive design
  - Contact form

#### 2. Client Dashboard
- **Routes**: `/dashboard/*`
- **Features**:
  - Project list and detail views
  - Project creation (hiring requests)
  - Activity timeline
  - Billing and invoices
  - Notifications
  - Settings and preferences
  - Project comments and communication

#### 3. Admin Dashboard
- **Routes**: `/admin/*`
- **Features**:
  - User management (create, edit, invite, delete)
  - Project management (CRUD, tracking, phases, tasks)
  - Invoice management (create, edit, send, refunds)
  - Client groups management
  - Release notes management
  - Tax rates management
  - Notifications management
  - Analytics and metrics

#### 4. Project Management
- **Project Statuses**: `pending`, `pending_payment`, `pending_info`, `in_progress`, `in_testing`, `completed`
- **Features**:
  - Project phases and tasks
  - File attachments
  - Project comments with threading
  - Activity logging
  - Project templates
  - Soft delete support
  - Payment tracking

#### 5. Billing System
- **Features**:
  - Invoice creation with line items
  - Payment processing (Stripe integration)
  - Subscription management
  - Tax rate configuration
  - Refund processing
  - Payment notifications

#### 6. Communication
- **Project Comments**:
  - Threaded comments
  - File attachments (PDF, images)
  - Automatic status changes based on comment author
  - Notifications for admin/client interactions
- **Notifications**:
  - Real-time notifications
  - Multiple notification types
  - Read/unread status
- **Release Notes**:
  - Targeted release notes (all, groups, specific users)
  - Read tracking

### User Roles

- **Admin**: Full access to all features, user management, project management
- **Client**: Access to own projects, billing, notifications, project creation

---

## API Endpoints

The application uses Supabase client-side queries rather than REST API endpoints. All database operations are performed through the Supabase client in `lib/db/` functions.

### Database Functions (lib/db/)

#### Projects (`projects.ts`)
- `getAllProjects()` - Get all projects (admin only)
- `getProjectById(id)` - Get single project
- `getProjectsByClient(clientId)` - Get client's projects
- `getPublishedProjects()` - Get public portfolio projects
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update project
- `deleteProject(id)` - Soft delete project
- `hardDeleteProject(id)` - Hard delete project

#### Project Comments (`projectComments.ts`)
- `createComment(input)` - Create comment with attachments
- `getCommentsForProject(projectId)` - Get all comments for project
- `getCommentById(commentId)` - Get single comment
- `deleteComment(commentId, userId)` - Delete comment

#### Project Templates (`projectTemplates.ts`)
- `createTemplate(input)` - Create template from project data
- `getTemplatesForUser(userId)` - Get user's templates
- `getTemplateById(templateId, userId)` - Get single template
- `updateTemplate(templateId, userId, updates)` - Update template
- `deleteTemplate(templateId, userId)` - Delete template
- `useTemplateToCreateProject(templateId, userId, overrides)` - Create project from template

#### Users (`users.ts`)
- `getUserByAuthId(authUserId)` - Get user by auth ID
- `getUserRoleByAuthId(authUserId)` - Get user role
- `createUserRecord(authUserId, userData)` - Create user record
- `updateUser(userId, updates)` - Update user
- `getAllUsers()` - Get all users (admin only)
- `getUserById(userId)` - Get user by ID
- `inviteUser(email, role, metadata)` - Invite new user

#### Invoices (`invoices.ts`)
- `createInvoice(data)` - Create invoice with line items
- `getInvoiceById(invoiceId)` - Get invoice with line items
- `getInvoicesByClient(clientId)` - Get client's invoices
- `getAllInvoices()` - Get all invoices (admin)
- `updateInvoice(invoiceId, data)` - Update invoice
- `updateInvoiceStatus(invoiceId, status)` - Update invoice status
- `deleteInvoice(invoiceId)` - Delete invoice

#### Notifications (`notifications.ts`)
- `createNotification(input)` - Create notification
- `getNotificationsForUser(userId)` - Get user's notifications
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead(userId)` - Mark all as read
- `deleteNotification(notificationId)` - Delete notification

#### Activity Log (`activityLog.ts`)
- `logActivity(projectId, eventType, eventData, userId?)` - Log activity
- `getActivityForProject(projectId)` - Get project activities
- `getActivityForUser(userId)` - Get user activities

---

## Services

### Authentication Service

**Location**: `src/lib/auth.ts`, `src/components/AuthProvider.tsx`, `src/store/authStore.ts`

**Purpose**: Manages user authentication and session state

**Key Operations**:
1. **Session Management** - Handles Supabase auth sessions with JWT metadata fallback
2. **User State** - Maintains authenticated user state in Zustand store
3. **Role-Based Access** - Provides user role information for route protection

**Dependencies**:
- Supabase Auth
- Zustand store

**Used By**:
- `ProtectedRoute` component
- All authenticated pages
- `useAuth` hook

**State Management**:
- Global Zustand store (`authStore.ts`)
- Persists session across page reloads
- Auto-refreshes tokens

### Database Access Layer

**Location**: `src/lib/db/*.ts`

**Purpose**: Centralized database operations using Supabase client

**Key Operations**:
1. **CRUD Operations** - Create, read, update, delete for all entities
2. **Query Building** - Type-safe Supabase queries
3. **Error Handling** - Consistent error handling across all operations
4. **RLS Integration** - Works with Row Level Security policies

**Dependencies**:
- Supabase client
- TypeScript types

**Used By**:
- All page components
- React Query hooks
- Service functions

**Error Handling**:
- Throws descriptive errors
- Handles Supabase-specific error codes
- Provides fallback behavior where appropriate

### Storage Service

**Location**: `src/lib/storage.ts`, `src/lib/attachmentStorage.ts`

**Purpose**: File upload and management with Supabase Storage

**Key Operations**:
1. **File Upload** - Upload files to Supabase Storage buckets
2. **File Deletion** - Remove files from storage
3. **URL Generation** - Generate public/private URLs for files

**Dependencies**:
- Supabase Storage
- File type validation

**Used By**:
- Project attachments
- Comment attachments
- Template attachments
- Invoice attachments

---

## Data Models

### Core Entities

#### User
```typescript
interface User {
  id: string
  auth_user_id: string
  name: string
  surname: string
  email: string
  phone: string | null
  role: 'admin' | 'client'
  created_at: string
  updated_at: string
}
```

#### Project
```typescript
interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  category: string
  thumbnail: string | null
  client_name: string | null
  client_id: string | null
  project_url: string | null
  github_url: string | null
  completion_date: string | null
  featured: boolean
  status: ProjectStatus
  notifications_enabled: boolean
  created_by: string | null
  payment_preference: PaymentPreference | null
  requires_payment: boolean | null
  deposit_paid: boolean
  invoice_id: string | null
  is_hiring_request: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

type ProjectStatus = 
  | 'pending'
  | 'pending_payment'
  | 'pending_info'
  | 'in_progress'
  | 'in_testing'
  | 'completed'
```

#### Project Comment
```typescript
interface ProjectComment {
  id: string
  project_id: string
  user_id: string
  parent_comment_id: string | null
  content: string
  created_at: string
  updated_at: string
}

interface ProjectCommentAttachment {
  id: string
  comment_id: string
  file_url: string
  file_name: string
  file_type: 'pdf' | 'image'
  file_size: number
  created_at: string
}
```

#### Project Template
```typescript
interface ProjectTemplate {
  id: string
  user_id: string
  name: string
  title: string
  description: string
  category: string
  tech: string[]
  budget_range: string | null
  timeline: string | null
  special_requirements: string | null
  is_hiring_request: boolean
  created_at: string
  updated_at: string
}
```

#### Invoice
```typescript
interface Invoice {
  id: string
  project_id: string | null
  client_id: string
  invoice_number: string
  status: InvoiceStatus
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  currency: string
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface InvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  phase_id: string | null
  task_id: string | null
}
```

#### Notification
```typescript
interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  read: boolean
  created_at: string
}

type NotificationType =
  | 'project_update'
  | 'phase_complete'
  | 'task_update'
  | 'note_added'
  | 'file_uploaded'
  | 'release_note'
  | 'system'
  | 'invoice_sent'
  | 'payment_received'
  | 'payment_failed'
  | 'invoice_overdue'
  | 'refund_processed'
  | 'admin_requested_info'
  | 'client_responded_info'
```

### Database Schema

#### Core Tables
- `users` - User accounts and profiles
- `projects` - Portfolio and client projects
- `project_comments` - Project comments with threading
- `project_comment_attachments` - Comment file attachments
- `project_templates` - Reusable project templates
- `project_template_attachments` - Template file attachments
- `project_phases` - Project milestone phases
- `project_tasks` - Tasks within phases
- `project_attachments` - Project file attachments
- `invoices` - Client invoices
- `invoice_line_items` - Invoice line items
- `payments` - Payment records
- `subscriptions` - Subscription records
- `tax_rates` - Tax rate configuration
- `notifications` - User notifications
- `activity_log` - Activity tracking
- `client_groups` - Client organization groups
- `client_group_members` - Group membership
- `release_notes` - Release notes
- `release_note_targets` - Release note targeting
- `release_note_reads` - Read tracking
- `user_preferences` - User settings
- `tracking_codes` - Public tracking code links

#### Key Relationships
- Projects → Users (client_id, created_by)
- Project Comments → Projects (project_id)
- Project Comments → Users (user_id)
- Project Comments → Project Comments (parent_comment_id) - threading
- Invoices → Projects (project_id)
- Invoices → Users (client_id)
- Invoice Line Items → Invoices (invoice_id)
- Invoice Line Items → Phases/Tasks (phase_id, task_id)
- Notifications → Users (user_id)
- Activity Log → Projects (project_id)
- Activity Log → Users (user_id)

---

## File Explanations

### Core Application Files

#### `src/main.tsx`
**Purpose:** Application entry point

**Layer:** Entry Point

**Key Responsibilities:**
- Renders root React component
- Sets up StrictMode
- Initializes React root

**Dependencies:**
- React
- React DOM

**Related Files:**
- [App.tsx](src/App.tsx) - Root component

#### `src/App.tsx`
**Purpose:** Root application component with providers

**Layer:** Application Root

**Key Responsibilities:**
- Sets up React Query client
- Provides BrowserRouter
- Provides AuthProvider
- Renders Toaster for notifications

**Dependencies:**
- React Router DOM
- TanStack React Query
- AuthProvider
- AppRoutes

**Related Files:**
- [routes.tsx](src/routes.tsx) - Route definitions
- [components/AuthProvider.tsx](src/components/AuthProvider.tsx) - Auth context

#### `src/routes.tsx`
**Purpose:** Defines all application routes

**Layer:** Routing

**Key Responsibilities:**
- Defines public routes (portfolio, about, contact)
- Defines admin routes with role protection
- Defines client dashboard routes with authentication
- Handles standalone routes (tracking, password reset)

**Dependencies:**
- React Router DOM
- ProtectedRoute component
- All page components

**Related Files:**
- [components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) - Route protection

### Authentication & Authorization

#### `src/components/AuthProvider.tsx`
**Purpose:** Manages authentication state and session

**Layer:** Authentication

**Key Responsibilities:**
- Listens to Supabase auth state changes
- Initializes user state from JWT metadata (fast)
- Fetches full user record in background
- Handles session refresh
- Manages loading states

**Important Methods:**
- `createUserFromMetadata(session)` - Creates user from JWT (instant)
- `fetchAndUpdateUserRecord(session)` - Fetches full user record

**Dependencies:**
- Supabase client
- Zustand auth store
- `lib/db/users.ts`

**Related Files:**
- [store/authStore.ts](src/store/authStore.ts) - Auth state store
- [lib/db/users.ts](src/lib/db/users.ts) - User database functions

#### `src/components/ProtectedRoute.tsx`
**Purpose:** Protects routes requiring authentication/authorization

**Layer:** Authorization

**Key Responsibilities:**
- Checks authentication status
- Validates user role if required
- Redirects to login if not authenticated
- Shows loading state during auth check

**Dependencies:**
- `hooks/useAuth.ts`
- React Router DOM

**Related Files:**
- [hooks/useAuth.ts](src/hooks/useAuth.ts) - Auth hook

#### `src/store/authStore.ts`
**Purpose:** Global authentication state store (Zustand)

**Layer:** State Management

**Key Responsibilities:**
- Stores authenticated user
- Stores session
- Manages loading state
- Provides auth state getters

**Dependencies:**
- Zustand

**Used By:**
- AuthProvider
- useAuth hook
- ProtectedRoute

### Database Access Layer

#### `src/lib/db/projects.ts`
**Purpose:** Project database operations

**Layer:** Data Access

**Key Responsibilities:**
- CRUD operations for projects
- Project status management
- Soft delete support
- Client project queries
- Published project queries

**Important Methods:**
- `getAllProjects()` - Admin: get all projects
- `getProjectById(id)` - Get single project
- `getProjectsByClient(clientId)` - Get client's projects
- `createProject(data)` - Create new project
- `updateProject(id, data)` - Update project
- `deleteProject(id)` - Soft delete

**Dependencies:**
- Supabase client

**Related Files:**
- [lib/db/projectComments.ts](src/lib/db/projectComments.ts) - Project comments
- [lib/db/projectTemplates.ts](src/lib/db/projectTemplates.ts) - Templates

#### `src/lib/db/projectComments.ts`
**Purpose:** Project comment operations with threading

**Layer:** Data Access

**Key Responsibilities:**
- Create comments with attachments
- Get threaded comments
- Automatic status changes (admin/client interactions)
- Notification creation
- Activity logging

**Important Methods:**
- `createComment(input)` - Create comment with auto status changes
- `getCommentsForProject(projectId)` - Get all comments (threaded)
- `deleteComment(commentId, userId)` - Delete comment

**Dependencies:**
- Supabase client
- `lib/db/projects.ts`
- `lib/db/users.ts`
- `lib/db/notifications.ts`
- `lib/db/activityLog.ts`

**Related Files:**
- [lib/db/projects.ts](src/lib/db/projects.ts) - Projects
- [components/project/ProjectCommentForm.tsx](src/components/project/ProjectCommentForm.tsx) - Comment UI

#### `src/lib/db/projectTemplates.ts`
**Purpose:** Project template operations

**Layer:** Data Access

**Key Responsibilities:**
- Create templates from project data
- Get user's templates
- Update/delete templates
- Create projects from templates

**Important Methods:**
- `createTemplate(input)` - Create template
- `getTemplatesForUser(userId)` - Get user templates
- `useTemplateToCreateProject(templateId, userId, overrides)` - Create project from template

**Dependencies:**
- Supabase client
- `lib/db/projects.ts`
- `lib/db/activityLog.ts`

**Related Files:**
- [lib/db/projects.ts](src/lib/db/projects.ts) - Projects
- [components/project/TemplateSelectorDialog.tsx](src/components/project/TemplateSelectorDialog.tsx) - Template UI

#### `src/lib/db/invoices.ts`
**Purpose:** Invoice and billing operations

**Layer:** Data Access

**Key Responsibilities:**
- Create invoices with line items
- Update invoice status
- Calculate totals
- Send notifications
- Log activities

**Important Methods:**
- `createInvoice(data)` - Create invoice with line items
- `getInvoiceById(invoiceId)` - Get invoice with line items
- `updateInvoiceStatus(invoiceId, status)` - Update status
- `getInvoicesByClient(clientId)` - Get client invoices

**Dependencies:**
- Supabase client
- `lib/db/notifications.ts`
- `lib/db/activityLog.ts`

**Related Files:**
- [lib/db/types/invoices.ts](src/lib/db/types/invoices.ts) - Invoice types
- [components/admin/InvoiceForm.tsx](src/components/admin/InvoiceForm.tsx) - Invoice UI

#### `src/lib/db/users.ts`
**Purpose:** User management operations

**Layer:** Data Access

**Key Responsibilities:**
- Get user by auth ID
- Create user records
- Update user information
- Get all users (admin)
- Invite users

**Important Methods:**
- `getUserByAuthId(authUserId)` - Get user with timeout fallback
- `createUserRecord(authUserId, userData)` - Create user after signup
- `getAllUsers()` - Admin: get all users

**Dependencies:**
- Supabase client

**Related Files:**
- [components/AuthProvider.tsx](src/components/AuthProvider.tsx) - Uses for auth
- [pages/admin/UserList.tsx](src/pages/admin/UserList.tsx) - User management UI

### Layout Components

#### `src/layouts/MainLayout.tsx`
**Purpose:** Public site layout

**Layer:** Presentation

**Key Responsibilities:**
- Provides navigation (Navbar)
- Provides footer
- Wraps public pages

**Dependencies:**
- Navbar component
- Footer component

**Used By:**
- Public routes (/, /portfolio, /about, etc.)

#### `src/layouts/AdminLayout.tsx`
**Purpose:** Admin dashboard layout

**Layer:** Presentation

**Key Responsibilities:**
- Provides admin navigation
- Shows admin sidebar
- Handles admin-specific UI

**Dependencies:**
- Admin navigation components

**Used By:**
- All `/admin/*` routes

#### `src/layouts/ClientLayout.tsx`
**Purpose:** Client dashboard layout

**Layer:** Presentation

**Key Responsibilities:**
- Provides client navigation
- Shows notification bell
- Handles client-specific UI

**Dependencies:**
- Client navigation components
- Notification components

**Used By:**
- All `/dashboard/*` routes

### Key Page Components

#### `src/pages/admin/ProjectList.tsx`
**Purpose:** Admin project list page

**Layer:** Presentation

**Key Responsibilities:**
- Displays all projects
- Provides project filtering/search
- Bulk operations
- Create/edit/delete actions

**Dependencies:**
- `lib/db/projects.ts`
- React Query
- Admin project components

#### `src/pages/client/MyProjectsPage.tsx`
**Purpose:** Client project list page

**Layer:** Presentation

**Key Responsibilities:**
- Displays client's projects
- Project creation (hiring requests)
- Project status overview

**Dependencies:**
- `lib/db/projects.ts`
- React Query
- Client project components

#### `src/pages/client/ClientProjectDetailPage.tsx`
**Purpose:** Client project detail page

**Layer:** Presentation

**Key Responsibilities:**
- Shows project details
- Displays phases and tasks
- Shows activity timeline
- Project comments section
- File attachments

**Dependencies:**
- `lib/db/projects.ts`
- `lib/db/projectComments.ts`
- React Query

#### `src/pages/admin/NotificationsPage.tsx`
**Purpose:** Admin notifications page

**Layer:** Presentation

**Key Responsibilities:**
- Displays all notifications
- Notification management
- Mark as read/unread

**Dependencies:**
- `lib/db/notifications.ts`
- React Query

### Utility Files

#### `src/lib/supabase.ts`
**Purpose:** Supabase client initialization

**Layer:** Infrastructure

**Key Responsibilities:**
- Creates Supabase client singleton
- Handles HMR persistence
- Configures auth settings

**Dependencies:**
- @supabase/supabase-js
- Environment variables

**Used By:**
- All database functions
- AuthProvider

#### `src/lib/storage.ts`
**Purpose:** File storage utilities

**Layer:** Infrastructure

**Key Responsibilities:**
- Upload files to Supabase Storage
- Delete files
- Generate file URLs

**Dependencies:**
- Supabase Storage

**Used By:**
- Attachment uploaders
- Project forms

#### `src/lib/utils.ts`
**Purpose:** Utility functions

**Layer:** Utilities

**Key Responsibilities:**
- `cn()` - Class name merging utility
- Other helper functions

**Dependencies:**
- clsx
- tailwind-merge

**Used By:**
- All components (for className merging)

---

## Configuration

### Required Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase (optional)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Vite Configuration

**File**: `vite.config.ts`

- React plugin
- Tailwind CSS plugin
- Path alias: `@` → `./src`
- Proxy for `/api` → `http://localhost:3001` (for Express server if needed)

### TypeScript Configuration

- Strict mode enabled
- Path aliases configured
- React JSX support
- ES modules

---

## Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- Supabase account and project
- (Optional) Firebase account

### Frontend Setup

```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
# or
bun dev

# Build for production
npm run build
# or
bun build
```

### Database Setup

```bash
# Apply migrations (using Supabase CLI)
supabase db push

# Or apply migrations manually in Supabase dashboard
```

### Testing

```bash
# Run tests
npm test
# or
bun test

# Run tests in watch mode
npm test -- --watch
```

---

## Integration Points

### Supabase Integration
- **Database**: PostgreSQL with RLS policies
- **Auth**: Email/password, invitations
- **Storage**: File uploads (attachments, thumbnails)
- **Real-time**: (Potential for real-time notifications)

### Firebase Integration
- **Auth**: Additional authentication provider (optional)

### Stripe Integration
- **Payments**: Invoice payment processing
- **Subscriptions**: Recurring billing
- **Refunds**: Refund processing

---

## Data Flow

### Authentication Flow
1. User logs in via Supabase Auth
2. `AuthProvider` receives auth state change
3. Creates user from JWT metadata (instant)
4. Fetches full user record in background
5. Updates Zustand store
6. `ProtectedRoute` checks auth state
7. User accesses protected routes

### Project Creation Flow
1. Client/admin fills project form
2. Form validates with Zod
3. `createProject()` called
4. Project inserted into database
5. Activity logged
6. Notifications sent (if applicable)
7. React Query cache updated
8. UI reflects new project

### Comment Creation Flow
1. User creates comment with optional attachments
2. Comment inserted into database
3. Attachments uploaded to Supabase Storage
4. Project status auto-updated (if admin/client interaction)
5. Notifications sent to relevant users
6. Activity logged
7. UI updates with new comment

### Invoice Payment Flow
1. Client views invoice
2. Clicks "Pay Invoice"
3. Stripe payment intent created
4. Client completes payment
5. Payment recorded in database
6. Invoice status updated
7. Notifications sent
8. Activity logged

---

## Recent Changes

### [2025-01-02] - Initial Documentation

**Created:**
- Comprehensive project documentation
- File explanations for core components
- Database schema documentation
- API reference (database functions)
- Architecture overview

**Files Documented:**
- Core application files (App.tsx, routes.tsx, main.tsx)
- Authentication system (AuthProvider, ProtectedRoute, authStore)
- Database access layer (projects, comments, templates, invoices, users)
- Layout components (MainLayout, AdminLayout, ClientLayout)
- Key page components
- Utility files

**Next Steps:**
- Review and customize documentation
- Add any missing manual details
- Update as features evolve

### [2025-01-02] - Project Comments & Templates Feature

**Modified Files:**
- `src/lib/db/projectComments.ts` - New file for comment operations
- `src/lib/db/projectTemplates.ts` - New file for template operations
- `src/components/project/ProjectCommentForm.tsx` - New comment form component
- `src/components/project/ProjectCommentThread.tsx` - New comment thread component
- `src/components/project/TemplateSelectorDialog.tsx` - New template selector
- `src/pages/admin/NotificationsPage.tsx` - New notifications page
- `src/pages/client/MyProjectsPage.tsx` - Updated to remove MyRequestsPage
- `src/routes.tsx` - Updated routes

**New Features:**
- Project comments with threading support
- Comment attachments (PDF, images)
- Automatic project status changes based on comment author role
- Project templates for reusable project creation
- Template attachments
- Enhanced notifications for comment interactions

**Database Changes:**
- `project_comments` table created
- `project_comment_attachments` table created
- `project_templates` table created
- `project_template_attachments` table created
- New notification types: `admin_requested_info`, `client_responded_info`
- New activity log event types for comments and templates

**Impact:**
- Clients and admins can now communicate via project comments
- Status automatically updates when admin requests info or client responds
- Templates allow quick project creation from saved configurations
- Enhanced notification system for better communication

---

*Documentation maintained by AI assistant. Last comprehensive update: 2025-01-02*
