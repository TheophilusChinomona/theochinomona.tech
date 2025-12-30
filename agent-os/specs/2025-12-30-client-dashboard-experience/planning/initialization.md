# Spec Initialization: Client Dashboard Experience

**Date:** 2025-12-30

## Raw Idea

Logged-in users see their projects + summary + history.

## Context

This is Phase 6 of the product roadmap (Size: M). It addresses the need for authenticated client users to have a dedicated dashboard where they can view their assigned projects, track progress, and see activity history.

### Existing Infrastructure

**User System:**
- `users` table with `role` enum ('admin', 'client')
- Authentication via Supabase with email verification
- `ProtectedRoute` component supports role-based access

**Project System:**
- `projects` table with `client_id` FK to users (links projects to clients)
- `project_phases` with status, dates, and progress
- `project_tasks` with completion percentages
- `tracking_codes` for public project viewing

**Current Gaps:**
- Clients currently redirect to home page after login (no dedicated dashboard)
- `Navbar.tsx` comment: "For clients, we could have a client dashboard in the future"
- `LoginPage.tsx` redirects clients to '/' instead of a dashboard


