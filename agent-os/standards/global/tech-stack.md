# Tech Stack

This document defines the technical stack used across all theo.dev projects.

## Primary Languages

### TypeScript (Primary)
- **Usage:** Frontend (React, Next.js), Backend (Bun, Node.js)
- **Version:** Latest stable
- **Configuration:** Strict mode always enabled
- **Why:** Type safety, better tooling, catch bugs early

### Python
- **Usage:** Scripting, data processing, automation, AI/ML models
- **Version:** 3.12+
- **Why:** Excellent for data manipulation, scripts, and AI integration

### C# / .NET
- **Usage:** Backend services, enterprise applications
- **Version:** .NET 9.0+
- **Why:** High performance, strong typing, enterprise support

### JavaScript
- **Usage:** Only when TypeScript isn't feasible
- **Why:** Legacy support or specific tooling requirements

---

## Frontend Stack

### Framework & Runtime

**React (Primary)**
- **Usage:** SPAs, dashboards, internal tools, rapid prototyping
- **Version:** React 19.2+ (Latest Stable)
- **Features:**
    - **React Compiler:** Enabled by default (reduces need for `useMemo`/`useCallback`)
    - **Server Components (RSC):** Standard for data-heavy applications
    - **Actions API:** Used for form handling and data mutations
- **Build Tool:** Vite (fast HMR, modern bundling) or Next.js 15+ (for full-stack RSC support)

**Next.js (Full Stack)**
- **Usage:** Production apps requiring SSR, RSC, or SEO
- **Version:** Latest stable
- **Why:** Best-in-class support for React Server Components and Vercel ecosystem

### UI Components

**Strategy:** Shadcn/ui (v2+) with Tailwind CSS

**Component Library:**
- **Shadcn/ui:**
    - **Base:** Radix UI or Base UI (configurable via `npx shadcn create`)
    - **New Primitives:** Use `Spinner`, `Kbd`, `Field`, `InputGroup` standard components
    - **Icons:** Lucide React
- **Custom Components:** Build only when Shadcn primitives don't suffice

**Styling:**
- **Tailwind CSS:** Utility-first styling (v4.0 compatible)
- **CSS Modules:** Rare exception for complex legacy integrations
- **Philosophy:** Visual result matters more than methodology; prefer utility classes

### State Management

**Structured approach by use case:**

1. **Server State** → React Server Components + `use()` hook / TanStack Query
   - Prefer RSC for initial data fetching
   - Use TanStack Query for client-side polling/mutations if strict interactivity needed

2. **Global Client State** → Zustand
   - App-wide UI state (modals, themes, user preferences)
   - Auth state (if not handled by Context)

3. **Form State** → React Actions + `useActionState` / React Hook Form
   - Simple forms: React 19 Actions API (`useActionState`, `useFormStatus`)
   - Complex forms: React Hook Form + Zod

4. **Local Component State** → `useState` / `useOptimistic`
   - UI toggles
   - Optimistic UI updates for better UX

---

## Backend Stack

### Runtime & Frameworks

**Bun (Primary)**
- **Version:** 1.2+
- **Usage:** REST APIs, serverless functions, backend services
- **Key Features:**
    - **Bun.sql:** Native high-performance PostgreSQL driver
    - **Bun.s3:** Native S3 client
    - **Native WebSocket:** For real-time apps
- **Why:** 3x faster than Node.js, native TypeScript, integrated test runner

**Node.js (Secondary/Legacy)**
- **Version:** Node 24 (LTS) 'Krypton'
- **Usage:** When specific legacy library compatibility is required
- **Features:** Native `fetch`, Permission Model, Native Test Runner

**.NET**
- **Framework:** ASP.NET Core Web API
- **Version:** .NET 9.0+
- **Usage:** Enterprise constraints or high-performance microservices

### API Architecture

**Decision Matrix:**

1. **Server Actions (Next.js/React 19)**
   - Default for full-stack React applications
   - Direct database access from server components

2. **REST (Standard)**
   - Use for separate backend services (Bun/Express/Hono)
   - Standard CRUD operations

3. **tRPC**
   - Use for type-safe client-server communication in mono-repos

4. **GraphQL**
   - Use only for complex, federated data requirements

---

## Database & Storage

**Philosophy:** Choose between Managed (Firebase) or SQL/Open (Supabase) based on project needs.

### Option A: Supabase (SQL & Vector)
- **Database:** PostgreSQL with `pgvector` (AI/Embeddings)
- **Auth:** Supabase Auth (Row Level Security policies)
- **Storage:** Supabase Storage (S3 compatible)
- **Why:** Open source, relational data, AI-ready, SQL ecosystem

### Option B: Firebase (NoSQL & Rapid Dev)
- **Database:** Firestore (NoSQL document store)
- **Auth:** Firebase Auth
- **AI:** Firebase Genkit & Gemini integration
- **Why:** Rapid prototyping, deep Google integration, simple real-time sync

### Option C: Bun Native (Self-hosted)
- **Database:** PostgreSQL (via `Bun.sql`)
- **Storage:** S3 Compatible (via `Bun.s3`)
- **Why:** Maximum performance, lowest cost, self-hosted infrastructure

---

## Authentication & Authorization

### Authentication
- **Supabase Auth / Firebase Auth:** Preferred for ease of use
- **Passkeys:** Enable where supported

### Authorization
- **Database Level:** Row Level Security (RLS) for Supabase
- **Middleware Level:** Custom logic for Bun/.NET backends

---

## Deployment & Infrastructure

### Containerization
- **Docker:** Standard for all backend services
- **Bun:** Use official Bun alpine images for small footprint

### CI/CD
- **GitHub Actions:** Standard for testing and deployment
- **Checks:** Type-check, Lint, Test (Native Node/Bun runner)

### Deployment Targets
- **Vercel:** Next.js / Frontend
- **Google Cloud Run:** Docker containers (Backend)
- **Fly.io:** Application servers (if persistent connections needed)
- **Supabase/Firebase:** Hosting for static sites

---

## Development Tools

### Code Editors
- **VS Code** / **Cursor** (AI-assisted)

### Version Control
- **Git** & **GitHub**

### Package Managers
- **bun** (Default) - Super fast install & run

---

## Browser Support

### Modern Browsers Only
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**No IE11 support**