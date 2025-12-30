---
description: Project structure and organization for theochinomona.tech
globs: 
alwaysApply: true
---
# theochinomona.tech Project Structure

This rule outlines the directory structure and organization of theochinomona.tech - a developer portfolio and client portal web application.

## Project Overview

**theochinomona.tech** is a full-stack web application that provides:
- Multi-page portfolio website with hero sections
- Public portfolio showcasing projects
- Client dashboard with project tracking
- Admin dashboard for project and user management
- Tracking code system for project visibility
- Authentication with role-based access

## Root Directory Structure

```
theochinomona.tech/
├── src/                    # 🌐 Frontend (React + TypeScript + Vite)
├── server/                 # 🔧 Backend (Express.js)
├── supabase/               # 🗄️ Database migrations & edge functions
├── public/                 # 📁 Static assets (images, logos)
├── agent-os/               # 📋 Product documentation & specifications
│   ├── product/           # Brand guide, mission, roadmap, tech-stack
│   ├── specs/             # Feature specifications
│   ├── commands/          # Agent workflow commands
│   └── standards/         # Coding standards
├── dist/                   # 📦 Build output
└── .gemini/               # 🔧 Gemini rules & config
    └── rules/             # Project-specific rules
```

---

## Frontend Directory (`/src/`)

**Purpose**: React 19 + TypeScript + Vite SPA with shadcn/ui components.

```
src/
├── components/             # 🎨 React Components
│   ├── admin/             # Admin dashboard components
│   │   ├── ProjectForm.tsx
│   │   ├── PhaseCard.tsx
│   │   ├── TaskRow.tsx
│   │   ├── AddPhaseDialog.tsx
│   │   ├── AddTaskDialog.tsx
│   │   ├── InviteUserDialog.tsx
│   │   ├── AttachmentUploader.tsx
│   │   └── ...
│   ├── client/            # Client dashboard components
│   │   ├── ClientProjectCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── NotificationBell.tsx
│   │   ├── ProjectActivityTimeline.tsx
│   │   └── settings/      # Client settings components
│   ├── tracking/          # Public tracking components
│   │   ├── PhaseTimeline.tsx
│   │   ├── TaskList.tsx
│   │   └── AttachmentGallery.tsx
│   ├── ui/                # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ... (18+ components)
│   ├── AuthModal.tsx      # Authentication modal
│   ├── AuthProvider.tsx   # Auth context provider
│   ├── ProtectedRoute.tsx # Route protection
│   ├── Hero.tsx           # Landing page hero
│   ├── Navbar.tsx         # Navigation bar
│   ├── Footer.tsx         # Site footer
│   ├── ContactForm.tsx    # Contact form
│   └── ...
│
├── pages/                  # 📄 Route Pages
│   ├── HomePage.tsx       # Landing page
│   ├── AboutPage.tsx      # About page
│   ├── PortfolioPage.tsx  # Portfolio showcase
│   ├── BlogPage.tsx       # Blog listing
│   ├── ContactPage.tsx    # Contact page
│   ├── LoginPage.tsx      # Login page
│   ├── TrackingPage.tsx   # Public project tracking
│   ├── TrackingLandingPage.tsx
│   ├── SetPasswordPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── admin/             # Admin pages
│   │   ├── DashboardOverview.tsx
│   │   ├── UserList.tsx
│   │   ├── ProjectList.tsx
│   │   ├── CreateProjectPage.tsx
│   │   ├── EditProjectPage.tsx
│   │   ├── ProjectTrackingPage.tsx
│   │   ├── ReleaseNotesPage.tsx
│   │   ├── ClientGroupsPage.tsx
│   │   └── SettingsPage.tsx
│   └── client/            # Client dashboard pages
│       ├── ClientDashboardHome.tsx
│       ├── MyProjectsPage.tsx
│       ├── ClientProjectDetailPage.tsx
│       ├── ClientSettingsPage.tsx
│       └── NotificationsPage.tsx
│
├── layouts/                # 🖼️ Layout Components
│   ├── MainLayout.tsx     # Public site layout
│   ├── AdminLayout.tsx    # Admin dashboard layout
│   └── ClientLayout.tsx   # Client dashboard layout
│
├── hooks/                  # 🪝 Custom React Hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useScrollPosition.ts
│   ├── useNotifications.ts
│   └── useClientMetrics.ts
│
├── contexts/               # 🔄 React Context Providers
│   └── ThemeContext.tsx   # Dark/light theme context
│
├── store/                  # 🗄️ State Management (Zustand)
│   └── authStore.ts       # Authentication state
│
├── lib/                    # 📚 Core Libraries
│   ├── supabase.ts        # Supabase client initialization
│   ├── firebase.ts        # Firebase client initialization
│   ├── auth.ts            # Auth helper functions
│   ├── storage.ts         # Storage utilities
│   ├── attachmentStorage.ts
│   ├── utils.ts           # cn() and other utilities
│   └── db/                # Database access layer
│       ├── users.ts       # User CRUD operations
│       ├── projects.ts    # Project CRUD operations
│       ├── phases.ts      # Phase CRUD operations
│       ├── tasks.ts       # Task CRUD operations
│       ├── tracking.ts    # Tracking code operations
│       ├── notifications.ts
│       ├── activityLog.ts
│       ├── attachments.ts
│       ├── clientGroups.ts
│       ├── clientProjects.ts
│       ├── releaseNotes.ts
│       ├── userPreferences.ts
│       └── types/         # Database type definitions
│           └── dashboard.ts
│
├── api/                    # 🔌 API Utilities
│   └── auth/
│       └── middleware.ts  # Auth middleware helpers
│
├── integration/            # 🧪 Integration Tests
│   ├── auth-flow.test.tsx
│   ├── admin-dashboard.test.tsx
│   ├── navigation.test.tsx
│   ├── responsive.test.tsx
│   └── accessibility.test.tsx
│
├── test/                   # 🔧 Test Setup
│   └── setup.ts           # Vitest setup file
│
├── App.tsx                 # 🚀 Root component
├── routes.tsx              # 🛣️ Route definitions
├── main.tsx                # ⚡ Vite entry point
├── index.css               # 🎨 Global styles
└── vite-env.d.ts          # TypeScript declarations
```

### Page Categories

| Category | Path Prefix | Layout | Purpose |
|----------|-------------|--------|---------|
| Public | `/` | MainLayout | Portfolio, about, contact, blog |
| Tracking | `/track/:code` | None | Public project tracking view |
| Admin | `/admin/*` | AdminLayout | Project/user management (admin only) |
| Client | `/dashboard/*` | ClientLayout | Client project tracking (authenticated) |

### Component Organization

| Folder | Purpose |
|--------|---------|
| `components/admin/` | Admin dashboard UI components |
| `components/client/` | Client dashboard UI components |
| `components/tracking/` | Public tracking page components |
| `components/ui/` | shadcn/ui base components |
| Root `components/` | Shared/public components |

---

## Backend Directory (`/server/`)

**Purpose**: Lightweight Express.js API server.

```
server/
├── index.js               # 🚀 Express server entry point
├── package.json           # 📦 Server dependencies
└── node_modules/          # Dependencies
```

### Dependencies
- Express.js for API routing
- CORS for cross-origin requests
- Zod for validation

---

## Supabase Directory (`/supabase/`)

**Purpose**: Database migrations and edge functions.

```
supabase/
├── migrations/             # 📊 SQL Migrations
│   ├── 20251229000001_create_users_table.sql
│   ├── 20251230090133_create_projects_table.sql
│   ├── 20251230100001_create_tracking_codes_table.sql
│   ├── 20251230100002_create_project_phases_table.sql
│   ├── 20251230100003_create_project_tasks_attachments_tables.sql
│   ├── 20251230110001_create_user_preferences_table.sql
│   ├── 20251230110002_create_activity_log_table.sql
│   ├── 20251230110003_create_client_groups_tables.sql
│   ├── 20251230110004_create_release_notes_tables.sql
│   ├── 20251230110005_create_notifications_table.sql
│   └── ... (with corresponding .down.sql rollbacks)
├── functions/              # ⚡ Edge Functions
│   ├── invite-user/       # User invitation
│   ├── delete-user/       # User deletion
│   └── send-phase-notification/ # Phase notifications
└── storage-setup.md       # Storage bucket documentation
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and profiles |
| `projects` | Portfolio and client projects |
| `project_phases` | Project milestone phases |
| `project_tasks` | Tasks within phases |
| `project_attachments` | File attachments |
| `tracking_codes` | Public tracking code links |
| `user_preferences` | User settings/preferences |
| `activity_log` | User activity tracking |
| `client_groups` | Client organization groups |
| `client_group_members` | Group membership |
| `release_notes` | Project release notes |
| `notifications` | User notifications |

---

## Agent-OS Directory (`/agent-os/`)

**Purpose**: Product documentation and AI agent specifications.

```
agent-os/
├── product/                # 📋 Product Documentation
│   ├── mission.md         # Product mission and pitch
│   ├── brand-guide.md     # Color palette and typography
│   ├── roadmap.md         # Development roadmap
│   └── tech-stack.md      # Technology decisions
├── specs/                  # 📝 Feature Specifications
│   └── YYYY-MM-DD-feature-name/
│       ├── planning/      # Requirements docs
│       ├── spec.md        # Specification document
│       └── tasks.md       # Implementation tasks
├── commands/               # 🤖 Agent Workflow Commands
│   ├── plan-product/
│   ├── shape-spec/
│   ├── write-spec/
│   ├── create-tasks/
│   ├── implement-tasks/
│   └── orchestrate-tasks/
└── standards/              # 📏 Coding Standards
    ├── frontend/          # React/TypeScript standards
    ├── backend/           # Node.js standards
    ├── global/            # Universal standards
    └── testing/           # Testing standards
```

---

## Static Assets (`/public/`)

```
public/
├── images/
│   ├── logos/            # PNG logo variants
│   └── logos-svg/        # SVG logo variants
└── vite.svg              # Vite favicon
```

---

## Key Configuration Files

### Frontend Configuration
- `package.json` - NPM/Bun dependencies
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS setup
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `eslint.config.js` - ESLint configuration
- `components.json` - shadcn/ui configuration

### Backend Configuration
- `server/package.json` - Express dependencies

---

## File Naming Conventions

### React Components (TypeScript/TSX)
- **PascalCase**: `HomePage.tsx`, `AdminLayout.tsx`, `ProjectForm.tsx`
- **Suffix conventions**:
  - `*Page.tsx` - Route page components
  - `*Layout.tsx` - Layout wrapper components
  - `*Dialog.tsx` - Modal dialog components
  - `*Form.tsx` - Form components
  - `*Card.tsx` - Card display components

### Utilities & Libraries (TypeScript)
- **camelCase**: `supabase.ts`, `firebase.ts`, `utils.ts`
- **Test files**: `*.test.ts` or `*.test.tsx`

### UI Components (shadcn/ui style)
- **kebab-case**: `button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`

### Database Layer
- **camelCase**: `users.ts`, `projects.ts`, `activityLog.ts`

### Directories
- **kebab-case for features**: `client-groups/`
- **lowercase**: `src/`, `hooks/`, `lib/`, `pages/`

---

## Route Structure

```
Public Routes (MainLayout):
├── /                      → HomePage
├── /about                 → AboutPage
├── /portfolio             → PortfolioPage
├── /blog                  → BlogPage
├── /contact               → ContactPage
├── /login                 → LoginPage
├── /track                 → TrackingLandingPage
└── /verify-email          → VerifyEmailPage

Standalone Routes (No Layout):
├── /track/:code           → TrackingPage
├── /set-password          → SetPasswordPage
└── /reset-password        → SetPasswordPage

Admin Routes (AdminLayout, admin role required):
├── /admin                 → DashboardOverview
├── /admin/users           → UserList
├── /admin/projects        → ProjectList
├── /admin/projects/new    → CreateProjectPage
├── /admin/projects/:id/edit → EditProjectPage
├── /admin/projects/:id/tracking → ProjectTrackingPage
├── /admin/tracking        → TrackingListPage
├── /admin/release-notes   → ReleaseNotesPage
├── /admin/client-groups   → ClientGroupsPage
└── /admin/settings        → SettingsPage

Client Routes (ClientLayout, authenticated):
├── /dashboard             → ClientDashboardHome
├── /dashboard/projects    → MyProjectsPage
├── /dashboard/projects/:id → ClientProjectDetailPage
├── /dashboard/portfolio   → ClientPortfolioPage
├── /dashboard/settings    → ClientSettingsPage
└── /dashboard/notifications → NotificationsPage
```

---

## Data Flow Overview

```
User Request → React SPA (Vite)
    │
    ▼
React Router → Layout + Page Components
    │
    ▼
React Query / Zustand → State Management
    │
    ├─→ Supabase Client → PostgreSQL (RLS)
    │
    ├─→ Firebase Client → Auth (optional)
    │
    └─→ Express Server → Secure Operations
```

---

*Last Updated: December 2024*
