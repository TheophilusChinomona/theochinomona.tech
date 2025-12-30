# Specification: Client Payments & Invoicing

## Goal

Integrate Stripe payment gateway to enable comprehensive invoice management, payment processing, and billing tracking for both admin and client users, supporting one-time and recurring payments with full lifecycle management.

## User Stories

- As an admin, I want to create invoices with line items auto-calculated from project phases/tasks, adjust amounts, apply discounts, and send invoices to clients so that I can efficiently bill for completed work.
- As a client, I want to view all my invoices, see billing per project, pay invoices via Stripe Checkout, and download PDF receipts so that I can manage payments transparently.
- As a client, I want to request quotes for new work and make partial payments on invoices so that I have flexibility in how I engage and pay for services.

## Specific Requirements

**Database Schema - Invoices & Line Items**
- Create `invoice_status` enum with values: 'draft', 'sent', 'paid', 'partially_paid', 'overdue', 'refunded', 'cancelled'
- Create `invoices` table with fields: `id` (UUID), `project_id` (FK to projects, nullable), `client_id` (FK to users), `invoice_number` (text, unique), `status` (invoice_status, default 'draft'), `subtotal` (bigint - cents), `discount_amount` (bigint, default 0), `tax_amount` (bigint, default 0), `total` (bigint - cents), `currency` (text, default 'usd'), `due_date` (date), `sent_at` (timestamptz nullable), `paid_at` (timestamptz nullable), `stripe_checkout_session_id` (text nullable), `stripe_payment_intent_id` (text nullable), `notes` (text nullable), `created_at`, `updated_at`
- Create `invoice_line_items` table with fields: `id` (UUID), `invoice_id` (FK to invoices, ON DELETE CASCADE), `description` (text), `quantity` (numeric, default 1), `unit_price` (bigint - cents), `total` (bigint - cents), `phase_id` (FK to project_phases, nullable), `task_id` (FK to project_tasks, nullable), `created_at`
- Enable RLS: clients can SELECT invoices where `client_id` matches their user_id, admins can manage all
- Create indexes on `invoices.client_id`, `invoices.status`, `invoices.project_id`, `invoice_line_items.invoice_id`

**Database Schema - Payments & Refunds**
- Create `payment_status` enum with values: 'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'
- Create `payments` table with fields: `id` (UUID), `invoice_id` (FK to invoices), `amount` (bigint - cents), `currency` (text), `status` (payment_status), `stripe_payment_intent_id` (text unique), `stripe_charge_id` (text nullable), `paid_at` (timestamptz), `created_at`
- Create `refunds` table with fields: `id` (UUID), `payment_id` (FK to payments), `invoice_id` (FK to invoices), `amount` (bigint - cents), `reason` (text nullable), `stripe_refund_id` (text unique), `status` (text - 'pending', 'succeeded', 'failed'), `created_at`
- Enable RLS: clients can SELECT payments/refunds for their invoices, admins can manage all
- Create indexes on `payments.invoice_id`, `payments.stripe_payment_intent_id`, `refunds.payment_id`, `refunds.invoice_id`

**Database Schema - Subscriptions & Tax**
- Create `subscriptions` table with fields: `id` (UUID), `client_id` (FK to users), `project_id` (FK to projects, nullable), `stripe_subscription_id` (text unique), `stripe_price_id` (text), `status` (text - 'active', 'canceled', 'past_due'), `current_period_start` (timestamptz), `current_period_end` (timestamptz), `canceled_at` (timestamptz nullable), `created_at`, `updated_at`
- Create `tax_rates` table with fields: `id` (UUID), `name` (text), `rate` (numeric - percentage, e.g., 8.5 for 8.5%), `country` (text nullable), `state` (text nullable), `is_active` (boolean, default true), `created_at`, `updated_at`
- Enable RLS: admins can manage all, clients cannot access directly
- Add `estimated_cost` (bigint - cents, nullable) to `project_phases` and `project_tasks` tables for auto-calculation

**Stripe Integration - Checkout & Webhooks**
- Install `@stripe/stripe-js` and `stripe` packages for frontend and backend
- Create Supabase Edge Function `stripe-webhook` to handle Stripe webhook events (payment_intent.succeeded, checkout.session.completed, invoice.payment_succeeded, etc.)
- Verify webhook signatures using Stripe's signature verification
- Store Stripe customer IDs in `users` table (`stripe_customer_id` text nullable)
- Create Stripe Checkout sessions server-side via Edge Function or Express endpoint
- Handle redirect flow: client clicks "Pay Now" → redirects to Stripe Checkout → returns to success/cancel URL → update invoice status

**Admin Invoice Management**
- Create `/admin/invoices` route listing all invoices with filters: status, client, project, date range
- Create `/admin/invoices/new` route with invoice creation form
- Form includes: client selection, project selection (optional), auto-populate line items from project phases/tasks with `estimated_cost`, manual line item addition, discount input, tax rate selection, due date picker, notes field
- Auto-calculate totals: subtotal from line items, apply discount, calculate tax, display final total
- Create `/admin/invoices/:id/edit` route for editing draft invoices
- "Send Invoice" button triggers email delivery and updates status to 'sent'
- Display payment history, refunds, and subscription links on invoice detail view

**Client Billing Dashboard**
- Add "Billing" tab to ClientLayout navigation (between Portfolio and Settings)
- Create `/dashboard/billing` route showing invoice list with status badges, filters (all/paid/unpaid/overdue), sort options (date, amount, status)
- Display billing summary widget on `/dashboard` home page showing: total outstanding, overdue count, recent payments, next due invoice
- Create `/dashboard/billing/:id` route for invoice detail view with line items, payment history, "Pay Now" button (if unpaid), "Request Quote" button (simple implementation)
- Add billing section to `/dashboard/projects/:id` showing project-specific invoices with status and payment links

**Payment Processing Flow**
- Client clicks "Pay Now" on invoice → creates Stripe Checkout session via Edge Function → redirects to Stripe-hosted page
- Support one-time payments: full amount or partial payment (client enters amount)
- Support recurring payments: create Stripe subscription from invoice, link to `subscriptions` table
- After successful payment: webhook updates invoice status, creates payment record, sends email confirmation, creates in-app notification, logs activity
- Handle payment failures: show error message, allow retry, update invoice status appropriately

**PDF Generation & Email Delivery**
- Create Supabase Edge Function `generate-invoice-pdf` that generates PDF invoices with: business details, client details, invoice number, line items table, subtotal/discount/tax/total breakdown, due date, payment instructions
- Create Edge Function `generate-receipt-pdf` for payment confirmations
- Use PDF library (e.g., `pdfkit` or `puppeteer`) server-side
- Brand-consistent styling matching application theme
- Email delivery: send invoice PDF as attachment or link via existing email infrastructure, send payment confirmation with receipt PDF

**Notifications & Activity Logging**
- Extend `notification_type` enum to include: 'invoice_sent', 'payment_received', 'payment_failed', 'invoice_overdue', 'refund_processed'
- Create notifications for: invoice sent, payment received, payment failed, invoice overdue (scheduled check), refund processed
- Extend `activity_log_event_type` enum to include: 'invoice_created', 'invoice_sent', 'payment_received', 'refund_processed'
- Log all invoice and payment events to activity log with relevant metadata (invoice_id, amount, etc.)

**Refunds & Credits Management**
- Create `/admin/invoices/:id/refund` route for processing refunds
- Form includes: refund amount (full or partial), reason selection, confirmation
- Process refund via Stripe API, create refund record, update payment and invoice status
- Display refund history on invoice detail page
- Support credit memos: create negative invoice or credit balance tracking (future enhancement)

**Multi-Currency & Tax Calculation**
- Store currency code with each invoice (default 'usd', configurable)
- Display amounts in invoice currency with currency symbol
- Support currency conversion display (optional, for future)
- Tax calculation: select tax rate from `tax_rates` table, apply to subtotal after discount, store tax amount separately
- Admin can configure tax rates per country/state in `/admin/settings/tax-rates`

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**ClientLayout (`src/layouts/ClientLayout.tsx`)**
- Add "Billing" navigation item to `clientNavLinks` array following existing pattern
- Reuse top navigation bar structure, mobile menu, and user dropdown patterns
- Follow same styling: zinc-950 background, indigo accents, responsive design

**Notification System (`src/lib/db/notifications.ts`, `src/components/client/NotificationBell.tsx`)**
- Extend `NotificationType` enum in `src/lib/db/types/dashboard.ts` with payment-related types
- Use `createNotification()` function for payment events
- Reuse `NotificationBell` component and dropdown patterns for payment notifications
- Follow same notification display and "mark as read" patterns

**Activity Logging (`src/lib/db/activityLog.ts`)**
- Extend `ActivityLogEventType` enum with invoice/payment events
- Use `logActivity()` function for all payment-related activities
- Reuse activity feed components (`ActivityFeed`, `ProjectActivityTimeline`) to display payment history
- Follow same JSONB `event_data` pattern for storing invoice/payment metadata

**Form Patterns (`src/components/admin/ProjectForm.tsx`)**
- Reuse React Hook Form + Zod validation patterns for invoice creation form
- Follow same field structure: Input, Textarea, Select components from shadcn/ui
- Reuse `useFieldArray` for dynamic line items (similar to tech stack array)
- Follow same error handling, loading states, and toast notification patterns

**Database Patterns (`src/lib/db/projects.ts`, `src/lib/db/notifications.ts`)**
- Follow TypeScript interface patterns for invoice/payment types in `src/lib/db/types/`
- Replicate Supabase query patterns: `.select()`, `.insert()`, `.update()`, `.eq()`, `.order()`
- Use same error handling: `if (error) throw new Error(...)`
- Follow RLS policy patterns from existing migrations for client/admin access control

## Out of Scope

- Full quote builder workflow with guided service selection (Phase 9 spec)
- Price estimation calculator and structured request pipeline (Phase 9 spec)
- Real-time direct messaging/chat between client and admin (Phase 8 spec)
- Advanced subscription plan management UI (basic subscription creation only)
- Automatic payment retry logic for failed payments
- Payment method storage and saved cards UI (Stripe handles this in Checkout)
- Invoice scheduling and automated recurring invoice generation
- Multi-currency conversion rates API integration (currency display only)
- Advanced tax calculation with address-based tax lookup
- Credit balance management system (basic refunds only)

