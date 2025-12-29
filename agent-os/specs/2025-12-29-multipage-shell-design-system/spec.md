# Specification: Multi-page Shell & Design System

## Goal

Create the foundational multi-page React application with a transparent navbar, reusable hero components (3 variants), and 5 pages (Home, About, Portfolio, Blog placeholder, Contact) featuring a modern dark aesthetic with fluid animations and mouse-tracking parallax effects.

## User Stories

- As a prospective client or recruiter, I want to navigate a polished, professional portfolio site so that I can quickly assess the developer's skills and experience.
- As a visitor, I want smooth animations and interactive parallax effects so that the site feels modern and engaging.
- As a potential client, I want to easily contact the developer through a functional form so that I can initiate a project discussion.

## Specific Requirements

**Project Setup & Routing**
- Initialize React + TypeScript + Vite project using Bun as package manager
- Configure React Router with shared layout wrapper (Navbar + Footer on all pages)
- Install dependencies: `react-router-dom`, `framer-motion`, `react-parallax-mouse`, `tailwindcss`, shadcn/ui components
- Configure Tailwind with dark mode (`darkMode: 'class'`) and custom design tokens
- Set up folder structure: `src/components/`, `src/pages/`, `src/layouts/`, `src/hooks/`, `src/lib/`

**Navbar Component**
- Fixed position at top of viewport
- Transparent with glass/blur effect (`backdrop-blur`) as default state
- Transitions to solid dark background on scroll (use scroll position threshold ~50px)
- Contains logo/brand name and navigation links (Home, About, Portfolio, Blog, Contact)
- Mobile-responsive with hamburger menu for smaller screens
- Smooth transition animations between states using framer-motion

**Hero Component (3 Variants)**
- Create single Hero component with `variant` prop: `"full"` | `"split"` | `"minimal"`
- **Full variant:** 100vh height, fluid animated background, multi-layer `react-parallax-mouse` effect (foreground moves faster than background), headline + subtext + CTA button
- **Split variant:** Two-column layout (text left, image/content right), responsive stacking on mobile
- **Minimal variant:** Simple headline + subtext, centered, minimal height
- All variants use framer-motion for entrance animations (staggered fade-in)

**Fluid Animated Background**
- Create reusable `FluidBackground` component for full-viewport hero
- Implement animated gradient blobs/shapes using CSS animations or framer-motion
- Reference visual style from [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio)
- Layer behind parallax elements for depth effect

**Home Page**
- Full-viewport hero with fluid background and parallax layers
- Introduction section with brief bio and key highlights
- Skills/tech stack showcase section
- Featured projects preview (placeholder cards for now)
- Call-to-action section linking to Contact

**About Page**
- Split or minimal hero variant at top
- Personal introduction and background section
- Skills/technologies grid with icons
- Developer Journey Timeline section: vertical timeline component showing career milestones, education, key achievements
- Timeline uses framer-motion for scroll-triggered animations

**Portfolio Page**
- Minimal hero variant at top
- Project grid layout with filter/category tabs (placeholder filtering logic)
- Project cards with hover effects, thumbnail, title, description, tech tags
- Cards link to individual project detail (can be modal or separate route, defer full implementation)

**Blog Page (Placeholder)**
- Minimal hero variant with "Coming Soon" messaging
- Simple placeholder content indicating blog feature is under development
- Maintain consistent layout and styling with other pages

**Contact Page**
- Split hero variant with contact info on one side
- Functional contact form with fields: Name, Email, Subject, Message
- Form validation using React Hook Form + Zod
- Form submission wired to backend endpoint (create basic Express endpoint)
- Social links section with icons (GitHub, LinkedIn, Twitter/X, Email)
- Success/error states with appropriate feedback UI

**Footer Component**
- Consistent footer across all pages
- Contains navigation links, social icons, copyright text
- Responsive layout (stacked on mobile, horizontal on desktop)
- Dark theme consistent with overall aesthetic

**Design System & Theming**
- Dark mode as primary (near-black backgrounds, light text)
- Define color palette in Tailwind config: primary accent color, grays, success/error states
- Typography: Modern sans-serif font (e.g., Inter, Space Grotesk), monospace for code elements
- Consistent spacing scale using Tailwind defaults
- Accessible focus states on all interactive elements

## Visual Design

**External Reference: [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio)**
- Sleek, modern dark aesthetic with near-black backgrounds
- Fluid animated background effects with gradient blobs
- Smooth scroll behavior and page transitions
- Typography with good hierarchy and spacing
- Subtle hover states and micro-interactions
- Locomotive-scroll style smooth scrolling (evaluate if needed)
- Framer-motion for entrance and scroll-triggered animations

## Existing Code to Leverage

**Greenfield Project**
- This is a new project with no existing source code
- Follow standards defined in `agent-os/standards/frontend/components.md` for React component structure
- Follow standards defined in `agent-os/standards/frontend/css.md` for Tailwind patterns and responsive design
- Use shadcn/ui components from `@/components/ui/` for base UI elements (Button, Input, Form, etc.)
- Reference [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio) for animation patterns (adapt from Next.js to React Router)

## Out of Scope

- User authentication and login functionality
- Admin dashboard and CMS features
- Blog content management and post creation
- Client project tracking system
- Light/dark mode toggle (dark mode only for now)
- Backend API beyond contact form endpoint
- Database integration (Supabase setup deferred)
- Project detail pages with full content (placeholder only)
- SEO meta tags and OpenGraph configuration
- Analytics integration

