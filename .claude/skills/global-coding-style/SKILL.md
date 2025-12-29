---
name: Global Coding Style
description: Apply consistent coding style and formatting standards using automated tools (ESLint, Prettier, Ruff) with clear naming conventions, top-down code organization, and appropriate function/component sizing. Use this skill when writing any code in any language, naming files and variables, structuring code within files, organizing imports, configuring linters and formatters, or setting up pre-commit hooks. Apply when working on TypeScript/JavaScript files, Python files, .NET/C# files, configuration files (tsconfig.json, .prettierrc, .eslintrc), or any code that needs consistent formatting and naming. This skill ensures automated formatting with Prettier/Ruff (let tools handle it), ESLint/analyzer enforcement, TypeScript strict mode always enabled, proper naming conventions (PascalCase.tsx for React components, camelCase.ts for utilities, IPascalCase for interfaces with I prefix, PascalCase for types without prefix, camelCase for functions/constants/database fields/API endpoints/JSON keys, no underscore prefix for private variables), top-down readable code structure (imports → types → component → state → hooks → derived values → handlers → effects → early returns → JSX), manageable function sizes (scroll test, split at >300 lines), always destructured props, DRY principles (extract at 3+ repetitions), organized imports (external → internal absolute → relative → CSS/assets), and no backward compatibility code unless explicitly required.
---

# Global Coding Style

## When to use this skill:

- When writing any new code in TypeScript, JavaScript, Python, or .NET
- When naming files, functions, variables, classes, or interfaces
- When organizing code structure within files (imports, types, logic)
- When setting up or configuring linters (ESLint, Ruff, StyleCop)
- When configuring formatters (Prettier, Black, Ruff)
- When organizing import statements (external → internal → relative → assets)
- When deciding between PascalCase, camelCase, or other naming styles
- When splitting large functions or components into smaller ones (scroll test)
- When removing dead code or commented-out code (delete, don't comment out)
- When setting up pre-commit hooks with Husky + lint-staged or pre-commit framework
- When reviewing code for consistency and readability
- When working on any code file across all languages and frameworks
- When enabling TypeScript strict mode in tsconfig.json
- When choosing indentation (2 spaces for TS/JS, 4 spaces for Python/.NET)

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle global coding style.

## Instructions

For details, refer to the information provided in this file:
[global coding style](../../../agent-os/standards/global/coding-style.md)
