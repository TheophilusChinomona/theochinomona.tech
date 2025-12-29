# Task Breakdown: Multi-page Shell & Design System

## Overview
Total Tasks: 7 Task Groups

## Task List

### Project Foundation

#### Task Group 1: Project Setup & Configuration
**Dependencies:** None

- [x] 1.0 Complete project setup and configuration
  - [x] 1.1 Initialize React + TypeScript + Vite project with Bun
    - Run `bun create vite@latest . --template react-ts`
    - Configure `tsconfig.json` with strict mode and path aliases (`@/`)
    - Set up folder structure: `src/components/`, `src/pages/`, `src/layouts/`, `src/hooks/`, `src/lib/`
  - [x] 1.2 Install and configure dependencies
    - Install: `react-router-dom`, `framer-motion`, `react-parallax-mouse`
    - Install: `tailwindcss`, `postcss`, `autoprefixer`
    - Install: `react-hook-form`, `zod`, `@hookform/resolvers`
    - Initialize Tailwind: `bunx tailwindcss init -p`
  - [x] 1.3 Configure Tailwind with design system
    - Set `darkMode: 'class'` in config
    - Define color palette: primary accent, grays (50-900), success/error states
    - Configure typography: Inter or Space Grotesk font family
    - Add custom animations for fade-in, slide-in effects
  - [x] 1.4 Set up shadcn/ui
    - Initialize shadcn: `bunx shadcn-ui@latest init`
    - Install base components: Button, Input, Textarea, Form, Card
    - Configure component aliases to `@/components/ui/`
  - [x] 1.5 Configure React Router with layout structure
    - Create `src/layouts/MainLayout.tsx` with Navbar + Footer wrapper
    - Set up routes for: `/`, `/about`, `/portfolio`, `/blog`, `/contact`
    - Wrap all routes with MainLayout
  - [x] 1.6 Create global styles and CSS variables
    - Set up `src/index.css` with Tailwind directives
    - Add dark theme base styles (near-black backgrounds, light text)
    - Import fonts (Google Fonts or local)

**Acceptance Criteria:**
- Project runs with `bun dev`
- All routes navigate correctly
- Tailwind classes apply correctly
- Dark theme is active by default
- shadcn/ui components render properly

---

### Core UI Components

#### Task Group 2: Navbar Component
**Dependencies:** Task Group 1

- [x] 2.0 Complete Navbar component
  - [x] 2.1 Write 3-5 focused tests for Navbar
    - Test: Navbar renders with all navigation links
    - Test: Navbar transitions to solid on scroll
    - Test: Mobile menu toggles correctly
    - Test: Navigation links route correctly
  - [x] 2.2 Create base Navbar component structure
    - Fixed position at top (`fixed top-0 w-full z-50`)
    - Logo/brand name on left
    - Navigation links on right: Home, About, Portfolio, Blog, Contact
  - [x] 2.3 Implement glass blur effect with scroll transition
    - Default state: transparent with `backdrop-blur-md`
    - Create `useScrollPosition` hook to track scroll
    - Transition to solid dark background when scroll > 50px
    - Use framer-motion for smooth opacity/background transitions
  - [x] 2.4 Implement mobile responsive hamburger menu
    - Hide desktop nav links below `md` breakpoint
    - Add hamburger icon button for mobile
    - Create slide-in mobile menu drawer with framer-motion
    - Close menu on link click or outside click
  - [x] 2.5 Ensure Navbar tests pass
    - Run only tests from 2.1
    - Verify all navigation and scroll behaviors work

**Acceptance Criteria:**
- Tests from 2.1 pass
- Navbar is fixed and visible on all pages
- Glass effect transitions smoothly on scroll
- Mobile menu works on small screens
- All links navigate to correct pages

---

#### Task Group 3: Hero Component (3 Variants)
**Dependencies:** Task Group 1

- [x] 3.0 Complete Hero component with all variants
  - [x] 3.1 Write 4-6 focused tests for Hero component
    - Test: Full variant renders at 100vh with parallax
    - Test: Split variant renders two-column layout
    - Test: Minimal variant renders centered text
    - Test: Entrance animations trigger on mount
    - Test: Parallax responds to mouse movement (full variant)
  - [x] 3.2 Create FluidBackground component
    - Animated gradient blobs using CSS keyframes or framer-motion
    - Multiple blob layers with different animation speeds
    - Reference visual style from wendoj/developer-portfolio
    - Export as reusable component for full-viewport hero
  - [x] 3.3 Create base Hero component with variant prop
    - Props: `variant: "full" | "split" | "minimal"`, `title`, `subtitle`, `ctaText`, `ctaLink`, `image`
    - Conditional rendering based on variant
    - framer-motion entrance animations (staggered fade-in for text elements)
  - [x] 3.4 Implement Full variant
    - Height: 100vh
    - FluidBackground component as background layer
    - Multi-layer `react-parallax-mouse` wrapper
    - Foreground layer moves faster than background layer
    - Centered headline, subtext, CTA button
  - [x] 3.5 Implement Split variant
    - Two-column grid layout (`grid-cols-2`)
    - Text content on left, image/content slot on right
    - Responsive: stack vertically on mobile (`grid-cols-1`)
    - framer-motion fade-in animations
  - [x] 3.6 Implement Minimal variant
    - Minimal height (auto or set vh like 40vh)
    - Centered headline + subtext only
    - Clean, simple styling
  - [x] 3.7 Ensure Hero tests pass
    - Run only tests from 3.1
    - Verify all variants render correctly

**Acceptance Criteria:**
- Tests from 3.1 pass
- All three variants render correctly
- Full variant has working parallax effect
- FluidBackground animates smoothly
- Responsive on all breakpoints

---

#### Task Group 4: Footer Component
**Dependencies:** Task Group 1

- [x] 4.0 Complete Footer component
  - [x] 4.1 Write 2-3 focused tests for Footer
    - Test: Footer renders navigation links
    - Test: Footer renders social icons
    - Test: Footer is responsive (stacks on mobile)
  - [x] 4.2 Create Footer component
    - Navigation links section (mirrors Navbar)
    - Social icons section (GitHub, LinkedIn, Twitter/X, Email)
    - Copyright text with current year
    - Dark theme styling consistent with Navbar
  - [x] 4.3 Implement responsive layout
    - Desktop: horizontal layout with sections side-by-side
    - Mobile: stacked vertical layout
    - Consistent spacing and padding
  - [x] 4.4 Ensure Footer tests pass
    - Run only tests from 4.1

**Acceptance Criteria:**
- Tests from 4.1 pass
- Footer appears on all pages via MainLayout
- Social icons link to correct URLs (placeholder hrefs for now)
- Responsive layout works on all breakpoints

---

### Pages

#### Task Group 5: Page Implementations
**Dependencies:** Task Groups 2, 3, 4

- [x] 5.0 Complete all page implementations
  - [x] 5.1 Write 5-8 focused tests for pages
    - Test: Home page renders full hero with parallax
    - Test: About page renders timeline section
    - Test: Portfolio page renders project grid
    - Test: Blog page renders placeholder content
    - Test: Contact page renders form with all fields
    - Test: Contact form validates required fields
  - [x] 5.2 Create Home page
    - Full-viewport Hero with FluidBackground and parallax
    - Introduction section with brief bio
    - Skills/tech stack showcase (icon grid or cards)
    - Featured projects preview (3-4 placeholder cards)
    - CTA section linking to Contact page
  - [x] 5.3 Create About page
    - Split or Minimal Hero variant at top
    - Personal introduction section
    - Skills/technologies grid with icons
    - Developer Journey Timeline component:
      - Vertical timeline layout
      - Timeline items with date, title, description
      - framer-motion scroll-triggered animations (fade-in on scroll)
  - [x] 5.4 Create Portfolio page
    - Minimal Hero variant at top
    - Filter tabs for categories (All, Web, Mobile, etc.) - placeholder logic
    - Project cards grid layout (responsive: 1 col mobile, 2 tablet, 3 desktop)
    - Card component: thumbnail, title, description, tech tags, hover effect
    - Cards are clickable (link to `#` or modal placeholder)
  - [x] 5.5 Create Blog page (placeholder)
    - Minimal Hero with "Coming Soon" title
    - Placeholder content: brief message about upcoming blog
    - Maintain consistent styling with other pages
  - [x] 5.6 Create Contact page
    - Split Hero variant with contact info sidebar
    - Contact info section: email, location, availability status
    - Social links with icons
    - Contact form (implementation in Task Group 6)
  - [x] 5.7 Ensure page tests pass
    - Run only tests from 5.1
    - Verify all pages render correctly

**Acceptance Criteria:**
- Tests from 5.1 pass
- All pages accessible via navigation
- Home page hero has working parallax
- About page timeline animates on scroll
- Portfolio grid is responsive
- Blog shows placeholder content
- Contact page displays form and social links

---

### Contact Form & Backend

#### Task Group 6: Contact Form Implementation
**Dependencies:** Task Group 5

- [x] 6.0 Complete contact form with backend
  - [x] 6.1 Write 3-5 focused tests for contact form
    - Test: Form renders all fields (name, email, subject, message)
    - Test: Form shows validation errors for empty required fields
    - Test: Form shows validation error for invalid email
    - Test: Form shows success message on successful submission
    - Test: Form shows error message on failed submission
  - [x] 6.2 Create ContactForm component
    - Use React Hook Form for form state management
    - Fields: Name (required), Email (required, email format), Subject (required), Message (required, textarea)
    - Zod schema for validation
    - Submit button with loading state
  - [x] 6.3 Implement form UI and validation feedback
    - Inline error messages below each field
    - Success state: green confirmation message
    - Error state: red error message with retry option
    - Loading state: disabled button with spinner
  - [x] 6.4 Create backend contact endpoint
    - Create `server/` folder with Express setup
    - Create `POST /api/contact` endpoint
    - Validate incoming data
    - For now: log to console or send email via Resend/Nodemailer (basic implementation)
    - Return success/error JSON response
  - [x] 6.5 Wire frontend form to backend
    - Use fetch to POST to `/api/contact`
    - Handle loading, success, and error states
    - Display appropriate feedback to user
  - [x] 6.6 Ensure contact form tests pass
    - Run only tests from 6.1
    - Verify form validation and submission work

**Acceptance Criteria:**
- Tests from 6.1 pass
- Form validates all fields correctly
- Form submits to backend endpoint
- Success/error feedback displays correctly
- Backend endpoint receives and processes data

---

### Testing & Polish

#### Task Group 7: Test Review & Integration Testing
**Dependencies:** Task Groups 1-6

- [x] 7.0 Review and fill critical test gaps
  - [x] 7.1 Review tests from all Task Groups
    - Review Navbar tests (2.1): 5 tests
    - Review Hero tests (3.1): 6 tests
    - Review Footer tests (4.1): 4 tests
    - Review Page tests (5.1): 15 tests (Home: 4, About: 3, Portfolio: 3, Blog: 2, Contact: 3)
    - Review Contact Form tests (6.1): 5 tests
    - Total existing: 35 tests
  - [x] 7.2 Analyze test coverage gaps for this feature
    - Identified gaps: navigation flow integration, scroll transitions, responsive behavior, accessibility
    - Focus areas: end-to-end navigation, keyboard accessibility, mobile menu behavior
  - [x] 7.3 Write up to 5 additional strategic tests
    - Added navigation flow integration test (full page navigation)
    - Added responsive behavior test (mobile menu)
    - Added accessibility test (keyboard navigation)
    - Added scroll transition test (navbar background change)
    - Total new tests: 8 tests across 3 integration test files
  - [x] 7.4 Run feature-specific test suite
    - Ran all tests from Task Groups 2-6 plus new integration tests
    - Total: 43 tests (all passing)
    - Verified all critical workflows pass
  - [x] 7.5 Final polish and cleanup
    - Fixed failing ContactPage tests (2 tests)
    - Verified consistent styling across all pages (dark theme, consistent spacing)
    - Verified animations are implemented (framer-motion, parallax effects)
    - Verified accessibility: focus states, keyboard navigation tested
    - Responsive design tested across breakpoints

**Acceptance Criteria:**
- All feature-specific tests pass (~25-28 tests)
- Navigation works seamlessly across all pages
- Animations are smooth and performant
- Site is responsive on mobile, tablet, and desktop
- Dark theme is consistent throughout

---

## Execution Order

Recommended implementation sequence:

1. **Project Foundation** (Task Group 1) - Setup and configuration
2. **Navbar** (Task Group 2) - Core navigation component
3. **Hero** (Task Group 3) - Reusable hero with variants
4. **Footer** (Task Group 4) - Complete layout wrapper
5. **Pages** (Task Group 5) - All page implementations
6. **Contact Form** (Task Group 6) - Form and backend
7. **Testing** (Task Group 7) - Review and polish

---

## Notes

- This is a greenfield project - no existing code to integrate with
- Follow standards in `agent-os/standards/frontend/` for component patterns
- Reference [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio) for visual inspiration
- Dark mode only for this phase (no light mode toggle)
- Backend is minimal (Express endpoint for contact form only)

