# Code Commenting

This document defines commenting standards for theo.dev projects.

## Philosophy: WHY Not WHAT

**Core Principle:** Comments should explain WHY, not WHAT.

**Why?**
- Code shows WHAT it does (if well-written)
- Comments should explain WHY it exists
- Future developers need context, not translation

---

## Good vs Bad Comments

### ❌ Bad Comments (Explain WHAT)

```typescript
// Loop through users
users.forEach(user => {
  // Set active to true
  user.active = true
})

// Get user by ID
const user = getUserById(id)

// Check if email is valid
if (!email.includes('@')) {
  return false
}
```

**Problems:**
- States the obvious
- No additional value
- Code already says this
- Adds noise, not signal

### ✅ Good Comments (Explain WHY)

```typescript
// Reset all users to active after system maintenance window
// to prevent login issues from stale session data
users.forEach(user => {
  user.active = true
})

// User data is cached for 5 minutes, so this might return stale data
// Acceptable tradeoff for performance on high-traffic pages
const user = getUserById(id)

// Basic email validation - full RFC 5322 validation would be too strict
// for our users (many valid emails would be rejected)
if (!email.includes('@')) {
  return false
}
```

**Benefits:**
- Explains rationale
- Provides context
- Helps future decisions
- Documents tradeoffs

---

## When to Add Comments

### ✅ DO Comment For:

**1. Business Logic**
```typescript
// Discount applies only to orders over $100 placed on weekends
// as per marketing campaign requirements (see ticket #1234)
if (orderTotal > 100 && isWeekend()) {
  applyDiscount()
}
```

**2. Non-Obvious Solutions**
```typescript
// Using setTimeout instead of setInterval because interval
// doesn't wait for async operations to complete, causing
// requests to pile up (discovered during load testing)
setTimeout(pollForUpdates, 5000)
```

**3. Workarounds**
```typescript
// Safari doesn't support backdrop-filter, so we fall back to
// solid background. Remove this when Safari 16+ is baseline.
// Bug report: https://bugs.webkit.org/show_bug.cgi?id=181394
if (isSafari && safariVersion < 16) {
  useOpaqueBackground()
}
```

**4. Performance Optimizations**
```typescript
// Cache expensive calculation result for 1 hour
// Recalculating on every request caused 2s page load times
// Profiling data: https://example.com/profile-report
const cachedResult = cache.get(key, calculateExpensiveValue, 3600)
```

**5. Complex Algorithms**
```typescript
// Implements Luhn algorithm for credit card validation
// https://en.wikipedia.org/wiki/Luhn_algorithm
// Required by PCI DSS compliance
function validateCardNumber(cardNumber: string): boolean {
  // Implementation...
}
```

**6. Security Considerations**
```typescript
// Hash password with bcrypt (cost factor 12)
// NEVER store plain text passwords
// Cost factor balances security vs performance based on
// OWASP recommendations for 2024
const hashedPassword = await bcrypt.hash(password, 12)
```

**7. Data Flow/Architecture**
```typescript
// This function is called from 3 places:
// 1. User registration (creates new cart)
// 2. Guest checkout (migrates guest cart to user)
// 3. Admin panel (manual cart creation for support)
// Be careful when modifying - affects multiple flows
function createUserCart(userId: string) {
  // Implementation...
}
```

---

### ❌ DON'T Comment For:

**1. Self-Explanatory Code**
```typescript
// ❌ Unnecessary
// Create a new user
const user = createUser(data)

// ✅ No comment needed - code is clear
const user = createUser(data)
```

**2. Simple CRUD Operations**
```typescript
// ❌ Unnecessary
// Get all users from database
const users = await db.users.findMany()

// ✅ No comment needed - obvious
const users = await db.users.findMany()
```

**3. Standard Patterns**
```typescript
// ❌ Unnecessary
// Use state hook to track loading state
const [isLoading, setIsLoading] = useState(false)

// ✅ No comment needed - React developers know useState
const [isLoading, setIsLoading] = useState(false)
```

---

## Comment Quality Guidelines

### Be Concise

```typescript
// ❌ Too wordy
// This function takes a user object and validates whether the email
// address that is stored in the email property of the user object
// is a valid email address format according to RFC 5322 standards
function validateEmail(user: IUser) { }

// ✅ Concise
// Validates email format per RFC 5322
function validateEmail(user: IUser) { }
```

### Keep Comments Evergreen

```typescript
// ❌ Temporary/dated comments
// TODO: Fix this later
// HACK: This is broken but works for now
// Added by John on 2024-01-15 to fix production issue

// ✅ Evergreen comments
// Using polling instead of WebSocket due to corporate firewall
// restrictions. Reconsider if infrastructure changes.
```

**Never comment:**
- Who made changes (Git history tracks this)
- When changes were made (Git history tracks this)
- Temporary states like "TODO" or "HACK" (use tracking system instead)

### Link to External Resources

```typescript
// ✅ Provide links for context
// Algorithm based on Google's PageRank
// https://en.wikipedia.org/wiki/PageRank
// Paper: http://ilpubs.stanford.edu:8090/422/

// API integration follows Stripe's webhook verification
// https://stripe.com/docs/webhooks/signatures
```

---

## Special Comment Types

### TODOs and FIXMEs

**Don't use them in committed code.**

**Instead:**
- Create a ticket in your tracking system
- Reference the ticket in code

```typescript
// ❌ Don't do this
// TODO: Add error handling
// FIXME: This breaks on edge case
// HACK: Temporary solution

// ✅ Do this
// Known limitation: No error handling for network failures
// Tracked in issue #1234
```

---

## Function/Method Documentation

### When to Document Functions

**Document when:**
- Public API functions
- Complex logic not obvious from code
- Functions with non-obvious side effects

**Don't document when:**
- Function is self-explanatory
- Internal simple helpers

### Documentation Format

**TypeScript/JavaScript (JSDoc):**

```typescript
/**
 * Calculates compound interest over time
 *
 * Uses daily compounding formula: A = P(1 + r/n)^(nt)
 * where P = principal, r = rate, n = compounds/year, t = years
 *
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param years - Number of years to calculate
 * @returns Final amount including principal and interest
 *
 * @example
 * calculateCompoundInterest(1000, 0.05, 10) // Returns 1647.01
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number
): number {
  // Implementation...
}
```

**Python (Docstrings):**

```python
def calculate_compound_interest(principal: float, rate: float, years: int) -> float:
    """Calculate compound interest over time.

    Uses daily compounding formula: A = P(1 + r/n)^(nt)

    Args:
        principal: Initial investment amount
        rate: Annual interest rate (as decimal, e.g., 0.05 for 5%)
        years: Number of years to calculate

    Returns:
        Final amount including principal and interest

    Example:
        >>> calculate_compound_interest(1000, 0.05, 10)
        1647.01
    """
    # Implementation...
```

**.NET (XML Documentation):**

```csharp
/// <summary>
/// Calculates compound interest over time
/// </summary>
/// <param name="principal">Initial investment amount</param>
/// <param name="rate">Annual interest rate (as decimal)</param>
/// <param name="years">Number of years to calculate</param>
/// <returns>Final amount including principal and interest</returns>
/// <remarks>
/// Uses daily compounding formula: A = P(1 + r/n)^(nt)
/// </remarks>
public decimal CalculateCompoundInterest(decimal principal, decimal rate, int years)
{
    // Implementation...
}
```

---

## Code Review: Comment Checklist

**When reviewing code, check:**

- [ ] Comments explain WHY, not WHAT
- [ ] No obvious comments (remove noise)
- [ ] Complex logic has explanatory comments
- [ ] Workarounds are documented with reasons
- [ ] Performance optimizations are explained
- [ ] No TODO/FIXME in committed code (use tracking system)
- [ ] No dated comments (who/when)
- [ ] External links provided where helpful
- [ ] Comments are concise and clear

---

## Self-Documenting Code First

**Best comment is no comment.**

Write code so clear it doesn't need comments:

```typescript
// ❌ Needs comment because code is unclear
// Check if user is authorized admin
if (u.r === 'a' && u.s === 1) { }

// ✅ No comment needed - code is self-documenting
if (user.role === 'admin' && user.status === UserStatus.Active) { }
```

**Priority:**
1. Write clear, self-documenting code
2. Add comments for WHY when needed
3. Never add comments for WHAT (refactor code instead)

---

## Summary

**Golden Rules:**
1. Comment WHY, not WHAT
2. Code should explain itself
3. Comments add context, not translation
4. Keep comments evergreen
5. Self-documenting code > comments
6. When in doubt, explain the business reason
