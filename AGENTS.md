# AGENTS.md  theochinomona.tech

## What this project is
theochinomona.tech is a full-stack portfolio and client portal for Theo Chinomona. It helps prospective clients and hiring managers evaluate Theo's work through a polished public site, while giving authenticated clients and admins access to project tracking, billing, notifications, release notes, and project management workflows powered primarily by Supabase.

## Owner
Theo Chinomona  theochinomona.tech
Repo: https://github.com/TheophilusChinomona/theochinomona.tech

---

## Stack
- **Frontend:** React 19 + TypeScript + Vite SPA
- **Styling:** Tailwind CSS 4 + shadcn/ui + custom CSS variables
- **Backend:** Supabase Edge Functions + optional Node/Express server for local `/api/contact`
- **Database:** Supabase PostgreSQL
- **Deployment:** Dokploy via Dockerfile + Nginx
- **DNS:** Cloudflare

---

## Brand & Design
- **Primary colour:** Indigo `#6366F1`
- **Accent colour:** Indigo Dark `#4F46E5`
- **Typography:** Space Grotesk with Inter/system fallbacks
- **Mobile-first:** Yes  always
- **Design reference:** `agent-os/product/brand-guide.md`

---

## Project structure
`src/` contains the React app: `pages/` for route-level screens, `components/` for shared/admin/client/project UI, `layouts/` for public/admin/client shells, `lib/` for Supabase, Stripe, Firebase, utilities, and database access functions, `hooks/` for custom hooks, `store/` for Zustand auth state, and `contexts/` for app-wide providers. `public/` stores static brand assets and project imagery. `server/` contains the small Express contact-form backend used in local/dev API proxying. `supabase/` holds migrations, storage setup, and Edge Functions. `agent-os/` contains product, spec, and engineering-standard documentation for the repo.

---

## What's already built
- Public marketing site pages: home, about, portfolio, blog, contact, login, email verification, and public tracking
- Client dashboard with projects, billing, notifications, settings, portfolio access, and project request creation
- Admin dashboard with users, projects, tracking, invoices, refunds, release notes, client groups, notifications, and tax rates
- Supabase auth flow with protected routes and role-aware access
- Project phases, tasks, activity feeds, threaded comments, attachments, and template-based project creation
- Billing foundation with invoices, payments, subscriptions, refunds, Stripe-related Edge Functions, and PDF/email helpers
- Automated test coverage across pages, components, auth, storage, and database helper modules

## What still needs to be built
- [ ] Replace the placeholder local contact form handling with a real email provider integration in `server/index.js`
- [ ] Audit and finish deployment/runtime configuration for all Stripe, Resend, and Supabase Edge Function secrets
- [ ] Expand README/docs at repo root so setup and architecture are documented outside Agent OS memory files

## Known issues
- Contact form backend currently logs submissions instead of sending email
- Root README is effectively empty, so project onboarding depends on internal docs under `.claude/` and `agent-os/`
- Firebase appears to be fallback/optional and may drift if not actively maintained

---

## Conventions (read before touching code)
- Use the existing Vite + React Router SPA structure; this is not a Next.js app
- Use TypeScript for app code and keep route screens under `src/pages/`
- Keep shared data access in `src/lib/db/` instead of embedding Supabase queries directly into components
- Use React Hook Form + Zod for forms and validation patterns already established in the repo
- Use Tailwind utilities, shadcn/ui primitives, and existing CSS variables in `src/index.css`; avoid ad hoc inline styling
- Preserve the current auth model: Supabase Auth + Zustand store + `ProtectedRoute`
- Respect the Vite proxy and local Express flow for `/api/*`; frontend expects `/api/contact` to exist in local dev
- Follow Conventional Commits: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Test non-trivial changes with `npm run test:run` and `npm run build` before shipping

## Do NOT touch
- `public/images/logos/` and `public/images/logos-svg/` brand assets unless Theo explicitly requests a branding update
- Environment variable names and secret wiring; Theo manages live credentials and deployment secrets
- Dokploy/Cloudflare deployment assumptions in `.claude` memory files without confirming infra intent first
- Generated or historical migration files in `supabase/migrations/` unless the change specifically requires a new migration

---

## Environment variables
List keys only  never commit values:
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
PORT=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SITE_URL=
```

## Local dev
```bash
npm install
npm run dev        # frontend on http://localhost:5173
npm run build      # verify production build
npm run test:run   # run Vitest suite
```

Optional local API server for contact form:
```bash
cd server
npm install
npm run dev        # backend on http://localhost:3001
```

## Deployment
Push to `main`  Dokploy auto-deploys from GitHub using the root `Dockerfile`. Cloudflare fronts the site, and Vite build-time variables must be supplied as Dokploy build args because `.env` is excluded from Docker builds.

---

## Agent role on this project
**Primary agent:** FORGE
**Reporting to:** NEXUS for delivery status
**Theo approves:** all PRs before merge, all deployments before going live
