# CSS and Styling

This document defines CSS and styling standards for theo.dev projects.

## Philosophy

**Visual result matters more than methodology.**

Choose the approach that produces the best visual outcome, whether that's Tailwind, CSS Modules, or custom CSS.

---

## Default: Tailwind CSS

### Why Tailwind?

- Utility-first approach
- Fast development
- Consistent design system
- Excellent developer experience
- Tree-shaking (unused styles removed)
- Great documentation

### Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [],
}
```

### Usage Examples

```tsx
// ✅ Good - Utility classes for layout
function Card({ title, children }: ICardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  )
}

// ✅ Good - Responsive classes
function Hero() {
  return (
    <div className="px-4 py-8 md:px-8 md:py-16 lg:px-16 lg:py-24">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
        Welcome
      </h1>
    </div>
  )
}

// ✅ Good - State variants
function Button({ variant = 'primary' }: IButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      Click me
    </button>
  )
}
```

### Class Organization

```tsx
// ✅ Good - Organized by category
<div className="
  // Layout
  flex items-center justify-between gap-4
  // Spacing
  p-6 m-4
  // Typography
  text-lg font-semibold
  // Colors
  bg-white text-gray-900
  // Borders & Shadows
  rounded-lg border border-gray-200 shadow-sm
  // Responsive
  md:p-8 lg:flex-row
">
  Content
</div>

// ❌ Bad - Random order, hard to read
<div className="shadow-sm text-lg md:p-8 bg-white flex p-6 border-gray-200 rounded-lg items-center">
  Content
</div>
```

---

## CSS Modules (When Needed)

### When to Use

- Tailwind doesn't achieve desired look
- Complex animations
- Highly custom styling
- Third-party component styling

### File Structure

```
Component.tsx
Component.module.css
```

### Naming Convention

**Use camelCase for class names:**

```css
/* Button.module.css */
.buttonPrimary {
  background-color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.buttonPrimary:hover {
  background-color: #2563eb;
}

.buttonDisabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css'

export function Button({ disabled = false }: IButtonProps) {
  return (
    <button
      className={`${styles.buttonPrimary} ${disabled ? styles.buttonDisabled : ''}`}
      disabled={disabled}
    >
      Click me
    </button>
  )
}
```

---

## Custom CSS (When Necessary)

### When to Use

- Neither Tailwind nor CSS Modules work
- Very specific visual requirements
- Complex animations not achievable with Tailwind

### Global Styles

```css
/* globals.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --spacing-unit: 0.25rem;
  --font-family-sans: 'Inter', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-sans);
  line-height: 1.5;
  color: #1f2937;
}
```

---

## Responsive Design

### Mobile-First Approach

```tsx
// ✅ Good - Mobile first, then tablet/desktop
<div className="
  text-base p-4        // Mobile (default)
  md:text-lg md:p-6    // Tablet
  lg:text-xl lg:p-8    // Desktop
">
  Content
</div>

// ❌ Bad - Desktop first
<div className="text-xl p-8 md:text-lg md:p-6 text-base p-4">
  Content
</div>
```

### Breakpoints

**Standard breakpoints (Tailwind defaults):**

- `sm`: 640px (small phone landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (laptop)
- `xl`: 1280px (desktop)
- `2xl`: 1536px (large desktop)

**Common usage:**

```tsx
// Mobile: 375px (default)
// Tablet: 768px (md:)
// Desktop: 1440px (lg: or xl:)

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

---

## Design Tokens

### Colors

**Define in Tailwind config:**

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        900: '#0c4a6e',
      },
      gray: {
        50: '#f9fafb',
        500: '#6b7280',
        900: '#111827',
      }
    }
  }
}
```

### Typography

```javascript
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      'xs': '0.75rem',     // 12px
      'sm': '0.875rem',    // 14px
      'base': '1rem',      // 16px
      'lg': '1.125rem',    // 18px
      'xl': '1.25rem',     // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem',    // 36px
    }
  }
}
```

### Spacing

```javascript
// tailwind.config.js
theme: {
  extend: {
    spacing: {
      '18': '4.5rem',   // 72px
      '88': '22rem',    // 352px
      '128': '32rem',   // 512px
    }
  }
}
```

---

## Animations

### Tailwind Animations

```tsx
// ✅ Good - Built-in transitions
<button className="bg-blue-500 transition-colors duration-200 hover:bg-blue-600">
  Hover me
</button>

<div className="animate-pulse">Loading...</div>

<div className="animate-spin">⟳</div>
```

### Custom Animations

```javascript
// tailwind.config.js
theme: {
  extend: {
    keyframes: {
      slideIn: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      }
    },
    animation: {
      slideIn: 'slideIn 0.3s ease-out',
      fadeIn: 'fadeIn 0.2s ease-in',
    }
  }
}

// Usage
<div className="animate-slideIn">Content</div>
```

---

## Dark Mode

### Tailwind Dark Mode

```javascript
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

```tsx
// Usage
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to dark mode
</div>
```

---

## Performance

### Purge Unused Styles

```javascript
// tailwind.config.js - Already configured by default
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Tailwind automatically purges unused styles in production
}
```

### Avoid Inline Styles

```tsx
// ❌ Bad - Inline styles
<div style={{ padding: '1rem', backgroundColor: '#3b82f6' }}>
  Content
</div>

// ✅ Good - Use classes
<div className="p-4 bg-blue-500">
  Content
</div>
```

### Extract Common Patterns

```tsx
// ✅ Good - Reusable component with styles
function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  )
}

// Usage everywhere
<Card>Content</Card>
```

---

## Accessibility

### Focus States

```tsx
// ✅ Good - Visible focus indicators
<button className="
  bg-blue-500 text-white px-4 py-2 rounded
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
  Accessible button
</button>
```

### Color Contrast

```tsx
// ✅ Good - Sufficient contrast (4.5:1 for normal text)
<p className="text-gray-900 bg-white">Readable text</p>

// ❌ Bad - Insufficient contrast
<p className="text-gray-300 bg-white">Hard to read</p>
```

### Screen Reader Only

```css
/* Utility class for screen reader only content */
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
<button>
  <span className="srOnly">Close menu</span>
  <XIcon />
</button>
```

---

## Common Patterns

### Centering Content

```tsx
// Horizontal and vertical center
<div className="flex items-center justify-center min-h-screen">
  <p>Centered content</p>
</div>

// Horizontal center only
<div className="mx-auto max-w-4xl">
  <p>Centered with max width</p>
</div>
```

### Grid Layouts

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

### Flexbox Layouts

```tsx
// Space between items
<div className="flex items-center justify-between">
  <Logo />
  <Navigation />
</div>

// Centered with gap
<div className="flex items-center gap-4">
  <Avatar />
  <UserName />
</div>
```

---

## CSS Checklist

**Before committing:**

- [ ] Follows project's CSS methodology (Tailwind default)
- [ ] Responsive on all breakpoints (mobile, tablet, desktop)
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus states visible and accessible
- [ ] No inline styles (unless absolutely necessary)
- [ ] Classes organized and readable
- [ ] Design tokens used consistently
- [ ] Animations perform well
- [ ] Dark mode support (if applicable)
- [ ] CSS modules use camelCase names

---

## Summary

**Key Principles:**
1. Tailwind CSS is the default choice
2. Use CSS Modules when Tailwind doesn't fit
3. Custom CSS only when necessary
4. Mobile-first responsive design
5. Consistent design tokens
6. Accessible focus states and contrast
7. Performance matters (purge unused CSS)
8. Visual result > methodology
