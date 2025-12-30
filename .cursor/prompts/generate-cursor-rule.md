# Generate Cursor Rule

Generate a new Cursor rule file following the project's established conventions.

## Instructions

1. Follow the rule structure format defined in @.cursor/rules/cursor-rules.mdc
2. Place the generated rule in `.cursor/rules/`
3. Use kebab-case for the filename with `.mdc` extension
4. Include proper YAML frontmatter with description, globs, and alwaysApply

## Rule Template

Use this exact structure:

```markdown
---
description: [Short description of the rule's purpose]
globs: [optional/path/pattern/**/* or leave empty]
alwaysApply: [true or false]
---
# [Rule Title]

[Main content explaining the rule]

## [Section 1]

[Content with examples]

```typescript
// ✅ Good: [explanation]
[good code example]

// ❌ Bad: [explanation]
[bad code example]
```

## [Additional Sections as needed]

---

*Last Updated: [Month Year]*
```

## Guidelines

- **Be specific and actionable** - Provide clear instructions
- **Include code examples** - Show both good and bad practices from the actual codebase
- **Reference project files** - Use `[filename](mdc:path/to/file)` format
- **Keep it focused** - One rule per concern/pattern
- **Add context** - Explain why the rule exists

## Rule Categories for This Project

Choose the appropriate category:
- **Project**: Structure, architecture
- **Tech Stack**: Dependencies, patterns
- **Supabase**: Database queries, RLS, edge functions
- **React Query**: Caching, queries, mutations
- **Forms**: React Hook Form + Zod patterns
- **Auth**: Protected routes, role-based access
- **Styling**: Tailwind, shadcn/ui, brand guide
- **Testing**: Vitest, React Testing Library

## What to Generate

Based on user input, generate a complete `.mdc` rule file that:
1. Follows the template structure exactly
2. Uses real patterns from the codebase when possible
3. Includes practical good/bad examples
4. Has appropriate frontmatter settings
5. Suggests the correct filename

Ask the user what rule topic they want to create if not specified.

