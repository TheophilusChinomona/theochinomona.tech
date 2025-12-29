---
name: Global Conventions
description: Follow project-wide development conventions for project structure, documentation, version control, code review, environment configuration, dependency management, and security practices. Use this skill when setting up new projects, organizing file structures, writing project documentation, creating Git branches and commits, configuring environment variables, managing dependencies, setting up CI/CD pipelines, or implementing security practices. Apply when working on project setup tasks, creating documentation files (README.md, ARCHITECTURE.md, DATABASE_SCHEMA.md, API_REFERENCE.md, SETUP.md), Git workflow operations, .env files, package.json/bun.lockb, Docker configurations, or any cross-cutting project concerns. This skill ensures hybrid code organization (global shared code by type + feature-specific code with nested subdirectories), required documentation (README, ARCHITECTURE, DATABASE_SCHEMA, API_REFERENCE, SETUP - written before coding then updated), GitHub Flow workflow (main branch production-ready, feature branches for work, PR required), conventional commit messages (feat/fix/docs/style/refactor/test/chore with scope), proper secrets management (.env.example committed, real secrets in Google Cloud Secret Manager, Zod validation on startup), disciplined code review (PRs for all non-trivial changes even on solo projects, 48h turnaround), comprehensive security practices (Firestore/Storage rules, CORS, rate limiting, request size limits, parameterized queries, HTTPS, no hardcoded secrets), and performance standards (Lighthouse Performance 70+, Accessibility 90+, API p95 <1s).
---

# Global Conventions

## When to use this skill:

- When initializing new projects or setting up project structure (hybrid organization)
- When organizing code into folders (src/components, src/hooks, src/services, src/features)
- When writing or updating project documentation (README, docs/ARCHITECTURE.md, docs/DATABASE_SCHEMA.md)
- When creating Git branches (feature/, fix/, chore/, docs/, refactor/) or writing commit messages
- When setting up environment variables (.env.example, .env.development) and secrets
- When managing project dependencies (bun add, npm install, pip install)
- When configuring Docker and containerization for Cloud Run deployment
- When setting up CI/CD pipelines with GitHub Actions (lint, type-check, test, build)
- When implementing security practices (Firestore rules, CORS, rate limiting, auth)
- When performing code reviews or creating pull requests with checklists
- When documenting architectural decisions in docs/ARCHITECTURE.md
- When working on any project-wide configuration or setup tasks
- When validating environment variables with Zod schemas on startup
- When choosing between writing code yourself vs using a library (bundlephobia.com for size)

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle global conventions.

## Instructions

For details, refer to the information provided in this file:
[global conventions](../../../agent-os/standards/global/conventions.md)
