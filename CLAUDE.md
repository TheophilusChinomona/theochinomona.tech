# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working with the theochinomona.tech codebase.

## Project Overview

**theochinomona.tech** is a full-stack single-page application (SPA) serving three audiences:
- **Public Site**: Portfolio, blog, contact form, and project tracking
- **Admin Dashboard**: User management, project management, invoicing, and settings
- **Client Dashboard**: Project viewing, billing, notifications, and project requests

## Tech Stack

### Frontend
- **React 19.0.0** with TypeScript 5.7.2 (strict mode)
- **Vite 6.0.5** - Build tool and dev server (port 5173)
- **Tailwind CSS 4.1.18** - Utility-first styling
- **Shadcn/ui** - Component library (Radix UI primitives)
- **React Router v7** - Client-side routing
- **Zustand 5.0.9** - Global state management
- **React Hook Form 7.69.0** + **Zod 4.2.1** - Form handling and validation
- **TanStack React Query 5.90.15** - Server state management
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Node.js/Express** - Simple REST API (`/server/index.js`, port 3001)
- **Supabase** - Primary backend (PostgreSQL + Auth + Storage)
- **Stripe** - Payment processing

### Testing
- **Vitest 4.0.16** - Test runner
- **Testing Library** - Component testing
- **jsdom** - DOM environment

## Quick Commands

```bash
# Development
npm run dev          # Start Vite dev server (port 5173)

# Building
npm run build        # TypeScript check + Vite build

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once

# Linting
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## Directory Structure

```
src/
├── App.tsx                    # Main app with providers
├── main.tsx                   # Entry point
├── routes.tsx                 # Route definitions
├── index.css                  # Global styles
├── components/
│   ├── ui/                    # Shadcn/ui components
│   ├── admin/                 # Admin-specific components
│   ├── client/                # Client-specific components
│   ├── tracking/              # Project tracking components
│   ├── AuthProvider.tsx       # Auth context
│   ├── ProtectedRoute.tsx     # Route guard HOC
│   ├── Navbar.tsx, Footer.tsx # Layout components
│   └── ...
├── pages/
│   ├── HomePage.tsx, AboutPage.tsx, etc.  # Public pages
│   ├── admin/                 # Admin dashboard pages
│   └── client/                # Client dashboard pages
├── layouts/
│   ├── MainLayout.tsx         # Public pages layout
│   ├── AdminLayout.tsx        # Admin dashboard layout
│   └── ClientLayout.tsx       # Client dashboard layout
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── ...
├── store/
│   └── authStore.ts           # Zustand auth store
├── lib/
│   ├── auth.ts                # Auth functions
│   ├── supabase.ts            # Supabase client
│   ├── stripe.ts              # Stripe integration
│   ├── storage.ts             # File storage
│   ├── db/                    # Database operations
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   ├── invoices.ts
│   │   ├── payments.ts
│   │   ├── notifications.ts
│   │   └── types/             # TypeScript types
│   └── api/                   # API client utilities
├── contexts/
│   └── ThemeContext.tsx       # Theme provider
├── integration/               # Integration tests
└── test/
    └── setup.ts               # Test setup

server/
├── index.js                   # Express server
└── package.json

supabase/
├── functions/                 # Edge functions
├── migrations/                # Database migrations
└── storage-setup.md

agent-os/
├── config.yml                 # Agent OS configuration
├── standards/                 # Development standards
├── commands/                  # Workflow commands
└── specs/                     # Technical specifications
```

## Routing Architecture

The app uses three layout contexts:

### Public Routes (MainLayout)
- `/` - Home page
- `/about` - About page
- `/portfolio` - Portfolio showcase
- `/blog` - Blog posts
- `/contact` - Contact form
- `/track` - Project tracking landing
- `/login` - Login page

### Admin Routes (AdminLayout) - requires `admin` role
- `/admin` - Dashboard overview
- `/admin/users` - User management
- `/admin/projects` - Project management
- `/admin/invoices` - Invoice management
- `/admin/settings` - Admin settings
- `/admin/release-notes` - Release notes management
- `/admin/client-groups` - Client group management

### Client Routes (ClientLayout) - requires authentication
- `/dashboard` - Client dashboard home
- `/dashboard/projects` - My projects
- `/dashboard/billing` - Billing and invoices
- `/dashboard/notifications` - Notifications
- `/dashboard/settings` - Account settings

### Standalone Routes (no layout)
- `/track/:code` - Public project tracking page
- `/set-password` - Set password for invited users
- `/reset-password` - Password reset

## Key Patterns and Conventions

### Component Patterns
```tsx
// Functional components with typed props
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### Import Aliases
Use `@/` alias for src imports:
```tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
```

### State Management Layers
1. **Local State**: `useState` for component UI state
2. **Context**: `ThemeContext` for theme
3. **Zustand**: `authStore` for auth state
4. **React Query**: Server state and caching

### Database Operations
All database operations are in `src/lib/db/`:
```tsx
// Example usage
import { getUserByAuthId, createUserRecord } from '@/lib/db/users';
import { getProjectById, updateProject } from '@/lib/db/projects';

// Functions return typed data or null
const user = await getUserByAuthId(authId);
```

### Form Handling
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

### Error Handling
```tsx
try {
  const result = await someOperation();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error via toast
}
```

## Authentication Flow

1. User signs up/in via `AuthModal` component
2. Supabase handles authentication
3. `AuthProvider` initializes auth state on mount
4. `ProtectedRoute` guards protected routes by role
5. `authStore` (Zustand) maintains global auth state

### User Roles
- `admin` - Full access to admin dashboard
- `client` - Access to client dashboard only

## Database Schema (Supabase)

Key tables:
- `users` - User profiles (linked to auth.users)
- `projects` - Client projects
- `project_phases` - Project phase tracking
- `tasks` - Task management
- `invoices` - Client invoices
- `payments` - Payment records
- `notifications` - User notifications
- `client_groups` - Client groupings
- `tax_rates` - Tax configuration
- `release_notes` - App release notes
- `activity_logs` - Audit trail

## Environment Variables

Required in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional Firebase fallback:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

## API Proxy

Vite proxies `/api/*` requests to `localhost:3001` (Express server):
- `POST /api/contact` - Contact form submission
- `GET /api/health` - Health check

## Testing

Tests use Vitest with Testing Library:
```tsx
// Component.test.tsx
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

Test files location:
- Unit tests: Colocated with source files (`*.test.tsx`)
- Integration tests: `src/integration/`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `HomePage`, `AuthProvider` |
| Hooks | camelCase with `use` prefix | `useAuth`, `useNotifications` |
| Functions | camelCase | `getCurrentUser`, `createProject` |
| Types/Interfaces | PascalCase | `User`, `Invoice`, `Project` |
| Files (components) | PascalCase | `HomePage.tsx` |
| Files (utilities) | camelCase | `auth.ts`, `supabase.ts` |

## Code Style

- TypeScript strict mode enabled
- Use named exports for components, default for pages
- Prefer functional components with hooks
- Use Tailwind CSS utilities (avoid custom CSS)
- Use Shadcn/ui components when available

## Common Tasks

### Adding a New Page
1. Create page component in `src/pages/`
2. Add route in `src/routes.tsx`
3. Add navigation link if needed

### Adding a New API Endpoint
1. Add route handler in `server/index.js`
2. Add API client function in `src/lib/api/`

### Adding a New Database Operation
1. Create/update file in `src/lib/db/`
2. Add types in `src/lib/db/types/`
3. Write tests (`*.test.ts`)

### Adding a New UI Component
1. Use Shadcn/ui CLI or copy from their docs
2. Place in `src/components/ui/`
3. Components use class-variance-authority for variants

## Development Standards

Detailed standards are available in `agent-os/standards/`:
- `global/tech-stack.md` - Technology decisions
- `global/conventions.md` - Development conventions
- `global/coding-style.md` - Code style guidelines
- `global/error-handling.md` - Error handling patterns
- `frontend/components.md` - Component patterns
- `frontend/accessibility.md` - A11y requirements
- `testing/test-writing.md` - Test writing guidelines

## Troubleshooting

See `TROUBLESHOOTING.md` for common issues:
- 401 authentication errors
- WebSocket connection issues
- CORS problems
- Database connection issues

## Important Notes for AI Assistants

1. **Read before editing**: Always read files before modifying them
2. **Use existing patterns**: Follow established conventions in the codebase
3. **Check types**: Ensure TypeScript types are correct
4. **Test changes**: Run `npm run test:run` after changes
5. **Lint code**: Run `npm run lint` to check for issues
6. **Use aliases**: Prefer `@/` imports over relative paths
7. **Shadcn/ui**: Use existing UI components from `src/components/ui/`
8. **Database**: All DB operations go through `src/lib/db/`
9. **Auth**: Use `useAuth` hook for auth state
10. **Forms**: Use React Hook Form + Zod for validation
