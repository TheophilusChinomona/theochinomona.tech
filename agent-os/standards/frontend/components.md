# React Components

This document defines component standards for theo.dev React projects, updated for React 19+.

## Component Structure

**Components should follow this order:**

```typescript
import { useState, use } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

// 1. Types/Interfaces
interface IUserProfileProps {
  userId: string
  userPromise: Promise<IUser> // React 19: Pass promises directly
}

// 2. Component Definition
export function UserProfile({ userId, userPromise }: IUserProfileProps) {
  // 3. Data (Suspense-enabled)
  const user = use(userPromise) // New hook for unwrapping promises

  // 4. Hooks & Actions
  const { pending } = useFormStatus()
  
  // 5. Derived values
  // NOTE: With React Compiler, manual useMemo is rarely needed.
  // Only use useMemo for extremely expensive calculations.
  const displayName = user.name || 'Anonymous'

  // 6. JSX
  return (
    <div className="userProfile">
       <h1>{displayName}</h1>
       {/* ... */}
    </div>
  )
}
```

---

## React 19 Best Practices

### 1. Forget `useMemo` & `useCallback`
React Compiler (introduced in React 19) automatically memoizes components and values.
- **Do not** manually wrap simple calculations in `useMemo`.
- **Do not** manually wrap callbacks in `useCallback` unless specifically required by an external library.

### 2. Use Actions for Data Mutation
Replace manual `onSubmit` handlers with Server Actions or the Actions API.

```typescript
// ✅ Good - Using Actions API
function UpdateName() {
  const [state, action, isPending] = useActionState(updateNameAction, null);

  return (
    <form action={action}>
      <input name="name" />
      <button disabled={isPending}>Update</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

### 3. Optimistic UI
Use the `useOptimistic` hook for immediate feedback during async operations.

```typescript
function LikeButton({ likeCount, onLike }: { likeCount: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likeCount,
    (state, newItem) => state + 1
  );

  return (
    <button onClick={async () => {
        addOptimisticLike(1);
        await onLike();
    }}>
      Likes: {optimisticLikes}
    </button>
  );
}
```

---

## Component Size & Organization

### The Scroll Test
- ✅ **Good:** Can see entire component without scrolling.
- ⚠️ **Split:** > 300 lines.

### Shadcn/UI Specifics
- **Imports:** Always import from `@/components/ui/...`
- **Composition:** Use the "Slot" pattern (via `asChild` prop) to compose behaviors.
- **Customization:** Use Tailwind utility classes directly on components via `className`.

```typescript
// ✅ Good - Composing Shadcn components
<Button asChild variant="outline">
  <Link href="/login">Login</Link>
</Button>
```

---

## Data Fetching

### React Server Components (RSC)
Prefer fetching data in Server Components and passing promises to Client Components.

```typescript
// Server Component (page.tsx)
import { db } from '@/lib/db'

export default async function Page() {
  const data = await db.query('SELECT * FROM items')
  return <ClientList items={data} />
}
```

### Client-Side Fetching
If you must fetch on the client (and aren't using a framework like Next.js), use `use()` for promise suspension or libraries like TanStack Query.

---

## Props

### Destructuring
Always destructure props for readability.

```typescript
function Card({ title, children }: ICardProps) { ... }
```

### Defaults
Set defaults in the function signature.

```typescript
function Badge({ variant = 'default' }: IBadgeProps) { ... }
```

---

## Conditional Rendering

### Early Returns
Use early returns for loading/error states to keep the main render logic clean.

```typescript
if (!user) return <LoginPrompt />
```

---

## Summary (2025 Updates)

1. **React Compiler** handles memoization; stop writing `useMemo`.
2. **Server Components** are the default for data fetching.
3. **Actions API** replaces `useEffect` based form submissions.
4. **Shadcn/UI** is the standard component library.
5. **Bun** is the preferred runtime for tooling/scripts.