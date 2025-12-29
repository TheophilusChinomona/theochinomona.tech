# Coding Style

This document defines coding style standards across all theo.dev projects.

## Code Quality Tools

### TypeScript/JavaScript

**ESLint**
- **Required:** Yes
- **Configuration:** ESLint recommended config
- **Why:** Catches common bugs and enforces consistent patterns

**Prettier**
- **Required:** Yes
- **Purpose:** Auto-formatting for consistent code style
- **Why:** Ends all formatting debates, saves time in code review

**TypeScript Strict Mode**
- **Required:** Always enabled (`strict: true` in tsconfig.json)
- **Why:** Catches type errors early, better IDE support

### .NET

**.editorconfig**
- **Required:** Yes
- **Purpose:** Consistent formatting across team

**Built-in Analyzers**
- **Required:** Enable .NET's built-in code analysis
- **External tools:** StyleCop/SonarAnalyzer only if client/enterprise requirements

### Python

**Ruff**
- **Required:** Yes
- **Replaces:** Black + Flake8 + isort
- **Why:** Modern, 10-100x faster, one tool for everything

**mypy**
- **Optional:** Only for projects where type safety is critical

---

## Pre-commit Hooks

**Required:** Yes, but lightweight

**What runs:**
- ✅ Linting only (not full tests - too slow)
- ✅ Auto-fix formatting issues when possible
- ✅ Type checking

**Tools:**
- **Husky + lint-staged** (Bun projects)
- **pre-commit framework** (Python projects)

**Allow bypass:**
- `--no-verify` flag available for emergencies
- Real enforcement happens in CI/CD

---

## Naming Conventions

### Files

**React Components:**
- Format: `PascalCase.tsx`
- Examples: `Button.tsx`, `UserProfile.tsx`, `DashboardCard.tsx`

**Utilities/Services:**
- Format: `camelCase.ts`
- Examples: `authService.ts`, `dateHelpers.ts`, `apiClient.ts`

**Types/Interfaces:**
- Format: `types.ts` or `PascalCase.types.ts`
- Examples: `types.ts`, `User.types.ts`, `Api.types.ts`

### Code

**Components:**
- Format: `PascalCase`
- Examples: `Button`, `UserProfile`, `DashboardCard`

**Functions:**
- Format: `camelCase`
- Examples: `getUserById`, `formatDate`, `calculateTotal`

**Constants:**
- Format: `camelCase` (NOT UPPER_SNAKE_CASE)
- Examples: `maxRetries`, `defaultTimeout`, `apiBaseUrl`
- **Why:** Modern convention, easier to read

**Interfaces:**
- Format: `IPascalCase` (with `I` prefix)
- Examples: `IUser`, `IApiResponse`, `IButtonProps`

**Types:**
- Format: `PascalCase` (no prefix)
- Examples: `User`, `ApiResponse`, `ButtonProps`

**Private variables/methods:**
- Format: `regular` (NO underscore prefix)
- Examples: `validateInput()`, `tempData`
- **Why:** Modern convention, TypeScript has `private` keyword

### CSS/Styling

**Class names:**
- Format: `camelCase`
- Examples: `buttonPrimary`, `cardHeader`, `userAvatar`

**CSS Modules:**
- Format: `PascalCase.module.css`
- Examples: `Button.module.css`, `Card.module.css`

### Database/API

**Database fields:**
- Format: `camelCase`
- Examples: `userId`, `createdAt`, `emailAddress`

**API endpoints:**
- Format: `/api/camelCase`
- Examples: `/api/userProfile`, `/api/projectTasks`

**JSON keys:**
- Format: `camelCase`
- Examples: `{ userId: 123, firstName: "John" }`

---

## Code Structure

### Top-Down Readability

**Philosophy:** Code should read like a story from top to bottom

**Recommended order:**

```typescript
// 1. Imports (organized)
import { useState, useEffect } from 'react'
import { Button } from '@/components/Button'
import { formatDate } from '@/utils/dateHelpers'

// 2. Types/Interfaces
interface IMyComponentProps {
  title: string
  onSave: () => void
}

// 3. Component/Function Definition
export function MyComponent({ title, onSave }: IMyComponentProps) {
  // 4. State
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<IData[]>([])

  // 5. Hooks
  const { user } = useAuth()

  // 6. Derived values
  const isEmpty = data.length === 0

  // 7. Event handlers
  const handleSubmit = async () => {
    // Logic here
  }

  // 8. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 9. Early returns
  if (isLoading) return <Spinner />

  // 10. Main JSX
  return <div>{/* UI */}</div>
}

// 11. Helper functions (if small)
function helperFunction() {
  // Small helpers can live here
}
```

**Why this order?**
- Easy to find things (state always at top)
- Read like a narrative
- See data flow before usage
- Easy for code review

---

## Function and Component Size

### The Scroll Test

**Rule of thumb:**
- ✅ **Good:** Can see entire component/function without scrolling
- ⚠️ **Consider splitting:** Need to scroll to see return statement
- 🚨 **Definitely split:** > 300 lines

### When to Extract

**Extract to new component/function when:**
1. Repeated code (DRY principle)
2. Complex section makes parent hard to read
3. Different responsibility
4. Natural boundaries emerge

**Example:**

```typescript
// ❌ Too large, hard to understand
function Dashboard() {
  // 50 lines of logic...
  return (
    <div>
      {/* 100 lines of profile JSX */}
      {/* 100 lines of stats JSX */}
      {/* 100 lines of activity JSX */}
    </div>
  )
}

// ✅ Clean, easy to understand
function Dashboard() {
  // Logic
  return (
    <div>
      <UserProfile user={user} />
      <StatsCards data={stats} />
      <RecentActivity items={activities} />
    </div>
  )
}
```

---

## Props Handling

**Always destructure props immediately:**

```typescript
// ✅ Good - Immediately see what props are used
function Button({ label, onClick, disabled = false }: IButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ Avoid - Have to read entire component to know props
function Button(props: IButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>
}
```

**Why?**
- See all props at a glance
- Easier to spot missing props
- Less typing
- TypeScript autocomplete works better

---

## Code Organization Principles

### DRY (Don't Repeat Yourself)

**Extract common logic:**
- Same code in 3+ places → Extract to function/component
- Same code in 2 places → Consider extracting
- One place → Keep it inline

### Single Responsibility

**Each function/component should have ONE clear purpose:**

```typescript
// ❌ Too many responsibilities
function UserDashboard() {
  // Fetches user data
  // Handles authentication
  // Renders 5 different sections
  // Manages form state
  // Handles file uploads
}

// ✅ Single responsibility
function UserDashboard() {
  return (
    <AuthGuard>
      <UserDataProvider>
        <ProfileSection />
        <ActivitySection />
        <SettingsSection />
      </UserDataProvider>
    </AuthGuard>
  )
}
```

### Meaningful Names

**Choose names that reveal intent:**

```typescript
// ❌ Unclear
const d = new Date()
const arr = getData()
function process(x) { }

// ✅ Clear
const currentDate = new Date()
const userList = getUserData()
function validateEmailFormat(email: string) { }
```

### Remove Dead Code

**Delete, don't comment out:**

```typescript
// ❌ Don't do this
// const oldFunction = () => { }
// function unused() { }

// ✅ Just delete it
// Git history preserves old code if needed
```

---

## Formatting Consistency

### Let Tools Handle It

- **Don't manually format** - let Prettier do it
- **Don't argue about style** - accept Prettier defaults
- **Configure once** - `.prettierrc` in project root

### Indentation

- **TypeScript/JavaScript:** 2 spaces (Prettier default)
- **Python:** 4 spaces (PEP 8)
- **.NET:** 4 spaces (convention)

**No tabs** - spaces only for consistency across editors

---

## Import Organization

**Order imports logically:**

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal absolute imports
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// 3. Relative imports
import { formatDate } from './utils'
import { IUserData } from './types'

// 4. CSS/Assets
import styles from './Component.module.css'
import logo from './logo.svg'
```

**Let tools handle it:**
- ESLint can auto-sort imports
- Prettier maintains consistency

---

## Backward Compatibility

**Default: No backward compatibility code**

- Don't add compatibility shims unless required
- Don't keep old code "just in case"
- Don't rename unused variables with `_` prefix

**When explicitly needed:**
- Client requires it
- Public API versioning
- Migration period defined

---

## Summary

**Automated > Manual:**
- Use tools (ESLint, Prettier, Ruff) to enforce style
- Focus on logic, not formatting
- Pre-commit hooks catch issues early

**Readability > Cleverness:**
- Clear code > short code
- Simple > complex
- Obvious > clever tricks

**Consistency > Personal Preference:**
- Follow team standards
- Accept tool defaults
- Discuss standards as team, then follow them
