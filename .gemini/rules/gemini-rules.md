---
description: How to add or edit Gemini rules in your project
globs:
alwaysApply: false
---
# Gemini Rules Management Guide

## Rule Structure Format

Every gemini rule must follow this exact metadata and content structure:

````markdown
---
description: Short description of the rule's purpose
globs: optional/path/pattern/**/*
alwaysApply: false
---
# Rule Title

Main content explaining the rule with markdown formatting.

1. Step-by-step instructions
2. Code examples
3. Guidelines

Example:
```typescript
// Good
function goodExample() {
  // Correct implementation
}

// Bad example
function badExample() {
  // Incorrect implementation
}
```
````

## File Organization

### Required Location

All gemini rule files **must** be placed in:

```
PROJECT_ROOT/.gemini/rules/
```

### Directory Structure

```
theochinomona.tech/
├── .gemini/
│   └── rules/
│       ├── gemini-rules.md       # This file - rule management guide
│       ├── project-structure.md  # Project structure documentation
│       ├── tech-stack.md         # Tech stack and dependencies
│       └── self-improve.md       # Rule improvement guidelines
└── ...
```

### Naming Conventions

- Use **kebab-case** for all filenames
- Always use **.md** extension
- Make names **descriptive** of the rule's purpose
- Examples: `typescript-style.md`, `tailwind-styling.md`, `supabase-patterns.md`

## Content Guidelines

### Writing Effective Rules

1. **Be specific and actionable** - Provide clear instructions
2. **Include code examples** - Show both good and bad practices
3. **Reference existing files** - Use relative paths
4. **Keep it focused** - One rule per concern/pattern
5. **Add context** - Explain why the rule exists

### Code Examples Format

```typescript
// ✅ Good: Clear and follows conventions
interface ProjectCardProps {
  project: Project
  onEdit?: (id: string) => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  return <Card>{/* content */}</Card>
}

// ❌ Bad: Missing types, unclear props
function ProjectCard(props) {
  return <div>{props.project.title}</div>
}
```

## Forbidden Locations

**Never** place rule files in:
- Project root directory
- Any subdirectory outside `.gemini/rules/`
- Component directories
- Source code folders
- Documentation folders

## Rule Categories

Organize rules by purpose:
- **Project**: `project-structure.md`, `tech-stack.md`
- **Code Style**: `typescript-style.md`, `css-conventions.md`
- **Patterns**: `supabase-patterns.md`, `react-query.md`
- **Meta**: `gemini-rules.md`, `self-improve.md`

## Best Practices

### Rule Creation Checklist
- [ ] File placed in `.gemini/rules/` directory
- [ ] Filename uses kebab-case with `.md` extension
- [ ] Includes proper metadata section
- [ ] Contains clear title and sections
- [ ] Provides both good and bad examples
- [ ] References relevant project files
- [ ] Follows consistent formatting

### Maintenance
- **Review regularly** - Keep rules up to date with codebase changes
- **Update examples** - Ensure code samples reflect current patterns
- **Cross-reference** - Link related rules together
- **Document changes** - Update rules when patterns evolve

### Project-Specific Considerations

For theochinomona.tech, consider creating rules for:
- Supabase query patterns
- React Query cache strategies
- Form handling with React Hook Form + Zod
- Protected route patterns
- shadcn/ui component customization
- Authentication flow patterns
- Database access layer patterns (`lib/db/`)
