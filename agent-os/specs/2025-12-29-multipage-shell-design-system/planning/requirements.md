# Spec Requirements: Multi-page Shell & Design System

## Initial Description

**Feature:** Multi-page Shell & Design System

**Description:** Create Home, About, Projects, Portfolio, Blog, Contact with transparent navbar + reusable hero component using React + Tailwind + shadcn.

**Source:** Product Roadmap - Item #1 (Foundation Phase)

---

## Requirements Discussion

### First Round Questions

**Q1:** I assume the transparent navbar means a glass/blur effect that becomes solid on scroll or when overlaying dark content. Is that correct, or would you prefer always-transparent, always-solid, or another behavior?

**Answer:** That is correct — glass/blur effect that becomes solid on scroll.

---

**Q2:** I'm thinking the hero component should be a reusable component with variants for: Full-viewport hero with background, Split hero (text left, image right), Minimal hero (just headline + subtext). Should we build all three variants, or focus on one primary style?

**Answer:** All 3 variants. For the full-viewport hero, use a React component with a fluid background effect (see visual reference).

---

**Q3:** For the 6 pages (Home, About, Projects, Portfolio, Blog, Contact) — I assume Projects = client work/case studies and Portfolio = personal/side projects. Is that correct? I assume Blog will be a placeholder for now. Correct?

**Answer:** Projects and Portfolio should be **combined into one page called "Portfolio"**. Blog will be a placeholder for now.

---

**Q4:** I assume the overall aesthetic should be modern, professional, and developer-focused — dark mode primary with optional light mode toggle. Is that the vibe?

**Answer:** Yes, that is correct. Additionally, for hero sections use `react-parallax-mouse` over the hero background for mouse-tracking parallax effects.

---

**Q5:** For the developer journey timeline mentioned in the mission, should this live on the About page, or be its own section/page?

**Answer:** In its own **section within the About page** (not a separate page).

---

**Q6:** I'm assuming we'll set up the React Router structure with a shared layout (navbar + footer) wrapping all pages. Is there any page that should NOT have the standard layout?

**Answer:** No — all pages use the standard layout with navbar and footer.

---

**Q7:** Should the Contact page include a functional contact form (wired to email/backend), or just display contact info with social links for now?

**Answer:** Functional contact form with social links.

---

**Q8:** Is there anything that should be explicitly excluded from this phase?

**Answer:** Everything discussed in the spec is included. Nothing excluded.

---

### Existing Code to Reference

**Similar Features Identified:**

- **Inspiration Portfolio:** [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio)
  - Uses `locomotive-scroll` for smooth scrolling
  - Uses `framer-motion` for animations
  - Built with Next.js + shadcn-ui + Tailwind
  - Features fluid, animated background effects
  - Sleek, modern, dark aesthetic

**Note:** Our implementation will use React (not Next.js) with React Router, but the visual style and animation approach from this portfolio serves as the design reference.

---

### Follow-up Questions

**Follow-up 1:** You mentioned you want to show me an example of the fluid background for the full-viewport hero. Please share.

**Answer:** User provided: https://github.com/wendoj/developer-portfolio — this portfolio demonstrates the fluid, animated background style desired.

---

**Follow-up 2:** For react-parallax-mouse, should this parallax effect apply to all hero variants or just the full-viewport hero? Should it include multiple parallax layers?

**Answer:** Only the **full-viewport hero** gets the parallax effect. Yes, include **multiple parallax layers** (foreground elements move faster than background).

---

**Follow-up 3:** Since we're merging Projects + Portfolio into one page, what should it be called?

**Answer:** "Portfolio"

---

## Visual Assets

### Files Provided:

No visual files provided in the visuals folder.

### Visual Reference:

- **External Reference:** [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio) — serves as the primary visual/animation inspiration for:
  - Fluid background effects
  - Smooth scroll behavior
  - Modern dark aesthetic
  - Animation patterns

---

## Requirements Summary

### Functional Requirements

#### Pages (5 total + placeholder)

| Page | Description |
|------|-------------|
| **Home** | Landing page with full-viewport hero, introduction, highlights |
| **About** | Personal info, skills, developer journey timeline section |
| **Portfolio** | Combined projects/work showcase with filters |
| **Blog** | Placeholder page (content deferred to later phase) |
| **Contact** | Functional contact form + social links |

#### Components

| Component | Description |
|-----------|-------------|
| **Navbar** | Transparent glass/blur effect, becomes solid on scroll |
| **Footer** | Standard footer with links, social icons |
| **Hero (Full-viewport)** | Full-screen with fluid animated background + react-parallax-mouse (multi-layer) |
| **Hero (Split)** | Text left, image/content right |
| **Hero (Minimal)** | Headline + subtext only |
| **Developer Timeline** | Journey/experience timeline for About page |
| **Contact Form** | Functional form wired to backend/email |

#### Technical Features

- React Router with shared layout wrapper
- Smooth scroll behavior (locomotive-scroll style)
- Framer Motion for animations
- react-parallax-mouse for full-viewport hero parallax
- Dark mode primary aesthetic
- Responsive design (mobile-first)

---

### Reusability Opportunities

- Hero component with variant prop (full | split | minimal)
- Navbar transparency/scroll behavior as reusable hook
- Animation utilities/hooks for consistent motion
- Timeline component for About page (potentially reusable for project phases later)

---

### Scope Boundaries

**In Scope:**

- 5 pages: Home, About, Portfolio, Blog (placeholder), Contact
- Transparent navbar with scroll behavior
- 3 hero component variants
- Fluid animated background for full-viewport hero
- react-parallax-mouse integration (full-viewport hero only, multi-layer)
- Developer journey timeline section on About page
- Functional contact form with social links
- Shared layout (navbar + footer)
- React Router setup
- Smooth scroll + framer-motion animations
- Dark mode primary aesthetic
- Responsive design

**Out of Scope:**

- Authentication/login (separate spec)
- Admin dashboard (separate spec)
- Blog content/CMS (this phase is placeholder only)
- Client tracking system (separate spec)
- Light/dark mode toggle (can be added later)
- Backend API setup (except contact form endpoint)

---

### Technical Considerations

**Libraries to Install:**

| Library | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `framer-motion` | Animations |
| `react-parallax-mouse` | Mouse-tracking parallax for hero |
| `locomotive-scroll` or similar | Smooth scrolling (optional, evaluate) |
| `@shadcn/ui` components | UI components |
| `tailwindcss` | Styling |

**Integration Points:**

- Contact form will need backend endpoint (Node.js/Express)
- Portfolio page will later integrate with project data from Supabase
- Navbar may later need auth state awareness

**Design Reference:**

- [wendoj/developer-portfolio](https://github.com/wendoj/developer-portfolio) for visual style and animation patterns
- Adapt from Next.js patterns to React + React Router

---

*Requirements gathered: 2025-12-29*

