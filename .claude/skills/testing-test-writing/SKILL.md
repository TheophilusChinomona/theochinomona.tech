---
name: Testing Test Writing
description: Write minimal strategic tests during development focusing on core user flows and critical paths, deferring comprehensive edge case testing until after feature completion. Use this skill when writing tests for completed features, testing critical user workflows, implementing integration tests, creating end-to-end tests with Playwright, writing unit tests for core logic, or determining testing strategy and priorities. Apply when working on test files (*.test.ts, *.spec.ts, *.test.tsx), Playwright test files (e2e/*.spec.ts), test configuration, or when deciding what to test during feature development. This skill ensures minimal tests during active development (complete the feature first), focus exclusively on core user flows and critical paths (skip non-critical utilities), deferred edge case and validation testing until dedicated testing phases, behavior testing over implementation details (test WHAT not HOW), descriptive test names that explain the behavior and expected outcome, mocked external dependencies (databases, APIs, file systems) to isolate units, fast unit test execution (milliseconds), strategic rather than comprehensive coverage, Playwright for frontend E2E tests, Bun test runner for backend/Bun projects, xUnit for .NET, and pytest for Python.
---

# Testing Test Writing

## When to use this skill:

- When determining testing strategy for a new feature (minimal during dev)
- When writing tests for completed features at logical milestones
- When testing critical user workflows and primary paths only
- When implementing integration tests for feature interactions
- When creating end-to-end tests with Playwright for user journeys
- When writing unit tests for core business logic
- When deciding whether to write tests during or after development (prefer after)
- When prioritizing which tests to write first (critical paths)
- When mocking external dependencies (databases, APIs, file systems)
- When writing descriptive test names that explain behavior and expected outcome
- When working on test files (*.test.ts, *.spec.ts, e2e/*.spec.ts)
- When reviewing testing coverage and identifying gaps in critical paths
- When choosing test runners (Bun test for Bun, xUnit for .NET, pytest for Python)
- When skipping edge case tests during active feature development

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle testing test writing.

## Instructions

For details, refer to the information provided in this file:
[testing test writing](../../../agent-os/standards/testing/test-writing.md)
