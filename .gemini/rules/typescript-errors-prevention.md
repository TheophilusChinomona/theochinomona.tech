---
description: Prevent common TypeScript build errors in React + Zod + React Hook Form codebase
globs: src/**/*.{ts,tsx}
alwaysApply: true
---
# TypeScript Errors Prevention Guide

This rule helps prevent common TypeScript compilation errors that occur in this codebase, particularly with React Hook Form, Zod validation, and type definitions.

## Common Error Categories

### 1. Zod Enum Schema Errors

**Problem**: `z.enum()` does not accept `required_error` in the options object in newer Zod versions.

```typescript
// ❌ Bad: This causes TS2769 error
category: z.enum(['Web', 'Mobile', 'Full-Stack', 'Design'], {
  required_error: 'Category is required',
})

// ✅ Good: Use `.refine()` or separate validation
category: z.enum(['Web', 'Mobile', 'Full-Stack', 'Design'], {
  errorMap: () => ({ message: 'Category is required' }),
})

// ✅ Better: Use `.min()` on the enum or validate separately
category: z.enum(['Web', 'Mobile', 'Full-Stack', 'Design']).refine(
  (val) => val !== undefined,
  { message: 'Category is required' }
)
```

### 2. React Hook Form Type Safety

**Problem**: Type mismatches between Zod schemas and React Hook Form types, especially with `z.coerce.number()`.

```typescript
// ❌ Bad: z.coerce.number() can cause type issues
completion_percentage: z.coerce.number().min(0).max(100).optional(),

// ✅ Good: Use z.number() with proper defaults
completion_percentage: z.number().min(0).max(100).optional().default(0),

// ✅ Better: Transform string inputs to numbers in the form
completion_percentage: z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : Number(val)),
  z.number().min(0).max(100).optional()
),
```

**Problem**: Form submit handler type mismatches.

```typescript
// ❌ Bad: Missing explicit type parameter
const form = useForm({
  resolver: zodResolver(schema),
})

// ✅ Good: Always provide explicit type
type FormData = z.infer<typeof schema>
const form = useForm<FormData>({
  resolver: zodResolver(schema),
})

// ✅ Good: Properly typed submit handler
const onSubmit = async (data: FormData) => {
  // Handle submission
}

<form onSubmit={handleSubmit(onSubmit)}>
```

### 3. Unused Imports and Variables

**Problem**: TypeScript strict mode flags unused declarations.

```typescript
// ❌ Bad: Unused imports
import { Upload, X, FileImage } from 'lucide-react'
// Only using FileImage

// ✅ Good: Remove unused imports immediately
import { FileImage } from 'lucide-react'

// ❌ Bad: Unused variables
const { user, refreshUser } = useAuth()
// refreshUser is never used

// ✅ Good: Only destructure what you need
const { user } = useAuth()

// ✅ Good: Prefix with underscore if intentionally unused
const _unusedVariable = someValue
```

### 4. Project Type Mock Data

**Problem**: Test mocks missing required `Project` properties.

```typescript
// ❌ Bad: Missing required properties
const mockProject: Project = {
  id: '123',
  title: 'Test',
  description: 'Test description',
  tech: ['React'],
  category: 'Web',
  // Missing: client_id, notifications_enabled
}

// ✅ Good: Include all required properties from Project interface
const mockProject: Project = {
  id: '123',
  title: 'Test',
  description: 'Test description',
  tech: ['React'],
  category: 'Web',
  thumbnail: null,
  client_name: null,
  client_id: null, // Required property
  project_url: null,
  github_url: null,
  completion_date: null,
  featured: false,
  status: 'draft',
  notifications_enabled: true, // Required property
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}
```

**Reference**: Check [src/lib/db/projects.ts](src/lib/db/projects.ts) for the complete `Project` interface.

### 5. Lucide Icon Props

**Problem**: Lucide icons don't accept `title` prop directly.

```typescript
// ❌ Bad: title prop doesn't exist on Lucide icons
<Bell className="h-4 w-4" title="Notifications enabled" />

// ✅ Good: Use aria-label for accessibility
<Bell className="h-4 w-4" aria-label="Notifications enabled" />

// ✅ Good: Wrap in a tooltip or span with title
<span title="Notifications enabled">
  <Bell className="h-4 w-4" />
</span>
```

### 6. JSX Namespace Issues

**Problem**: `JSX.Element` namespace not available without proper React import.

```typescript
// ❌ Bad: JSX namespace not found
function renderContent(content: string): JSX.Element {
  const elements: JSX.Element[] = []
}

// ✅ Good: Use React.ReactElement or React.JSX.Element
import React from 'react'

function renderContent(content: string): React.ReactElement {
  const elements: React.ReactElement[] = []
}

// ✅ Better: Use ReactNode for more flexibility
import { ReactNode } from 'react'

function renderContent(content: string): ReactNode {
  // ...
}
```

### 7. Null vs Undefined Type Mismatches

**Problem**: Type mismatches between `null` and `undefined`.

```typescript
// ❌ Bad: Passing null where undefined is expected
function updateGroup(id: string, data: { description?: string }) {
  // ...
}

updateGroup(id, { description: null }) // Error: null not assignable to string | undefined

// ✅ Good: Convert null to undefined
updateGroup(id, { description: data.description ?? undefined })

// ✅ Good: Use nullish coalescing in function calls
updateGroup(id, { 
  description: data.description === null ? undefined : data.description 
})
```

### 8. Array Access Without Null Checks

**Problem**: Accessing array elements without checking if they exist.

```typescript
// ❌ Bad: Possible undefined access
const firstItem = array[0]
expect(firstItem.property).toBe('value')

// ✅ Good: Add null checks or use optional chaining
const firstItem = array[0]
expect(firstItem?.property).toBe('value')

// ✅ Good: Assert non-null if you're certain
const firstItem = array[0]!
expect(firstItem.property).toBe('value')

// ✅ Good: Use array methods that handle undefined
const firstItem = array.at(0)
if (firstItem) {
  expect(firstItem.property).toBe('value')
}
```

### 9. Type Assertions and Unsafe Conversions

**Problem**: Unsafe type assertions that TypeScript flags.

```typescript
// ❌ Bad: Direct unsafe assertion
.map((m) => (m as { user_id: string; users: User }).users)

// ✅ Good: Use 'unknown' as intermediate type
.map((m) => (m as unknown as { user_id: string; users: User }).users)

// ✅ Better: Properly type the source data
interface MemberWithUser {
  user_id: string
  users: User
}
.map((m): User => (m as MemberWithUser).users)
```

### 10. React Hook Form Field Arrays

**Problem**: Type errors with `useFieldArray` when form type doesn't match.

```typescript
// ❌ Bad: Type mismatch in field array
const { fields, append } = useFieldArray({
  control: form.control,
  name: 'tech', // Error if 'tech' type doesn't match
})

// ✅ Good: Ensure form schema includes array field
const schema = z.object({
  tech: z.array(z.string()),
  // ... other fields
})

type FormData = z.infer<typeof schema>
const form = useForm<FormData>({
  resolver: zodResolver(schema),
})

const { fields, append } = useFieldArray({
  control: form.control,
  name: 'tech', // Now properly typed
})
```

### 11. Optional Chaining with Unknown Types

**Problem**: Accessing properties on `unknown` types without proper type guards.

```typescript
// ❌ Bad: Direct access to unknown type
{activity.event_data?.description && (
  <p>{activity.event_data.description}</p>
)}

// ✅ Good: Type guard or assertion
{activity.event_data && 
  typeof activity.event_data === 'object' &&
  'description' in activity.event_data &&
  typeof activity.event_data.description === 'string' && (
    <p>{activity.event_data.description}</p>
  )
}

// ✅ Better: Define proper types
interface ActivityEventData {
  description?: string
  // ... other fields
}

const eventData = activity.event_data as ActivityEventData | undefined
{eventData?.description && (
  <p>{eventData.description}</p>
)}
```

## Checklist Before Committing

Before committing code, ensure:

- [ ] No unused imports (remove immediately)
- [ ] No unused variables (remove or prefix with `_`)
- [ ] All Zod enums use correct syntax (no `required_error` in options)
- [ ] All React Hook Form instances have explicit type parameters
- [ ] All test mocks include all required properties from interfaces
- [ ] All Lucide icons use `aria-label` instead of `title` prop
- [ ] All array accesses have null checks or use optional chaining
- [ ] All `null` values converted to `undefined` where needed
- [ ] All type assertions use `unknown` as intermediate type if needed
- [ ] All form schemas match their corresponding TypeScript types

## Quick Reference

| Error Type | Solution |
|------------|----------|
| `TS2769: No overload matches z.enum()` | Remove `required_error` from enum options |
| `TS2322: Type 'Resolver<...>' is not assignable` | Fix Zod schema types, avoid `z.coerce` |
| `TS6133: 'X' is declared but never used` | Remove unused imports/variables |
| `TS2739: Type '...' is missing properties` | Add all required properties to mocks |
| `TS2322: Property 'title' does not exist` | Use `aria-label` on Lucide icons |
| `TS2503: Cannot find namespace 'JSX'` | Use `React.ReactElement` or `ReactNode` |
| `TS2345: null not assignable to undefined` | Convert `null` to `undefined` |
| `TS2532: Object is possibly 'undefined'` | Add null checks or optional chaining |

---

*Last Updated: January 2025*
