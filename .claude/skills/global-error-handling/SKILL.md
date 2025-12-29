---
name: Global Error Handling
description: Implement comprehensive error handling with custom error classes (AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, InternalServerError), standardized API error responses, proper logging, and graceful UI error states without exposing sensitive information. Use this skill when creating custom error classes, implementing error middleware, handling API errors, logging errors, creating error boundaries in React, implementing try-catch blocks, defining error response formats, or setting up error monitoring. Apply when working on API route handlers, middleware files, service layer error handling, React error boundaries, error logging configuration, or any code that can throw or catch errors. This skill ensures custom error classes extending AppError for type safety and consistent structure, standardized error response format with success: false and error object (message, code, details), appropriate log levels (DEBUG/INFO/WARN/ERROR) without logging sensitive data (passwords, API keys, PII), Pino for Bun (fastest JSON logger), Serilog for .NET, loguru for Python, centralized error middleware with asyncHandler wrapper, React error boundaries for UI errors with user-friendly fallback, TanStack Query error handling with smart retry logic (don't retry 4xx), fail-early validation principles, and optional Sentry integration for production monitoring.
---

# Global Error Handling

## When to use this skill:

- When creating custom error classes (ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError)
- When implementing API error handling middleware with asyncHandler wrapper
- When defining error response formats for APIs ({success: false, error: {message, code, details}})
- When writing try-catch blocks for async operations with specific error type handling
- When implementing error logging (Pino for Bun, Serilog for .NET, loguru for Python)
- When creating React error boundaries for UI error handling with fallback UI
- When handling errors in API calls with TanStack Query (smart retry logic)
- When configuring error monitoring services (Sentry for production)
- When validating inputs and throwing errors early (fail-early principle)
- When implementing retry logic for transient failures (not for 4xx client errors)
- When working on error handling in service files, middleware, or API routes
- When ensuring errors don't expose sensitive information to users
- When logging to Google Cloud Logging in production environments
- When wrapping Express/Bun routes with asyncHandler to catch promise rejections

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle global error handling.

## Instructions

For details, refer to the information provided in this file:
[global error handling](../../../agent-os/standards/global/error-handling.md)
