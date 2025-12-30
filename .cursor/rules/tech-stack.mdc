---
description: Tech stack and dependencies guide for theochinomona.tech
globs: 
alwaysApply: true
---
# theochinomona.tech Tech Stack & Dependencies Guide

## Project Overview

**theochinomona.tech** is a portfolio and client portal web application built with:
- **Frontend**: React 19 + TypeScript + Vite SPA
- **Backend**: Express.js (Node.js)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Firebase Auth + Supabase Auth

## Architecture Pattern

**Modern JAMstack with Supabase**:
- React SPA with client-side routing
- Supabase for database and auth
- Firebase for additional auth capabilities
- Simple Express server for secure operations

---

## Frontend Stack

### Core Framework

**React 19.0.0**
- **Purpose**: UI framework
- **Best Practices**:
  - Use functional components with hooks
  - Leverage React 19 features (use, Actions, etc.)
  - Use Suspense for loading states

**TypeScript 5.7.x**
- **Purpose**: Type-safe JavaScript
- **Best Practices**:
  - Enable strict mode
  - Use proper type definitions
  - Avoid `any` type
  - Leverage `z.infer<>` for Zod schemas

### Build Tool

**Vite 6.0.5**
- **Purpose**: Build tool and development server
- **Best Practices**:
  - Use environment variables with `VITE_` prefix
  - Leverage HMR for fast development
  - Configure proper chunk splitting

### UI Library

**shadcn/ui with Radix UI Primitives**
- **Components**: Alert Dialog, Checkbox, Dialog, Dropdown Menu, Label, Select, Slider, Slot, Switch, Tabs, Tooltip
- **Purpose**: Accessible, customizable component library
- **Best Practices**:
  - Customize components in `components/ui/`
  - Use Tailwind classes for styling
  - Maintain accessibility standards

**Tailwind CSS 4.1.x**
- **Purpose**: Utility-first CSS framework
- **Best Practices**:
  - Use `cn()` utility for conditional classes
  - Follow brand guide color system
  - Use custom animations defined in config

```typescript
// ✅ Good: Use cn() for conditional classes
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded-lg",
  isActive && "bg-indigo-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

### State Management

**Zustand 5.0.9**
- **Purpose**: Lightweight global state management
- **Use Cases**: Auth state, UI state, notifications
- **Best Practices**:
  - Create typed stores
  - Use selectors to prevent unnecessary re-renders
  - Keep stores focused and small

```typescript
// ✅ Good: Typed Zustand store
interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
}))
```

**TanStack React Query 5.90.x**
- **Purpose**: Server state management and data fetching
- **Use Cases**: API data fetching, caching, background refetching
- **Best Practices**:
  - Use query keys consistently
  - Implement proper error handling
  - Leverage cache invalidation

```typescript
// ✅ Good: React Query pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => fetchProjects(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Forms & Validation

**React Hook Form 7.69.0**
- **Purpose**: Form state management
- **Best Practices**:
  - Use uncontrolled components for performance
  - Integrate with Zod for validation
  - Use `@hookform/resolvers` for schema validation

**Zod 4.2.x**
- **Purpose**: Schema validation
- **Use Cases**: Form validation, API response validation
- **Best Practices**:
  - Define schemas close to usage
  - Leverage type inference with `z.infer<>`
  - Compose schemas for reusability

```typescript
// ✅ Good: Zod schema with type inference
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed']),
})

type ProjectFormData = z.infer<typeof projectSchema>
```

### Routing

**React Router DOM 7.11.0**
- **Purpose**: Client-side routing
- **Best Practices**:
  - Use nested routes for layouts
  - Implement protected routes for auth
  - Use `useParams` and `useNavigate` hooks

### Animation

**Framer Motion 12.23.x**
- **Purpose**: Declarative animations
- **Use Cases**: Page transitions, component animations
- **Best Practices**:
  - Use `motion` components for animations
  - Implement `AnimatePresence` for exit animations
  - Keep animations subtle and purposeful

### Icons

**Lucide React 0.562.x**
- **Purpose**: Icon library
- **Best Practices**:
  - Import icons individually for tree-shaking
  - Use consistent icon sizes (16, 20, 24)
  - Match icon color to text context

### Notifications

**Sonner 2.0.7**
- **Purpose**: Toast notifications
- **Best Practices**:
  - Use for transient feedback
  - Keep messages concise
  - Use appropriate toast types (success, error, info)

### Utilities

**date-fns 4.1.0**
- **Purpose**: Date manipulation and formatting
- **Best Practices**: Import individual functions for tree-shaking

**clsx & tailwind-merge**
- **Purpose**: Class name utilities
- **Wrapped in**: `cn()` utility in `lib/utils.ts`

---

## Backend Stack

### Server

**Express.js 4.21.x**
- **Purpose**: API server for secure operations
- **Dependencies**:
  - `cors` - Cross-origin requests
  - `zod` - Request validation
- **Location**: `/server/` directory

---

## Database & Auth

### Primary: Supabase

**@supabase/supabase-js 2.89.0**

| Feature | Usage |
|---------|-------|
| Database | PostgreSQL with Row Level Security |
| Auth | Supabase Auth (email/password, invitations) |
| Storage | File storage for attachments |
| Edge Functions | Serverless functions for secure operations |

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and profiles |
| `projects` | Portfolio and client projects |
| `project_phases` | Project milestone phases |
| `project_tasks` | Tasks within phases |
| `project_attachments` | File attachments |
| `tracking_codes` | Public tracking code links |
| `user_preferences` | User settings |
| `activity_log` | Activity tracking |
| `client_groups` | Client organization groups |
| `client_group_members` | Group membership |
| `release_notes` | Project release notes |
| `notifications` | User notifications |

### Best Practices

```typescript
// ✅ Good: Supabase query pattern
const { data, error } = await supabase
  .from('projects')
  .select('*, phases:project_phases(*)')
  .eq('client_id', userId)
  .order('created_at', { ascending: false })

if (error) throw error
return data
```

### Secondary: Firebase

**firebase 12.7.0**

| Feature | Usage |
|---------|-------|
| Auth | Firebase Authentication (additional auth provider) |
| Integration | Works alongside Supabase Auth |

---

## Development Tools

### Package Manager

**Bun** (preferred) / **npm** (fallback)
- Both `bun.lock` and `package-lock.json` present
- Use `bun install` or `npm install`

### Linting

**ESLint 9.x** with TypeScript ESLint
- React Hooks plugin
- React Refresh plugin

### Testing

**Vitest 4.0.x**
- **Purpose**: Unit and integration testing
- **Best Practices**:
  - Co-locate tests with source files (`*.test.ts`)
  - Use React Testing Library for component tests
  - Run with `npm test` or `bun test`

**@testing-library/react 16.x**
- **Purpose**: Component testing
- **Best Practices**:
  - Query by accessibility roles
  - Use `userEvent` for interactions
  - Test behavior, not implementation

```typescript
// ✅ Good: React Testing Library pattern
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('submits form with valid data', async () => {
  render(<ContactForm />)
  
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

---

## Brand Guide Integration

### Colors (from brand-guide.md)

| Role | Light Theme | Dark Theme | Tailwind Class |
|------|-------------|------------|----------------|
| Primary Text | `#0F172A` | `#FFFFFF` | `text-slate-900` / `text-white` |
| Secondary Text | `#475569` | `#94A3B8` | `text-slate-600` |
| Accent (CTA) | `#6366F1` | `#6366F1` | `bg-indigo-500` |
| Accent Hover | `#4F46E5` | `#4F46E5` | `hover:bg-indigo-600` |
| Focus Rings | `#A5B4FC` | `#A5B4FC` | `focus:ring-indigo-300` |

### Typography

| Use Case | Font Family | Tailwind Class |
|----------|-------------|----------------|
| Headlines | Space Grotesk | `font-sans` (default) |
| Body | Space Grotesk, Inter | `font-sans` |
| Code | JetBrains Mono | `font-mono` |

---

## Code Patterns & Conventions

### Component Structure

```typescript
// ✅ Good: Functional component with TypeScript
interface ProjectCardProps {
  project: Project
  onEdit?: (id: string) => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['project', project.id],
    queryFn: () => fetchProjectDetails(project.id),
  })
  
  if (isLoading) return <Skeleton />
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

### Database Access Pattern

```typescript
// ✅ Good: Database access in lib/db/
// src/lib/db/projects.ts
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### Hook Pattern

```typescript
// ✅ Good: Custom hook with proper typing
export function useAuth() {
  const { user, isLoading } = useAuthStore()
  
  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }, [])
  
  return { user, isLoading, login }
}
```

### Protected Route Pattern

```typescript
// ✅ Good: Role-based route protection
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<DashboardOverview />} />
</Route>
```

---

## Environment Variables

Frontend variables must be prefixed with `VITE_`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│   React 19 SPA + Tailwind + shadcn/ui + Vite   │
└───────────────────────┬─────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Supabase    │ │   Firebase    │ │    Express    │
│ PostgreSQL+RLS│ │     Auth      │ │    Server     │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

*Last Updated: December 2024*
