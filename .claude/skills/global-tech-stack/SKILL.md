---
name: Global Tech Stack
description: Use the standardized technology stack with TypeScript as primary language (strict mode always), React 19+ with Vite or Next.js 15+ for frontend, Bun 1.2+ as primary backend runtime, Supabase (PostgreSQL with pgvector) or Firebase for database, Tailwind CSS v4.0+ with Shadcn/ui v2+ for styling and components, and appropriate state management. Use this skill when making technology choices, setting up new projects, choosing libraries or frameworks, implementing authentication, selecting databases, configuring build tools, or documenting technology decisions. Apply when creating package.json files, configuring TypeScript (tsconfig.json with strict: true), setting up Supabase or Firebase, choosing between React + Vite (SPAs, dashboards) and Next.js (SSR, SEO, RSC), selecting state management solutions, or any technology selection decisions. This skill ensures TypeScript with strict mode, React 19+ with React Compiler (no manual useMemo/useCallback), Vite or Next.js 15+ for frontend, Bun 1.2+ with native Bun.sql and Bun.s3 for backend (3x faster than Node.js), Supabase (PostgreSQL + pgvector + RLS) or Firebase (Firestore + Auth + Genkit) for database, Supabase Auth or Firebase Auth with Passkeys support, Tailwind CSS v4.0+ with Shadcn/ui (Radix/Base UI primitives, Lucide icons), state management (Server Components + use() for server state, TanStack Query for client polling/mutations, Zustand for global client state, React Actions for forms), Docker for all deployments (Cloud Run, Vercel, Fly.io), and bun as default package manager.
---

# Global Tech Stack

## When to use this skill:

- When initializing new frontend or backend projects
- When choosing between React + Vite (SPAs, dashboards) and Next.js 15+ (SSR, SEO, RSC)
- When selecting state management (Server Components, TanStack Query, Zustand, React Actions)
- When implementing authentication (Supabase Auth or Firebase Auth with Passkeys)
- When choosing a database (Supabase PostgreSQL with pgvector, Firebase Firestore, or Bun.sql self-hosted)
- When deciding on styling approaches (Tailwind CSS default, CSS Modules when needed)
- When setting up Shadcn/ui components with Radix or Base UI primitives
- When configuring TypeScript strict mode in tsconfig.json
- When selecting deployment targets (Vercel for Next.js, Cloud Run for Docker, Fly.io for persistent connections)
- When choosing backend runtime (Bun 1.2+ primary, Node.js 24 for legacy compatibility)
- When using Bun.sql native driver or Bun.s3 for S3-compatible storage
- When documenting technology choices in project README
- When making any technology selection or architectural decision
- When setting up API architecture (Server Actions, REST with Hono/Express, tRPC for monorepos)

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle global tech stack.

## Instructions

For details, refer to the information provided in this file:
[global tech stack](../../../agent-os/standards/global/tech-stack.md)
