---
description: Guidelines for using and creating shadcn/ui components to prevent missing import errors
globs: src/components/**/*.tsx
alwaysApply: true
---
# shadcn/ui Components Guide

This rule prevents import errors when using shadcn/ui components by ensuring components exist before importing them and providing patterns for creating missing components.

## Problem

Importing shadcn/ui components that don't exist causes build errors:

```
Failed to resolve import "@/components/ui/alert" from "src/components/admin/RefundForm.tsx". 
Does the file exist?
```

## Before Importing a Component

**ALWAYS verify the component exists before importing:**

1. Check if the component file exists in `src/components/ui/`
2. Verify the component exports match your import statement
3. If missing, create the component following the project's pattern

### Verification Checklist

```typescript
// ❌ Bad: Importing without checking if component exists
import { Alert, AlertDescription } from '@/components/ui/alert'
// Error: File doesn't exist!

// ✅ Good: Verify component exists first
// 1. Check src/components/ui/alert.tsx exists
// 2. Verify exports match: Alert, AlertDescription
// 3. Then import
import { Alert, AlertDescription } from '@/components/ui/alert'
```

## Component Location

All shadcn/ui components are located in:

```
src/components/ui/
```

### Existing Components

Common components that exist:
- `button.tsx`
- `card.tsx`
- `dialog.tsx`
- `input.tsx`
- `label.tsx`
- `select.tsx`
- `textarea.tsx`
- `alert.tsx` (created to fix import error)

**Always check this directory before importing a new component.**

## Creating Missing Components

When a component is missing, create it following this pattern:

### 1. Component Structure Pattern

All shadcn/ui components follow this structure:

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Define variants using cva
const componentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        destructive: 'destructive-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Main component with forwardRef
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof componentVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(componentVariants({ variant }), className)}
    {...props}
  />
))
Component.displayName = 'Component'

// Sub-components if needed
const ComponentSub = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('sub-classes', className)} {...props} />
))
ComponentSub.displayName = 'ComponentSub'

export { Component, ComponentSub }
```

### 2. Reference Implementation

See `src/components/ui/alert.tsx` for a complete example:
- Uses `cva` for variants
- Follows dark theme styling (zinc colors)
- Includes proper TypeScript types
- Uses `forwardRef` for ref forwarding
- Sets `displayName` for debugging

### 3. Styling Guidelines

Match the project's dark theme:

```typescript
// ✅ Good: Dark theme colors
variant: {
  default: 'bg-zinc-900 text-zinc-100 border-zinc-800',
  destructive: 'border-red-500/50 text-red-500',
}

// ❌ Bad: Light theme colors
variant: {
  default: 'bg-white text-black',
}
```

### 4. Component Checklist

When creating a new component:

- [ ] File placed in `src/components/ui/`
- [ ] Filename uses kebab-case: `component-name.tsx`
- [ ] Uses `cva` for variant management
- [ ] Uses `cn()` utility for className merging
- [ ] Uses `forwardRef` for ref forwarding
- [ ] Sets `displayName` on all components
- [ ] Follows dark theme color scheme
- [ ] Exports all sub-components
- [ ] Matches shadcn/ui API patterns

## Common Component Patterns

### Alert Component

```typescript
// ✅ Good: Alert with icon and description
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

<Alert>
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>
```

### Button Component

```typescript
// ✅ Good: Button with variants
import { Button } from '@/components/ui/button'

<Button variant="default">Submit</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

## Error Prevention Workflow

When you encounter an import error:

1. **Check if component exists:**
   ```bash
   ls src/components/ui/component-name.tsx
   ```

2. **If missing, create it:**
   - Reference shadcn/ui documentation
   - Follow the pattern in `src/components/ui/alert.tsx`
   - Use `cva` for variants
   - Match dark theme styling

3. **Verify imports match exports:**
   ```typescript
   // Check what's exported
   export { Component, ComponentSub }
   
   // Import matches
   import { Component, ComponentSub } from '@/components/ui/component'
   ```

## Using shadcn CLI (Optional)

You can also use the shadcn CLI to add components:

```bash
npx shadcn@latest add alert
```

**However**, you must customize the generated component to match the project's:
- Dark theme colors (zinc palette)
- Styling patterns
- TypeScript conventions

## Related Files

- `src/components/ui/button.tsx` - Example with variants
- `src/components/ui/card.tsx` - Example with sub-components
- `src/components/ui/alert.tsx` - Complete reference implementation
- `src/lib/utils.ts` - `cn()` utility function

## Quick Reference

| Action | Command/Check |
|--------|--------------|
| Check if component exists | `ls src/components/ui/component-name.tsx` |
| List all UI components | `ls src/components/ui/` |
| Create component | Follow pattern in `src/components/ui/alert.tsx` |
| Verify exports | Check `export` statement in component file |

---

*Last Updated: January 2025*
