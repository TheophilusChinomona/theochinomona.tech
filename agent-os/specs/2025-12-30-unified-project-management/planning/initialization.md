# Spec Initialization

## Raw Idea

On the client side, "my projects" and "my requests" are redundant. I want the user to create the project on "my projects" and they can filter by status (pending, in progress, In testing, completed) and these statuses should carry on both admin and client dashboards. So when they create a project they can tick a box that shows if they are hiring me or suggesting a project for me to do.

As an admin when a client creates a project that needs more details i can ask for details and the client can upload or reply to my request, and the status changes should be automatic: 1. when a client creates a project and it hasn't been approved, "Pending" 2. when admin has reviewed the project and requests payment or something "Pending (payment/comments/etc)". 3. when admin has started on the job "in progress" 4. when admin is done and the project is ready for testing phase "in testing" 5. when the job is done "completed". As an admin i also want to be able to delete invoices or projects. and as a user i want to be able to delete projects i created.

## Spec Name

Unified Project Management Workflow

## Date

2025-12-30

## Status

Initialized - Ready for requirements research

