# Specification: Apply Brand Guide

## Goal
Apply brand guide colors (Indigo palette) and fonts across all pages and components, supporting both light and dark modes while maintaining existing Space Grotesk font and preserving Cyan/Teal colors if they complement the new palette.

## User Stories
- As a user, I want to experience a consistent brand identity across all pages so that the application feels cohesive and professional
- As a developer, I want brand colors and fonts configured systematically so that new components automatically use the correct styling

## Specific Requirements

**Update Tailwind Color Configuration**
- Add Indigo color palette (300, 400, 500, 600) to `tailwind.config.js` using brand guide hex values
- Keep existing Cyan/Teal primary colors if they harmonize with Indigo palette
- Add Slate color palette (50, 100, 600, 900) for text and backgrounds per brand guide
- Ensure color tokens are available for both light and dark theme usage

**Update CSS Variables for Theme Support**
- Update `:root` CSS variables in `src/index.css` to use brand guide colors for light theme
- Add `.dark` class CSS variables for dark theme using brand guide dark theme color roles
- Map Primary Text: `#0F172A` (light) / `#FFFFFF` (dark)
- Map Secondary Text: `#475569` (light) / `#94A3B8` (dark)
- Map Accent: `#6366F1` (Indigo 500) for both themes
- Map Background: `#FFFFFF` (light) / `#0F172A` (dark)
- Update focus ring color to `#A5B4FC` (Indigo 300) for accessibility

**Configure shadcn/ui Theme**
- Update `components.json` baseColor if needed to align with brand guide
- Ensure CSS variables in `src/index.css` properly map to shadcn component tokens
- Verify shadcn components automatically use updated theme colors via CSS variables

**Update Component Color Usage**
- Review and update components using `primary-*` Tailwind classes to use appropriate brand guide colors
- Update components: ContactPage, AboutPage, PortfolioPage, DeveloperTimeline, FluidBackground, Hero, Navbar, Button, Badge
- Ensure hover states use Indigo 600 (`#4F46E5`) for interactive elements
- Update link hover colors to Indigo 600
- Update focus rings to use Indigo 300 (`#A5B4FC`)

**Implement Light and Dark Mode Support**
- Ensure `darkMode: 'class'` configuration in Tailwind supports theme switching
- Update body background and text colors to support both themes
- Update scrollbar styles to work with both light and dark themes
- Ensure all custom utility classes (`.glass`, `.text-gradient`, `.focus-ring`) support both themes

**Preserve Font Configuration**
- Keep Space Grotesk as primary font (already aligned with brand guide)
- Maintain JetBrains Mono for code blocks (already aligned with brand guide)
- No font changes required per requirements

**Reserve Gradient for Future Use**
- Document Indigo-to-Purple gradient (`#6366F1` → `#9333EA`) in brand guide reference
- Do not apply gradient to existing hero components
- Gradient reserved for future high-impact implementations

**Verify Color Harmony**
- Evaluate visual compatibility between existing Cyan/Teal and new Indigo colors
- Keep both palettes if they complement each other visually
- Ensure sufficient contrast ratios (minimum 4.5:1) for accessibility

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**`tailwind.config.js`**
- Extend existing color configuration structure to add Indigo and Slate palettes
- Maintain existing animation and keyframe configurations
- Preserve fontFamily configuration (Space Grotesk, JetBrains Mono)

**`src/index.css`**
- Update existing CSS variable structure to map brand guide colors
- Extend `:root` and add `.dark` class variables for dual theme support
- Preserve existing utility classes (`.glass`, `.container-custom`, `.focus-ring`, `.text-gradient`)
- Update utility classes to support both light and dark themes

**`components.json`**
- Reference existing shadcn configuration structure
- Maintain cssVariables: true setting to enable automatic theme updates
- Keep existing component aliases and paths

**Components using primary colors**
- Update `src/pages/ContactPage.tsx` - gradient backgrounds and icon colors
- Update `src/pages/AboutPage.tsx` - gradient backgrounds and icon colors
- Update `src/pages/PortfolioPage.tsx` - category filter button active states
- Update `src/components/DeveloperTimeline.tsx` - timeline dot and text colors
- Update `src/components/FluidBackground.tsx` - background blur colors
- Update `src/components/Hero.tsx` - gradient overlay colors
- Update `src/components/Navbar.tsx` - hover text colors
- Update `src/components/ui/button.tsx` - button variant colors
- Update `src/components/ui/badge.tsx` - badge default variant colors

## Out of Scope
- Changing primary font from Space Grotesk to Inter or other alternatives
- Applying Indigo-to-Purple gradient to existing hero components
- Removing or replacing existing Cyan/Teal color palette (if it complements Indigo)
- Creating new theme switching UI components or controls
- Updating component structure or functionality beyond color/font changes
- Modifying animation or keyframe definitions
- Adding new utility classes beyond what exists
- Creating new shadcn components
- Updating logo assets or logo usage rules
- Implementing gradient backgrounds in existing components

