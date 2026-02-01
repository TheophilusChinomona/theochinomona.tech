# Tech Stack

Aligned to user preference: **React 19**, Tailwind CSS 4, shadcn/ui, Supabase (primary), Firebase (optional), **Bun package manager**, modular + scalable architecture with production-grade error handling and performance optimizations.

---

## Frontend

| Category       | Technology                  |
| -------------- | --------------------------- |
| Framework      | React 19.0.0               |
| Styling        | Tailwind CSS 4.1.18         |
| Components     | shadcn/ui                   |
| Routing        | React Router DOM 7.11.0    |
| State          | React Query 5.90.15 / Zustand 5.0.9 |
| Forms          | React Hook Form 7.69.0 + Zod 4.2.1 |
| Error Handling | React Error Boundaries      |
| Performance    | React 19 useOptimistic      |
| Animation      | Framer Motion 12.23.26      |
| Icons          | Lucide React 0.562.0         |
| Notifications  | Sonner 2.0.7                |

---

## Backend

**Primary: Supabase (Backend-as-a-Service)**

- Direct client-side database queries with Row Level Security (RLS)
- Supabase Auth for authentication
- Supabase Storage for file uploads
- Real-time subscriptions (potential)

**Optional: Express.js Server**

For secure operations that require server-side processing:
- Payment webhooks
- Email sending
- Secure API operations

### Database Access Layer

All database operations are performed client-side through Supabase:
- `lib/db/projects.ts` – Project CRUD operations
- `lib/db/users.ts` – User management
- `lib/db/invoices.ts` – Invoice and billing
- `lib/db/projectComments.ts` – Comment system
- `lib/db/projectTemplates.ts` – Template management
- `lib/db/notifications.ts` – Notification system
- `lib/db/activityLog.ts` – Activity tracking

---

## Auth & Database

### Primary: Supabase

| Feature        | Usage                       |
| -------------- | --------------------------- |
| Authentication | Supabase Auth               |
| Database       | PostgreSQL                  |
| Security       | Row Level Security (RLS)    |

### Database Tables

**Core:**
- `users` – User accounts and profiles
- `projects` – Portfolio and client projects
- `project_phases` – Project milestone phases
- `project_tasks` – Tasks within phases
- `project_attachments` – Project file attachments

**Communication:**
- `project_comments` – Project comments with threading
- `project_comment_attachments` – Comment file attachments
- `notifications` – User notifications
- `activity_log` – Activity tracking

**Templates & Organization:**
- `project_templates` – Reusable project templates
- `project_template_attachments` – Template file attachments
- `client_groups` – Client organization groups
- `client_group_members` – Group membership

**Billing:**
- `invoices` – Client invoices
- `invoice_line_items` – Invoice line items
- `payments` – Payment records
- `subscriptions` – Subscription records
- `tax_rates` – Tax rate configuration

**Other:**
- `tracking_codes` – Public tracking code links
- `release_notes` – Release notes
- `release_note_targets` – Release note targeting
- `release_note_reads` – Read tracking
- `user_preferences` – User settings

### Alternative: Firebase

- Firebase Auth
- Firestore

---

## Infrastructure

| Layer          | Service                     |
| -------------- | --------------------------- |
| Frontend       | Vercel / Netlify / Cloudflare |
| Backend        | Render / Railway / Fly.io   |
| DB / Auth      | Supabase                    |

---

## Developer Experience

| Category         | Tool                        |
| ---------------- | --------------------------- |
| Language         | TypeScript 5.7.2            |
| Package Manager  | **Bun** (preferred) / npm   |
| Build Tool       | Vite 6.0.5                  |
| Linting          | ESLint 9.17.0 + TypeScript ESLint |
| Unit Testing     | Vitest 4.0.16               |
| Component Tests | React Testing Library 16.3.1 |
| Integration Tests| Vitest + React Testing Library |
| E2E Testing      | Playwright / Cypress        |
| CI/CD            | GitHub Actions              |

### Testing Strategy

**Unit Tests:**
- Individual component testing
- Utility function testing
- Database function testing

**Integration Tests:**
- Critical user flows:
  - Invoice Payment flow (Stripe integration)
  - Project Creation from Template
  - Project Comment threading and notifications
  - Authentication and authorization flows
- Error boundary behavior
- Optimistic update rollback scenarios

**E2E Tests:**
- Full user journeys
- Cross-browser compatibility
- Performance benchmarks

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│    React 19 SPA + Tailwind + shadcn/ui         │
│    Error Boundaries + Optimistic Updates        │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                Supabase Client                   │
│      Direct database queries + RLS              │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│    Auth + PostgreSQL + RLS + Storage            │
└─────────────────────────────────────────────────┘
```

### Key Architecture Decisions

- **React 19 Features**: Leveraging `useOptimistic` for instant UI feedback
- **Error Boundaries**: Layout-level error boundaries prevent full app crashes
- **Direct Supabase Integration**: Client-side queries with RLS for security
- **Optimistic Updates**: Comments and interactions appear instantly before server confirmation
- **Comprehensive Testing**: Integration tests for critical paths ensure reliability

### Performance Optimizations

- **Code Splitting**: Lazy loading for route components
- **Optimistic Updates**: React 19 `useOptimistic` for instant feedback
- **React Query Caching**: Smart cache invalidation and background refetching
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Tree-shaking and minimal dependencies

