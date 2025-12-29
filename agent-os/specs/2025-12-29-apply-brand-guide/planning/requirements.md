# Spec Requirements: Apply Brand Guide

## Initial Description
i want my app to use the colors and fonts in @agent-os/product/brand-guide.md

## Requirements Discussion

### First Round Questions

**Q1:** Scope: Should this apply across the entire application (all pages, components, and UI elements), or are there specific sections/pages to prioritize first?
**Answer:** All pages, all components

**Q2:** Color Migration: I see the app currently uses Cyan/Teal (`#06b6d4`) as the primary color. Should we replace this with Indigo 500 (`#6366F1`) from the brand guide, or keep both palettes for different contexts?
**Answer:** If you think they will look good together keep both

**Q3:** Theme System: The brand guide mentions a light primary theme with optional dark UI elements. Should we: Convert the current dark theme to a light theme as the primary? Support both light and dark modes? Use dark elements only for specific components (code blocks, cards, navigation)?
**Answer:** Support both light and dark modes

**Q4:** shadcn/ui Components: Since you're using shadcn/ui, should we update the shadcn theme configuration to use the brand guide colors, or handle this through Tailwind config overrides?
**Answer:** Config the shadcn theme

**Q5:** Font Implementation: The brand guide suggests Inter, Poppins, Space Grotesk, or Work Sans for body text. You currently use Space Grotesk. Should we: Keep Space Grotesk as the primary font? Switch to Inter (as suggested in the guide)? Add Poppins or Work Sans as alternatives?
**Answer:** Keep the current primary font

**Q6:** Gradient Usage: The brand guide includes an Indigo-to-Purple gradient (`#6366F1` → `#9333EA`) for hero sections. Should we apply this to existing hero components, or reserve it for new implementations?
**Answer:** Reserve it

**Q7:** CSS Variables: I see you have CSS variables in `src/index.css` for theming. Should we update these variables to match the brand guide colors, or handle everything through Tailwind config?
**Answer:** Update

**Q8:** Exclusions: Are there any existing components, pages, or design elements that should NOT be updated to match the brand guide? For example, should we preserve any current styling for specific features?
**Answer:** No exclusions

### Existing Code to Reference

**Similar Features Identified:**
- shadcn/ui configuration: `components.json` - Currently configured with baseColor: "zinc" and cssVariables: true
- Tailwind configuration: `tailwind.config.js` - Contains current color palette (Cyan/Teal primary) and font configuration
- CSS variables: `src/index.css` - Contains CSS variables for theming that need to be updated
- Related spec: `agent-os/specs/2025-12-29-multipage-shell-design-system` - May have similar design system patterns to reference

### Follow-up Questions
No follow-up questions needed.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Requirements Summary

### Functional Requirements
- Apply brand guide colors and fonts across all pages and components
- Support both light and dark modes
- Update shadcn/ui theme configuration to use brand guide colors
- Update Tailwind config to include brand guide color palette (Indigo colors)
- Keep existing Cyan/Teal primary colors if they complement the Indigo palette
- Update CSS variables in `src/index.css` to match brand guide colors
- Keep Space Grotesk as the primary font (already aligned with brand guide)
- Reserve Indigo-to-Purple gradient for future hero implementations

### Reusability Opportunities
- Reference existing shadcn/ui configuration in `components.json` for theme updates
- Reference existing Tailwind config structure in `tailwind.config.js` for color palette additions
- Reference CSS variables structure in `src/index.css` for variable updates
- Consider patterns from multipage shell design system spec for consistent implementation

### Scope Boundaries
**In Scope:**
- All pages and components styling updates
- Tailwind config updates (colors, potentially fonts)
- shadcn/ui theme configuration updates
- CSS variables updates in `src/index.css`
- Light and dark mode support with brand guide colors
- Integration of Indigo color palette alongside existing Cyan/Teal palette (if they work well together)

**Out of Scope:**
- Changing primary font from Space Grotesk
- Applying gradient to existing hero components (reserved for future)
- Excluding any components from the update

### Technical Considerations
- shadcn/ui uses CSS variables (cssVariables: true in components.json), so updates to CSS variables will automatically affect shadcn components
- Tailwind config needs to be extended with Indigo color palette from brand guide
- Need to evaluate color harmony between existing Cyan/Teal and new Indigo colors
- Dark mode support requires careful color mapping for both light and dark themes
- Brand guide specifies specific color roles (Primary Text, Secondary Text, Accent, Background) that need to be mapped to both themes
- Current implementation uses `darkMode: 'class'` in Tailwind config, which supports the dual theme requirement

