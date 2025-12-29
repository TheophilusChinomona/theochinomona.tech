# Task Breakdown: Apply Brand Guide

## Overview
Total Tasks: 3 Task Groups

## Task List

### Configuration Layer

#### Task Group 1: Theme Configuration & Color System
**Dependencies:** None

- [x] 1.0 Complete theme configuration and color system
  - [x] 1.1 Update Tailwind color configuration
    - Add Indigo color palette (300: `#A5B4FC`, 400: `#818CF8`, 500: `#6366F1`, 600: `#4F46E5`) to `tailwind.config.js`
    - Add Slate color palette (50: `#F8FAFC`, 100: `#F1F5F9`, 600: `#475569`, 900: `#0F172A`) to `tailwind.config.js`
    - Keep existing Cyan/Teal primary colors if they complement Indigo visually
    - Ensure color tokens are available for both light and dark theme usage
  - [x] 1.2 Update CSS variables for light theme
    - Update `:root` CSS variables in `src/index.css`
    - Map Primary Text: `#0F172A` (15 23 42 in RGB)
    - Map Secondary Text: `#475569` (71 85 105 in RGB)
    - Map Accent: `#6366F1` (99 102 241 in RGB)
    - Map Background: `#FFFFFF` (255 255 255 in RGB)
    - Map Focus Ring: `#A5B4FC` (165 180 252 in RGB)
    - Update muted, border, and ring variables to use brand guide colors
  - [x] 1.3 Add CSS variables for dark theme
    - Add `.dark` class CSS variables in `src/index.css`
    - Map Primary Text: `#FFFFFF` (255 255 255 in RGB)
    - Map Secondary Text: `#94A3B8` (148 163 184 in RGB)
    - Map Accent: `#6366F1` (99 102 241 in RGB) - same as light
    - Map Background: `#0F172A` (15 23 42 in RGB)
    - Ensure all CSS variables support both themes
  - [x] 1.4 Update utility classes for dual theme support
    - Update `.glass` utility class to work with both light and dark themes
    - Update `.text-gradient` utility class to use Indigo colors
    - Update `.focus-ring` utility class to use Indigo 300 (`#A5B4FC`)
    - Ensure scrollbar styles work with both themes
  - [x] 1.5 Configure shadcn/ui theme
    - Verify `components.json` baseColor setting aligns with brand guide
    - Ensure CSS variables properly map to shadcn component tokens
    - Verify shadcn components automatically use updated theme colors via CSS variables
  - [x] 1.6 Update body styles for theme support
    - Update body background color to support light theme (`#FFFFFF`)
    - Update body text color to support light theme (`#0F172A`)
    - Ensure dark mode styles are properly scoped with `.dark` class
    - Maintain font-family: Space Grotesk (no changes needed)

**Acceptance Criteria:**
- Tailwind config includes Indigo and Slate color palettes
- CSS variables defined for both light and dark themes
- Utility classes support both themes
- shadcn/ui components use brand guide colors automatically
- Body styles support theme switching

### Component Updates

#### Task Group 2: Component Color Migration
**Dependencies:** Task Group 1

- [x] 2.0 Update all components to use brand guide colors
  - [x] 2.1 Update page components
    - Update `src/pages/ContactPage.tsx`: gradient backgrounds and icon colors to use Indigo palette
    - Update `src/pages/AboutPage.tsx`: gradient backgrounds and icon colors to use Indigo palette
    - Update `src/pages/PortfolioPage.tsx`: category filter button active states to use Indigo 500/600
  - [x] 2.2 Update layout components
    - Update `src/components/Hero.tsx`: gradient overlay colors to use Indigo palette
    - Update `src/components/Navbar.tsx`: hover text colors to use Indigo 400/600
    - Update `src/components/FluidBackground.tsx`: background blur colors to use Indigo palette
  - [x] 2.3 Update feature components
    - Update `src/components/DeveloperTimeline.tsx`: timeline dot to use Indigo 500, text colors to use Indigo 400
  - [x] 2.4 Update shadcn/ui components
    - Update `src/components/ui/button.tsx`: button variant colors to use Indigo 500/600 for primary, Indigo 300 for focus
    - Update `src/components/ui/badge.tsx`: badge default variant to use Indigo 500/600
    - Verify all shadcn components automatically inherit colors from CSS variables
  - [x] 2.5 Update interactive states
    - Ensure all hover states use Indigo 600 (`#4F46E5`)
    - Update link hover colors to Indigo 600
    - Update focus rings to use Indigo 300 (`#A5B4FC`) for accessibility
    - Verify active states use appropriate Indigo shades

**Acceptance Criteria:**
- All page components use brand guide colors
- All layout components use brand guide colors
- All feature components use brand guide colors
- shadcn/ui components use brand guide colors
- Interactive states (hover, focus, active) use correct Indigo shades
- No components use old Cyan/Teal colors unless they complement Indigo

### Verification & Testing

#### Task Group 3: Visual Verification & Color Harmony
**Dependencies:** Task Groups 1-2

- [x] 3.0 Verify brand guide implementation
  - [x] 3.1 Visual verification in light mode
    - Test all pages in light mode
    - Verify text contrast meets 4.5:1 minimum ratio
    - Verify background colors match brand guide (`#FFFFFF`)
    - Verify accent colors are Indigo 500 (`#6366F1`)
    - Check focus rings are visible and use Indigo 300
  - [x] 3.2 Visual verification in dark mode
    - Test all pages in dark mode
    - Verify text contrast meets 4.5:1 minimum ratio
    - Verify background colors match brand guide (`#0F172A`)
    - Verify accent colors remain Indigo 500 (`#6366F1`)
    - Check focus rings are visible and use Indigo 300
  - [x] 3.3 Evaluate color harmony
    - Assess visual compatibility between existing Cyan/Teal and new Indigo colors
    - Determine if both palettes complement each other visually
    - Document decision: keep both or remove Cyan/Teal if they clash
  - [x] 3.4 Accessibility verification
    - Test color combinations for colorblind accessibility
    - Verify focus indicators are clearly visible
    - Ensure sufficient contrast between text and backgrounds in both themes
    - Test keyboard navigation with focus rings
  - [x] 3.5 Component consistency check
    - Verify all components consistently use brand guide colors
    - Check that no components were missed in the update
    - Ensure shadcn/ui components match brand guide styling
    - Verify utility classes work correctly across all components

**Acceptance Criteria:**
- All pages display correctly in light mode with brand guide colors
- All pages display correctly in dark mode with brand guide colors
- Color harmony between Cyan/Teal and Indigo evaluated and documented
- Accessibility requirements met (4.5:1 contrast, visible focus rings)
- All components consistently use brand guide colors
- No visual regressions or missing updates

## Execution Order

Recommended implementation sequence:
1. Configuration Layer (Task Group 1) - Foundation must be set first
2. Component Updates (Task Group 2) - Apply colors after configuration
3. Verification & Testing (Task Group 3) - Final validation

## Notes

- Font configuration (Space Grotesk) requires no changes per requirements
- Indigo-to-Purple gradient (`#6366F1` → `#9333EA`) is reserved for future use, not applied to existing components
- Existing Cyan/Teal colors should be evaluated for visual harmony with Indigo before removal

