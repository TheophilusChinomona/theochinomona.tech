# Error Handling

This document defines error handling standards for theo.dev projects.

## Philosophy

**Errors should be:**
- Predictable and consistent
- Easy to debug
- Informative for developers
- Safe for end users (no sensitive data leaks)
- Properly logged for monitoring

---

## Error Types

### Custom Error Classes

**Create domain-specific error classes:**

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }
}

// Domain-specific errors
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message, false) // Not operational
  }
}
```

**Why custom classes?**
- Type-safe error handling
- Consistent error structure
- Easy to identify error types
- Better debugging
- Cleaner code (no magic status codes)

---

## API Error Responses

### Standardized Format

**All API errors follow this structure:**

```typescript
interface IErrorResponse {
  success: false
  error: {
    message: string      // User-friendly message
    code?: string       // Error code for client handling
    details?: unknown   // Additional error details (validation errors, etc.)
  }
}
```

**Examples:**

```typescript
// Validation error
{
  success: false,
  error: {
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    details: {
      email: "Invalid email format",
      password: "Password must be at least 8 characters"
    }
  }
}

// Authentication error
{
  success: false,
  error: {
    message: "Authentication required",
    code: "UNAUTHORIZED"
  }
}

// Not found error
{
  success: false,
  error: {
    message: "User not found",
    code: "NOT_FOUND"
  }
}

// Internal server error
{
  success: false,
  error: {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR"
  }
}
```

### Success Responses

**All successful responses include `success: true`:**

```typescript
interface ISuccessResponse<T> {
  success: true
  data: T
}

// Example
{
  success: true,
  data: {
    id: "123",
    name: "John Doe",
    email: "john@example.com"
  }
}
```

**Why include success field?**
- Makes success/failure immediately obvious
- No need to check status codes
- Consistent structure across all endpoints
- TypeScript discriminated unions work perfectly

---

## Error Handling Middleware

### Express/Bun

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from './errors'
import { logger } from './logger'

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Global error handler
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  })

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.constructor.name.replace('Error', '').toUpperCase(),
      },
    })
  }

  // Handle unknown errors (don't leak details)
  res.status(500).json({
    success: false,
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
  })
}
```

### .NET

```csharp
// Custom exception filter
public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        var error = context.Exception;

        _logger.LogError(error, "Error occurred: {Message}", error.Message);

        var response = new ErrorResponse
        {
            Success = false,
            Error = new ErrorDetail
            {
                Message = GetUserMessage(error),
                Code = GetErrorCode(error)
            }
        };

        context.Result = new ObjectResult(response)
        {
            StatusCode = GetStatusCode(error)
        };

        context.ExceptionHandled = true;
    }

    private int GetStatusCode(Exception error)
    {
        return error switch
        {
            ValidationException => 400,
            UnauthorizedException => 401,
            ForbiddenException => 403,
            NotFoundException => 404,
            _ => 500
        };
    }

    private string GetUserMessage(Exception error)
    {
        // Only expose details for known exceptions
        if (error is AppException)
            return error.Message;

        return "An unexpected error occurred";
    }

    private string GetErrorCode(Exception error)
    {
        return error.GetType().Name.Replace("Exception", "").ToUpperInvariant();
    }
}
```

---

## Logging

### Log Levels

**Use appropriate log levels:**

- **DEBUG** - Detailed diagnostic information (dev only)
- **INFO** - General informational messages
- **WARN** - Warning messages (handled errors, deprecations)
- **ERROR** - Error messages (unhandled errors, failures)

### What to Log

**✅ DO Log:**
- Error messages and stack traces
- User actions (login, critical operations)
- API requests/responses (sanitized)
- Performance metrics
- Security events

**❌ DON'T Log:**
- Passwords (ever)
- API keys or secrets
- Credit card numbers
- Social security numbers
- Personal health information
- Full request bodies (may contain sensitive data)

### Logging Libraries

**Bun - Pino:**

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined
})

// Usage
logger.info('User logged in', { userId: user.id })
logger.error('Database query failed', { error: err.message, query })
logger.warn('Rate limit approaching', { userId, requestCount })
```

**Why Pino?**
- Fastest JSON logger
- Low overhead
- Structured logging
- Great for production

**.NET - Serilog:**

```csharp
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

// Usage
Log.Information("User {UserId} logged in", userId);
Log.Error(ex, "Database query failed");
Log.Warning("Rate limit approaching for user {UserId}", userId);
```

**Python - loguru:**

```python
from loguru import logger

# Configure
logger.add("app.log", rotation="1 day", retention="30 days", level="INFO")

# Usage
logger.info(f"User {user_id} logged in")
logger.error(f"Database query failed: {err}")
logger.warning(f"Rate limit approaching for user {user_id}")
```

### Production Logging

**Google Cloud Logging:**

```typescript
import { Logging } from '@google-cloud/logging'

const logging = new Logging()
const log = logging.log('app-log')

// Write structured logs
await log.write(log.entry({
  severity: 'ERROR',
  resource: { type: 'cloud_run_revision' },
  jsonPayload: {
    message: 'Error occurred',
    error: err.message,
    userId: user.id,
    path: req.path,
  },
}))
```

**Benefits:**
- Centralized logging
- Search and filter
- Alerts and monitoring
- Integration with Google Cloud services

---

## Frontend Error Handling

### Error Boundaries (React)

```typescript
import { Component, ReactNode } from 'react'
import { logger } from '@/utils/logger'

interface IErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface IErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  state: IErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
    logger.error('React error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="errorContainer">
          <h1>Something went wrong</h1>
          <p>We've been notified and are working on a fix.</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### API Error Handling with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { logger } from '@/utils/logger'

export function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()

      if (!data.success) {
        // Log error
        logger.error('API error', {
          endpoint: `/api/users/${userId}`,
          error: data.error.message,
        })

        // Throw error for React Query to handle
        throw new Error(data.error.message)
      }

      return data.data
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message.includes('not found')) return false
      if (error.message.includes('unauthorized')) return false

      // Retry server errors up to 3 times
      return failureCount < 3
    },
  })
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUserData(userId)

  if (isLoading) return <Spinner />

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load user data"
        message={error.message}
        retry={() => window.location.reload()}
      />
    )
  }

  return <div>{data.name}</div>
}
```

---

## Error Monitoring

### Sentry (Optional)

**Use for critical applications:**

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out known non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('Network error')) {
      return null
    }

    return event
  },
})

// Capture custom errors
try {
  await riskyOperation()
} catch (err) {
  Sentry.captureException(err, {
    tags: { feature: 'payment' },
    extra: { userId: user.id },
  })
  throw err
}
```

**When to use Sentry:**
- Production applications
- Need error tracking with context
- Want to see error frequency
- Need stack traces from production
- Budget allows for service cost

---

## Fail Early Principle

**Validate inputs immediately:**

```typescript
// ✅ Good - Fail early
function processPayment(amount: number, userId: string) {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive')
  }

  if (!userId) {
    throw new ValidationError('User ID is required')
  }

  // Continue with processing
}

// ❌ Bad - Fail late
function processPayment(amount: number, userId: string) {
  // Do 10 steps of processing...

  if (amount <= 0) {
    throw new ValidationError('Amount must be positive')
  }

  // Wasted resources
}
```

**Why fail early?**
- Saves processing time
- Clearer error messages
- Easier debugging
- Better user experience

---

## Error Handling Checklist

**Before deploying:**

- [ ] All errors use custom error classes
- [ ] API responses follow standardized format
- [ ] Error middleware configured
- [ ] Logging configured (appropriate level)
- [ ] No sensitive data in logs
- [ ] No sensitive data in error messages
- [ ] Frontend error boundaries in place
- [ ] Error states handled in UI
- [ ] Retry logic for transient errors
- [ ] Error monitoring configured (if applicable)

---

## Common Patterns

### Try-Catch Blocks

```typescript
// ✅ Good - Specific handling
try {
  await updateUser(userId, data)
} catch (err) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ success: false, error: { message: err.message } })
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ success: false, error: { message: err.message } })
  }

  // Unknown error - rethrow
  throw err
}

// ❌ Bad - Swallowing errors
try {
  await updateUser(userId, data)
} catch (err) {
  console.log('Error:', err)
  // Error is swallowed, never handled
}
```

### Async Error Handling

```typescript
// ✅ Good - Always use asyncHandler or try-catch
app.post('/api/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body)
  res.json({ success: true, data: user })
}))

// ❌ Bad - Unhandled promise rejection
app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body) // Error crashes server
  res.json({ success: true, data: user })
})
```

---

## Summary

**Key Principles:**
1. Use custom error classes for type safety
2. Standardized API error responses with `success` field
3. Log errors properly (appropriate level, no sensitive data)
4. Fail early with validation
5. Handle errors gracefully in UI
6. Never expose sensitive information in error messages
7. Monitor errors in production
