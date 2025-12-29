# Development Conventions

This document defines general development conventions for theo.dev projects.

## Project Structure

### Hybrid Organization

**Global shared code** - Organized by type:
```
src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # API clients, Firebase operations
├── utils/            # Helper functions
├── types/            # TypeScript types and interfaces
├── contexts/         # React contexts
└── assets/           # Images, fonts, icons
```

**Feature-specific code** - Organized by feature with nested subdirectories:
```
src/
└── features/
    ├── dashboard/
    │   ├── components/      # Dashboard-specific components
    │   ├── hooks/          # Dashboard-specific hooks
    │   ├── services/       # Dashboard-specific API calls
    │   ├── types.ts        # Dashboard types
    │   └── index.tsx       # Main dashboard entry
    ├── auth/
    │   ├── components/
    │   ├── hooks/
    │   ├── services/
    │   └── index.tsx
    └── reports/
        └── ...
```

**Why hybrid:**
- Global code is easy to find
- Features stay encapsulated
- Clear ownership boundaries
- Scales as project grows

---

## Documentation

### Required Documentation

**Every project must have:**

1. **README.md** - Project overview
   - What the project does
   - How to set it up
   - How to run it locally
   - Tech stack summary
   - Link to detailed docs

2. **docs/ARCHITECTURE.md** - System design
   - Component relationships
   - Data flow
   - Key architectural decisions
   - System boundaries

3. **docs/DATABASE_SCHEMA.md** - Data model
   - Collections/tables
   - Relationships
   - Indexes required
   - Sample queries

4. **docs/API_REFERENCE.md** - API documentation
   - All endpoints
   - Request/response formats
   - Authentication requirements
   - Error codes

5. **docs/SETUP.md** - Installation guide
   - Prerequisites
   - Environment setup
   - Configuration steps
   - Common issues

### Documentation Stages

**Stage 1: Planning (Before Coding)**
- Write initial versions of all required docs
- Document planned architecture
- Define data models
- Spec out API endpoints

**Stage 2: During Development**
- Update docs as design changes
- Keep docs in sync with code
- Document decisions as you make them

**Stage 3: After Feature Completion**
- Final review and polish
- Ensure accuracy
- Add examples
- Review for clarity

---

## Version Control

### Git Workflow

**GitHub Flow:**
- `main` branch is production-ready
- Create feature branches for work
- Open PR to merge back to main
- Require review + CI checks before merge

### Branch Naming

**Format:** `type/description`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation only
- `refactor/` - Code refactoring

**Examples:**
- `feature/add-user-auth`
- `fix/login-button-crash`
- `chore/update-dependencies`
- `docs/api-reference`
- `refactor/extract-validation`

###

 Commit Messages

**Format:** Conventional Commits

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```
feat(auth): add password reset functionality

fix(api): resolve timeout on large file uploads

docs(readme): update installation instructions

refactor(components): extract Button variants to separate files
```

**Commits should be feature-complete:**
- Don't commit WIP code
- Each commit should represent working state
- Related changes in one commit

---

## Code Review

### Solo Projects

**Disciplined process even alone:**
- Create PRs for all non-trivial changes
- Self-review with checklist before merging
- Enforces good habits
- Creates audit trail

**PR Checklist:**
- [ ] Code follows standards
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No debug code left in
- [ ] Self-reviewed thoroughly

### Team Projects

**PR Requirements (Author):**
- Clear description of what and why
- Tests cover changes
- Documentation updated
- No console.logs or debug code
- Self-review completed first

**Reviewer Checklist:**
- [ ] Code follows naming conventions
- [ ] No obvious bugs/edge cases
- [ ] Error handling adequate
- [ ] Security checked
- [ ] Tests adequate
- [ ] Performance considerations
- [ ] Documentation clear

**Approval Requirements:**
- Small teams (2-3): 1 approval required
- Larger teams (4+): 1-2 approvals required
- Author cannot approve own PR

**Review Turnaround:**
- Expected: 48 hours
- Urgent fixes: Same day

---

## Environment Configuration

### Environment Variables

**File Structure:**
```
.env.example          # Template, committed to git
.env.development      # Local dev, gitignored
.env.test             # Test environment, gitignored
```

**Required in Every Project:**
- `.env.example` with all variables (dummy values)
- `.gitignore` excludes all `.env*` except `.env.example`
- README documents all required secrets

### Secrets Management

**Development:**
- Store in `.env.development` file
- Never commit real secrets

**Production:**
- Google Cloud Secret Manager
- Access via environment variables
- Never hardcode in code

### Environment Variable Validation

**Use Zod for validation:**

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

**Benefits:**
- App crashes immediately if secrets missing
- Type-safe environment variables
- Self-documenting requirements

---

## Dependency Management

### Decision Criteria

**Write yourself when:**
- Simple logic (< 50 lines)
- No edge cases
- You understand it fully

**Use library when:**
- Complex with edge cases
- Security-critical
- Browser compatibility issues
- Would take > 1 hour to implement properly

### Recommended Libraries

**✅ Use:**
- `date-fns` - Date/time (timezones are hard)
- `react-hook-form` + `zod` - Forms
- `uuid` - Crypto-secure IDs
- `recharts` - Charts
- `@dnd-kit/core` - Drag & drop

**❌ Write yourself:**
- Debounce/throttle (5-10 lines)
- Simple array utilities
- Sleep/delay
- Simple validators
- String manipulation

**⚠️ Evaluate:**
- Check bundle size at bundlephobia.com
- If > 50KB, look for alternatives
- Consider tree-shaking

### Maintenance

**Dependencies:**
- Only update to major stable versions
- Test thoroughly before major updates
- Keep dependencies minimal
- Document why major deps are used

---

## Security Practices

### All REQUIRED

**Firebase Security:**
- ✅ Firestore Security Rules configured
- ✅ Storage Rules configured
- ✅ API keys restricted in Google Cloud Console

**API Security:**
- ✅ CORS properly configured
- ✅ Rate limiting on public endpoints
- ✅ Request size limits
- ✅ Authentication on protected endpoints

**Data Security:**
- ✅ Never log sensitive data
- ✅ Sanitize user inputs
- ✅ Use parameterized queries
- ✅ HTTPS only in production

**Dependency Security:**
- ✅ Regular updates
- ✅ Automated vulnerability scanning
- ✅ Lock files committed

**Code Security:**
- ✅ No hardcoded secrets
- ✅ Security headers configured
- ✅ Input validation on all inputs

---

## Testing Requirements

**Integration tests for new features:**
- Test how new feature integrates with existing code
- Verify data flow
- Check error handling

**End-to-end tests for workflows:**
- Test complete user journeys
- Critical paths must work
- Production-like scenarios

**Tools:**
- Frontend: Playwright
- Bun: Bun test runner (built-in) + Supertest
- .NET: xUnit
- Python: pytest

---

## CI/CD Pipeline

### Automated Checks

**Run automatically:**
- Linting (ESLint, Ruff)
- Type checking (TypeScript, mypy)
- Tests (all suites)
- Build verification

**Manual approval required:**
- Any deployment off local machine
- Production deployments
- Infrastructure changes

### Deployment

**Process:**
1. Test locally with Docker Compose
2. CI runs all checks
3. Manual approval required
4. Deploy to production

---

## Performance Standards

**Baseline Requirements:**
- Lighthouse Performance: 70+
- Lighthouse Accessibility: 90+
- Core Web Vitals within acceptable ranges
- API p95 < 1s for most endpoints

**Monitor, don't block:**
- Track metrics in production
- Optimize when data shows issues
- Don't prematurely optimize

---

## Summary

**Key Principles:**
1. **Consistency** - Follow standards across all projects
2. **Documentation** - Write as you go, keep it current
3. **Quality** - Use tools to enforce standards
4. **Security** - All security practices required
5. **Collaboration** - Code review even on solo projects
6. **Pragmatism** - Standards serve the project, not vice versa
