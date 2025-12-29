# Validation

This document defines validation standards for theo.dev projects.

## Core Principle

**Always validate on the server. Never trust client input.**

Client-side validation is for user experience only, not security.

---

## Validation Strategy

### Two-Tier Approach

**1. Client-Side Validation (Optional, for UX)**
- Immediate feedback to users
- Reduces unnecessary server requests
- Better user experience
- **NOT for security**

**2. Server-Side Validation (Required)**
- Enforces business rules
- Security boundary
- Data integrity
- Always runs, even if client bypasses validation

---

## Schema Validation with Zod

### Why Zod?

- Type-safe validation
- Works on client and server
- TypeScript integration
- Runtime validation
- Excellent error messages

### Basic Schema

```typescript
import { z } from 'zod'

// Define schema
const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int().min(18, 'Must be 18 or older'),
  role: z.enum(['admin', 'user', 'guest']),
})

// Infer TypeScript type from schema
type IUser = z.infer<typeof userSchema>

// Validate data
try {
  const user = userSchema.parse(data)
  // user is now type-safe and validated
} catch (err) {
  if (err instanceof z.ZodError) {
    // Handle validation errors
    console.log(err.errors)
  }
}
```

### Advanced Schemas

```typescript
import { z } from 'zod'

// Optional fields
const profileSchema = z.object({
  name: z.string(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
})

// Nested objects
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
})

const userWithAddressSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: addressSchema,
})

// Arrays
const tagsSchema = z.array(z.string()).min(1).max(10)

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  tags: tagsSchema,
})

// Unions
const idSchema = z.union([
  z.string().uuid(),
  z.number().int().positive(),
])

// Refinements (custom validation)
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain at least one number'
  )

// Transforms
const dateSchema = z.string().transform((val) => new Date(val))

const userWithDateSchema = z.object({
  name: z.string(),
  birthdate: dateSchema,
})
```

---

## API Validation

### Request Validation Middleware

**Express/Bun:**

```typescript
import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: err.errors.reduce((acc, error) => {
              const path = error.path.join('.')
              acc[path] = error.message
              return acc
            }, {} as Record<string, string>),
          },
        })
      }
      next(err)
    }
  }
}

// Usage
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

app.post('/api/users', validate(createUserSchema), async (req, res) => {
  // req.body is now validated and type-safe
  const user = await createUser(req.body)
  res.json({ success: true, data: user })
})
```

**.NET:**

```csharp
using FluentValidation;

// Define validator
public class CreateUserRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
}

public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required");
    }
}

// Usage in controller
[HttpPost("users")]
public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
{
    var validator = new CreateUserValidator();
    var result = await validator.ValidateAsync(request);

    if (!result.IsValid)
    {
        return BadRequest(new
        {
            Success = false,
            Error = new
            {
                Message = "Validation failed",
                Code = "VALIDATION_ERROR",
                Details = result.Errors.ToDictionary(
                    e => e.PropertyName,
                    e => e.ErrorMessage
                )
            }
        });
    }

    var user = await _userService.CreateUser(request);
    return Ok(new { Success = true, Data = user });
}
```

---

## Form Validation

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type ILoginForm = z.infer<typeof loginSchema>

// Component
function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: ILoginForm) => {
    // Data is validated and type-safe
    await login(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        type="email"
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email.message}</span>}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span className="error">{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### Complex Form Example

```typescript
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Nested schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
})

const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be XXX-XXX-XXXX'),
  addresses: z.array(addressSchema).min(1, 'At least one address required'),
})

type IUserProfile = z.infer<typeof userProfileSchema>

function UserProfileForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      addresses: [{ street: '', city: '', state: '', zip: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  const onSubmit = async (data: IUserProfile) => {
    await updateProfile(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="First Name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register('lastName')} placeholder="Last Name" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input {...register('email')} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('phone')} placeholder="XXX-XXX-XXXX" />
      {errors.phone && <span>{errors.phone.message}</span>}

      <h3>Addresses</h3>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`addresses.${index}.street`)} placeholder="Street" />
          {errors.addresses?.[index]?.street && (
            <span>{errors.addresses[index].street.message}</span>
          )}

          <input {...register(`addresses.${index}.city`)} placeholder="City" />
          <input {...register(`addresses.${index}.state`)} placeholder="State" />
          <input {...register(`addresses.${index}.zip`)} placeholder="ZIP" />

          <button type="button" onClick={() => remove(index)}>
            Remove Address
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ street: '', city: '', state: '', zip: '' })}
      >
        Add Address
      </button>

      <button type="submit">Save Profile</button>
    </form>
  )
}
```

---

## Validation Rules

### Common Patterns

**Email:**
```typescript
z.string().email('Invalid email address')
```

**Password:**
```typescript
z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
```

**Phone:**
```typescript
z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be XXX-XXX-XXXX')
```

**URL:**
```typescript
z.string().url('Invalid URL')
```

**Date:**
```typescript
z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date')
// Or with transform
z.string().transform((val) => new Date(val))
```

**Credit Card:**
```typescript
z.string()
  .regex(/^\d{13,19}$/, 'Invalid card number')
  .refine(luhnCheck, 'Invalid card number')
```

**UUID:**
```typescript
z.string().uuid('Invalid UUID')
```

---

## Database Validation

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function hasRole(role) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }

    // Validate email format
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() &&
                      request.auth.uid == userId &&
                      isValidEmail(request.resource.data.email) &&
                      request.resource.data.keys().hasAll(['email', 'name', 'createdAt']) &&
                      request.resource.data.name is string &&
                      request.resource.data.name.size() > 0 &&
                      request.resource.data.name.size() <= 100;
      allow update: if isOwner(userId) &&
                      !request.resource.data.diff(resource.data).affectedKeys().hasAny(['createdAt', 'id']);
      allow delete: if hasRole('admin');
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if true; // Public
      allow create: if isAuthenticated() &&
                      request.resource.data.authorId == request.auth.uid &&
                      request.resource.data.title is string &&
                      request.resource.data.title.size() > 0 &&
                      request.resource.data.title.size() <= 200 &&
                      request.resource.data.content is string &&
                      request.resource.data.content.size() >= 10;
      allow update: if isOwner(resource.data.authorId);
      allow delete: if isOwner(resource.data.authorId) || hasRole('admin');
    }
  }
}
```

### SQL Validation (Prisma)

```typescript
// Use Zod for input validation before database operations
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  authorId: z.string().uuid(),
})

async function createPost(data: unknown) {
  // Validate input
  const validatedData = createPostSchema.parse(data)

  // Database operation with validated data
  const post = await prisma.post.create({
    data: {
      title: validatedData.title,
      content: validatedData.content,
      authorId: validatedData.authorId,
      createdAt: new Date(),
    },
  })

  return post
}
```

---

## File Upload Validation

### Validate File Types and Sizes

```typescript
const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
})

// Server-side validation (Express)
import multer from 'multer'

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.mimetype)) {
      cb(new ValidationError('Invalid file type'))
      return
    }

    cb(null, true)
  },
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    throw new ValidationError('File is required')
  }

  // Process file
  const url = await uploadToStorage(req.file)
  res.json({ success: true, data: { url } })
})
```

---

## Sanitization

### Input Sanitization

```typescript
import DOMPurify from 'dompurify'

// Sanitize HTML content
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

// Trim and normalize strings
function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

// Remove special characters for slugs
function sanitizeSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

---

## Error Messages

### User-Friendly Messages

```typescript
// ❌ Bad - Technical jargon
"Regex validation failed on field 'email'"
"Constraint violation: NOT NULL"

// ✅ Good - Clear and helpful
"Please enter a valid email address"
"Email is required"
```

### Specific Validation Errors

```typescript
// ✅ Good - Specific and actionable
const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  age: z.number().min(18, 'You must be at least 18 years old'),
})
```

---

## Validation Checklist

**Before deploying:**

- [ ] Server-side validation on all inputs
- [ ] Schemas defined with Zod (or equivalent)
- [ ] Validation middleware in place
- [ ] Error messages are user-friendly
- [ ] File uploads validated (type and size)
- [ ] Database constraints enforced (Firestore Rules or SQL)
- [ ] Inputs sanitized where necessary
- [ ] No sensitive data in error messages
- [ ] Client-side validation for UX (optional)
- [ ] Form validation with React Hook Form + Zod

---

## Summary

**Key Principles:**
1. Always validate on the server
2. Use schema validation (Zod) for type safety
3. Client-side validation is for UX only
4. Fail early with clear error messages
5. Sanitize inputs to prevent injection attacks
6. Validate file uploads (type and size)
7. Enforce constraints at database level
8. Never trust client input
