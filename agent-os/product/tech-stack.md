# Tech Stack

Aligned to user preference: React (latest), Tailwind CSS v3, shadcn/ui, Node.js backend, Supabase or Firebase, **Bun package manager**, modular + scalable.

---

## Frontend

| Category       | Technology                  |
| -------------- | --------------------------- |
| Framework      | React (latest)              |
| Styling        | Tailwind CSS v3             |
| Components     | shadcn/ui                   |
| Routing        | React Router                |
| State          | React Query / Zustand       |
| Forms          | React Hook Form + Zod       |

---

## Backend

| Category       | Technology                  |
| -------------- | --------------------------- |
| Runtime        | Node.js (LTS)               |
| Framework      | Express (or lightweight)    |
| API Structure  | Dedicated `/api` layer      |

### API Modules

- `auth` – helpers & middleware
- `projects` – CRUD operations
- `admin` – protected routes
- `tracking` – code generation & lookup
- `settings` – site configuration

---

## Auth & Database

### Primary: Supabase

| Feature        | Usage                       |
| -------------- | --------------------------- |
| Authentication | Supabase Auth               |
| Database       | PostgreSQL                  |
| Security       | Row Level Security (RLS)    |

### Database Tables

- `users`
- `projects`
- `project_phases`
- `project_tasks`
- `tracking_codes`
- `quotes`
- `site_settings`

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
| Language         | TypeScript                  |
| Package Manager  | **Bun**                     |
| Linting          | ESLint + Prettier           |
| Unit Testing     | Vitest / Jest               |
| Component Tests  | React Testing Library       |
| E2E Testing      | Playwright / Cypress        |
| CI/CD            | GitHub Actions              |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         React SPA + Tailwind + shadcn           │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                Node.js Backend                   │
│           Express API + Middleware              │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                   Supabase                       │
│          Auth + PostgreSQL + RLS                │
└─────────────────────────────────────────────────┘
```

- React SPA with client-side routing
- Supabase handles auth & database
- Node.js backend for secure operations
- Bun for fast development workflow

