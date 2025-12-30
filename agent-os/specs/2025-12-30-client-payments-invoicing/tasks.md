# Task Breakdown: Client Payments & Invoicing

## Overview
Total Tasks: 12 Task Groups

## Task List

### Database Layer

#### Task Group 1: Invoice Schema & Migrations
**Dependencies:** None

- [x] 1.0 Complete invoice database schema
  - [x] 1.1 Write 4-5 focused tests for invoice schema
    - Test: invoice_status enum accepts only valid values ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'refunded', 'cancelled')
    - Test: invoices table exists with all required columns
    - Test: invoice_number is unique
    - Test: RLS policies allow clients to SELECT invoices where client_id matches
    - Test: RLS policies allow admins to manage all invoices
  - [x] 1.2 Create invoice_status enum type
    - Create enum: `CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'refunded', 'cancelled')`
  - [x] 1.3 Create invoices table migration
    - Create migration file: `supabase/migrations/20251230120001_create_invoices_table.sql`
    - Table fields: `id` (UUID, primary key), `project_id` (UUID, FK to projects, nullable), `client_id` (UUID, FK to users), `invoice_number` (TEXT, unique), `status` (invoice_status, default 'draft'), `subtotal` (BIGINT - cents), `discount_amount` (BIGINT, default 0), `tax_amount` (BIGINT, default 0), `total` (BIGINT - cents), `currency` (TEXT, default 'usd'), `due_date` (DATE), `sent_at` (TIMESTAMPTZ nullable), `paid_at` (TIMESTAMPTZ nullable), `stripe_checkout_session_id` (TEXT nullable), `stripe_payment_intent_id` (TEXT nullable), `notes` (TEXT nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraints with appropriate ON DELETE behavior
    - Add unique constraint on invoice_number
    - Add updated_at trigger using existing `update_updated_at_column()` function
  - [x] 1.4 Create invoice_line_items table migration
    - Create migration file: `supabase/migrations/20251230120002_create_invoice_line_items_table.sql`
    - Table fields: `id` (UUID, primary key), `invoice_id` (UUID, FK to invoices, ON DELETE CASCADE), `description` (TEXT), `quantity` (NUMERIC, default 1), `unit_price` (BIGINT - cents), `total` (BIGINT - cents), `phase_id` (UUID, FK to project_phases, nullable), `task_id` (UUID, FK to project_tasks, nullable), `created_at` (TIMESTAMPTZ)
    - Add FK constraints
  - [x] 1.5 Create indexes for invoices
    - Create index on `invoices.client_id`
    - Create index on `invoices.status`
    - Create index on `invoices.project_id`
    - Create index on `invoices.invoice_number`
    - Create index on `invoice_line_items.invoice_id`
  - [x] 1.6 Create RLS policies for invoices
    - Enable RLS on invoices and invoice_line_items tables
    - Policy: Clients can SELECT invoices where `client_id` matches their user_id
    - Policy: Admins can SELECT/INSERT/UPDATE/DELETE all invoices
    - Policy: Service role full access for backend operations
  - [x] 1.7 Ensure invoice schema tests pass
    - Run ONLY the 4-5 tests written in 1.1
    - Verify migrations run successfully

**Acceptance Criteria:**
- The 4-5 tests written in 1.1 pass
- Invoices and invoice_line_items tables created with proper schema
- RLS enforces client access to only their invoices
- Invoice numbers are unique

---

#### Task Group 2: Payment & Refund Schema & Migrations
**Dependencies:** Task Group 1

- [x] 2.0 Complete payment and refund database schema
  - [x] 2.1 Write 4-5 focused tests for payment schema
    - Test: payment_status enum accepts only valid values
    - Test: payments table exists with all required columns
    - Test: stripe_payment_intent_id is unique
    - Test: RLS policies allow clients to SELECT payments for their invoices
    - Test: RLS policies allow admins to manage all payments
  - [x] 2.2 Create payment_status enum type
    - Create enum: `CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded')`
  - [x] 2.3 Create payments table migration
    - Create migration file: `supabase/migrations/20251230120003_create_payments_table.sql`
    - Table fields: `id` (UUID, primary key), `invoice_id` (UUID, FK to invoices), `amount` (BIGINT - cents), `currency` (TEXT), `status` (payment_status), `stripe_payment_intent_id` (TEXT unique), `stripe_charge_id` (TEXT nullable), `paid_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ)
    - Add FK constraint to invoices
    - Add unique constraint on stripe_payment_intent_id
  - [x] 2.4 Create refunds table migration
    - Create migration file: `supabase/migrations/20251230120004_create_refunds_table.sql`
    - Table fields: `id` (UUID, primary key), `payment_id` (UUID, FK to payments), `invoice_id` (UUID, FK to invoices), `amount` (BIGINT - cents), `reason` (TEXT nullable), `stripe_refund_id` (TEXT unique), `status` (TEXT - 'pending', 'succeeded', 'failed'), `created_at` (TIMESTAMPTZ)
    - Add FK constraints
    - Add unique constraint on stripe_refund_id
  - [x] 2.5 Create indexes for payments and refunds
    - Create index on `payments.invoice_id`
    - Create index on `payments.stripe_payment_intent_id`
    - Create index on `refunds.payment_id`
    - Create index on `refunds.invoice_id`
  - [x] 2.6 Create RLS policies for payments and refunds
    - Enable RLS on payments and refunds tables
    - Policy: Clients can SELECT payments/refunds for their invoices (via invoice.client_id)
    - Policy: Admins can SELECT/INSERT/UPDATE all payments and refunds
    - Policy: Service role full access
  - [x] 2.7 Ensure payment schema tests pass
    - Run ONLY the 4-5 tests written in 2.1
    - Verify migrations run successfully

**Acceptance Criteria:**
- The 4-5 tests written in 2.1 pass
- Payments and refunds tables created with proper schema
- RLS enforces client access to only their invoice payments
- Stripe IDs are unique

---

#### Task Group 3: Subscription & Tax Schema & Migrations
**Dependencies:** None

- [x] 3.0 Complete subscription and tax database schema
  - [x] 3.1 Write 4-5 focused tests for subscription and tax schema
    - Test: subscriptions table exists with all required columns
    - Test: stripe_subscription_id is unique
    - Test: tax_rates table exists with rate as numeric percentage
    - Test: RLS policies allow only admins to manage subscriptions and tax rates
    - Test: estimated_cost fields added to project_phases and project_tasks
  - [x] 3.2 Create subscriptions table migration
    - Create migration file: `supabase/migrations/20251230120005_create_subscriptions_table.sql`
    - Table fields: `id` (UUID, primary key), `client_id` (UUID, FK to users), `project_id` (UUID, FK to projects, nullable), `stripe_subscription_id` (TEXT unique), `stripe_price_id` (TEXT), `status` (TEXT - 'active', 'canceled', 'past_due'), `current_period_start` (TIMESTAMPTZ), `current_period_end` (TIMESTAMPTZ), `canceled_at` (TIMESTAMPTZ nullable), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add FK constraints
    - Add unique constraint on stripe_subscription_id
    - Add updated_at trigger
  - [x] 3.3 Create tax_rates table migration
    - Create migration file: `supabase/migrations/20251230120006_create_tax_rates_table.sql`
    - Table fields: `id` (UUID, primary key), `name` (TEXT), `rate` (NUMERIC - percentage, e.g., 8.5 for 8.5%), `country` (TEXT nullable), `state` (TEXT nullable), `is_active` (BOOLEAN, default true), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)
    - Add updated_at trigger
  - [x] 3.4 Add estimated_cost to project_phases and project_tasks
    - Create migration file: `supabase/migrations/20251230120007_add_estimated_cost_to_phases_tasks.sql`
    - Add `estimated_cost` (BIGINT - cents, nullable) to `project_phases` table
    - Add `estimated_cost` (BIGINT - cents, nullable) to `project_tasks` table
  - [x] 3.5 Create indexes for subscriptions
    - Create index on `subscriptions.client_id`
    - Create index on `subscriptions.stripe_subscription_id`
    - Create index on `subscriptions.status`
  - [x] 3.6 Create RLS policies for subscriptions and tax rates
    - Enable RLS on subscriptions and tax_rates tables
    - Policy: Admins can manage all subscriptions and tax rates
    - Policy: Clients cannot access directly (no client policies)
    - Policy: Service role full access
  - [x] 3.7 Ensure subscription and tax schema tests pass
    - Run ONLY the 4-5 tests written in 3.1
    - Verify migrations run successfully

**Acceptance Criteria:**
- The 4-5 tests written in 3.1 pass
- Subscriptions and tax_rates tables created
- estimated_cost fields added to phases and tasks
- Only admins can manage subscriptions and tax rates

---

#### Task Group 4: Database Functions & Types
**Dependencies:** Task Groups 1-3

- [x] 4.0 Complete database access layer
  - [x] 4.1 Write 5-6 focused tests for invoice database functions
    - Test: createInvoice creates invoice with line items
    - Test: getInvoicesForClient returns only client's invoices
    - Test: updateInvoiceStatus updates status correctly
    - Test: getInvoiceWithLineItems includes all line items
    - Test: calculateInvoiceTotal computes subtotal, discount, tax, total correctly
  - [x] 4.2 Create TypeScript types for invoices
    - Create `src/lib/db/types/invoices.ts`
    - Define interfaces: `Invoice`, `InvoiceLineItem`, `CreateInvoiceInput`, `UpdateInvoiceInput`, `InvoiceStatus`
    - Export types for use across application
  - [x] 4.3 Create invoice database functions
    - Create `src/lib/db/invoices.ts`
    - Functions: `createInvoice()`, `getInvoiceById()`, `getInvoicesForClient()`, `getAllInvoices()`, `updateInvoice()`, `updateInvoiceStatus()`, `deleteInvoice()`, `getInvoiceWithLineItems()`
    - Follow patterns from `src/lib/db/projects.ts`
  - [x] 4.4 Create payment database functions
    - Create `src/lib/db/payments.ts`
    - Functions: `createPayment()`, `getPaymentsForInvoice()`, `getPaymentById()`, `updatePaymentStatus()`
  - [x] 4.5 Create refund database functions
    - Create `src/lib/db/refunds.ts`
    - Functions: `createRefund()`, `getRefundsForInvoice()`, `getRefundById()`, `updateRefundStatus()`
  - [x] 4.6 Create subscription database functions
    - Create `src/lib/db/subscriptions.ts`
    - Functions: `createSubscription()`, `getSubscriptionsForClient()`, `updateSubscriptionStatus()`, `cancelSubscription()`
  - [x] 4.7 Create tax rate database functions
    - Create `src/lib/db/taxRates.ts`
    - Functions: `getAllTaxRates()`, `createTaxRate()`, `updateTaxRate()`, `deleteTaxRate()`, `getActiveTaxRates()`
  - [x] 4.8 Extend notification and activity log types
    - Extend `NotificationType` enum in `src/lib/db/types/dashboard.ts` with: 'invoice_sent', 'payment_received', 'payment_failed', 'invoice_overdue', 'refund_processed'
    - Extend `ActivityLogEventType` enum with: 'invoice_created', 'invoice_sent', 'payment_received', 'refund_processed'
  - [x] 4.9 Ensure database function tests pass
    - Run ONLY the 5-6 tests written in 4.1
    - Verify all database functions work correctly

**Acceptance Criteria:**
- The 5-6 tests written in 4.1 pass
- All database functions created and working
- TypeScript types defined for all invoice/payment entities
- Notification and activity log types extended

---

### Stripe Integration

#### Task Group 5: Stripe Setup & Webhook Handler
**Dependencies:** Task Groups 1-4

- [x] 5.0 Complete Stripe integration setup
  - [x] 5.1 Write 4-5 focused tests for Stripe webhook handler
    - Test: Webhook signature verification works
    - Test: payment_intent.succeeded event updates invoice status
    - Test: checkout.session.completed creates payment record
    - Test: Invalid webhook signature is rejected
    - Test: Unknown event types are handled gracefully
  - [x] 5.2 Install Stripe packages
    - Install `@stripe/stripe-js` for frontend
    - Install `stripe` for backend/Edge Functions
    - Add to package.json dependencies
  - [x] 5.3 Add Stripe customer ID to users table
    - Create migration: `supabase/migrations/20251230120008_add_stripe_customer_id_to_users.sql`
    - Add `stripe_customer_id` (TEXT nullable) to users table
  - [x] 5.4 Create Stripe webhook Edge Function
    - Create `supabase/functions/stripe-webhook/index.ts`
    - Implement webhook signature verification using Stripe's method
    - Handle events: `payment_intent.succeeded`, `checkout.session.completed`, `invoice.payment_succeeded`, `charge.refunded`
    - Update invoice status, create payment records, trigger notifications
    - Follow existing Edge Function patterns (e.g., `send-phase-notification`)
  - [x] 5.5 Create Stripe checkout session Edge Function
    - Create `supabase/functions/create-checkout-session/index.ts`
    - Accept invoice_id and optional amount (for partial payments)
    - Create or retrieve Stripe customer
    - Create Stripe Checkout session with success/cancel URLs
    - Return session URL for redirect
  - [x] 5.6 Configure Stripe environment variables
    - Add `STRIPE_SECRET_KEY` to Supabase secrets
    - Add `STRIPE_WEBHOOK_SECRET` to Supabase secrets
    - Document in README or environment setup guide
  - [x] 5.7 Ensure Stripe integration tests pass
    - Run ONLY the 4-5 tests written in 5.1
    - Verify webhook handler processes events correctly

**Acceptance Criteria:**
- The 4-5 tests written in 5.1 pass
- Stripe packages installed
- Webhook handler verifies signatures and processes events
- Checkout session creation works
- Environment variables configured

---

#### Task Group 6: Payment Processing Flow
**Dependencies:** Task Group 5

- [x] 6.0 Complete payment processing implementation
  - [x] 6.1 Write 4-5 focused tests for payment flow
    - Test: "Pay Now" button creates checkout session
    - Test: Partial payment allows custom amount entry
    - Test: Successful payment redirect updates invoice status
    - Test: Payment failure shows error message
    - Test: Recurring payment creates subscription
  - [x] 6.2 Create payment API utilities
    - Create `src/lib/stripe.ts` for frontend Stripe client initialization
    - Create `src/lib/api/payments.ts` with functions: `createCheckoutSession()`, `handlePaymentSuccess()`, `handlePaymentCancel()`
  - [x] 6.3 Implement "Pay Now" button component
    - Create `src/components/client/PayInvoiceButton.tsx`
    - Handles full payment and partial payment options
    - Calls checkout session API
    - Redirects to Stripe Checkout
  - [x] 6.4 Implement payment success/cancel handlers
    - Update invoice detail page to handle success/cancel redirects
    - Show success message and update invoice status
    - Show cancel message and allow retry
  - [x] 6.5 Implement recurring payment flow
    - Add subscription option to invoice creation
    - Create Stripe subscription from invoice
    - Link subscription to invoice and store in subscriptions table
  - [x] 6.6 Ensure payment flow tests pass
    - Run ONLY the 4-5 tests written in 6.1
    - Verify payment flow works end-to-end

**Acceptance Criteria:**
- The 4-5 tests written in 6.1 pass
- Payment flow works for one-time and partial payments
- Recurring payments create subscriptions
- Success/cancel redirects handled properly

---

### Admin Interface

#### Task Group 7: Admin Invoice Management
**Dependencies:** Task Groups 1-6

- [x] 7.0 Complete admin invoice management UI
  - [x] 7.1 Write 5-6 focused tests for admin invoice UI
    - Test: Invoice list displays all invoices with filters
    - Test: Create invoice form validates required fields
    - Test: Auto-populate line items from project phases/tasks
    - Test: Invoice totals calculate correctly (subtotal, discount, tax, total)
    - Test: Send invoice button triggers email and updates status
    - Test: Edit invoice allows modification of draft invoices
  - [x] 7.2 Create invoice list page
    - Create `src/pages/admin/InvoiceListPage.tsx`
    - Display invoices in table with: invoice number, client, project, status, total, due date
    - Add filters: status, client, project, date range
    - Add sort options: date, amount, status
    - Follow pattern from `src/pages/admin/ProjectList.tsx`
  - [x] 7.3 Create invoice form component
    - Create `src/components/admin/InvoiceForm.tsx`
    - Fields: client selection, project selection (optional), due date, notes
    - Line items section with auto-populate from phases/tasks
    - Manual line item addition/editing
    - Discount input, tax rate selection
    - Auto-calculate totals display
    - Use React Hook Form + Zod validation
    - Follow pattern from `src/components/admin/ProjectForm.tsx`
  - [x] 7.4 Create invoice creation page
    - Create `src/pages/admin/CreateInvoicePage.tsx`
    - Use InvoiceForm component
    - Handle submit: create invoice with line items
    - Redirect to invoice detail on success
  - [x] 7.5 Create invoice edit page
    - Create `src/pages/admin/EditInvoicePage.tsx`
    - Load existing invoice data
    - Use InvoiceForm component with pre-filled data
    - Only allow editing of draft invoices
    - Handle submit: update invoice
  - [x] 7.6 Create invoice detail page
    - Create `src/pages/admin/InvoiceDetailPage.tsx`
    - Display invoice details, line items, payment history, refunds
    - "Send Invoice" button (if status is 'draft')
    - "Process Refund" button (if paid)
    - Link to subscription if applicable
  - [x] 7.7 Implement send invoice functionality
    - Create Edge Function or API endpoint to send invoice email
    - Generate PDF invoice
    - Send email with PDF attachment or link
    - Update invoice status to 'sent' and set sent_at timestamp
    - Create notification for client
    - Log activity
  - [x] 7.8 Add invoice routes
    - Update `src/routes.tsx` with admin invoice routes:
      - `/admin/invoices` - InvoiceListPage
      - `/admin/invoices/new` - CreateInvoicePage
      - `/admin/invoices/:id` - InvoiceDetailPage
      - `/admin/invoices/:id/edit` - EditInvoicePage
  - [x] 7.9 Ensure admin invoice UI tests pass
    - Run ONLY the 5-6 tests written in 7.1
    - Verify all admin invoice management features work

**Acceptance Criteria:**
- The 5-6 tests written in 7.1 pass
- Admin can create, view, edit, and send invoices
- Line items auto-populate from project phases/tasks
- Invoice totals calculate correctly
- Email delivery works

---

#### Task Group 8: Admin Refund & Tax Management
**Dependencies:** Task Groups 1-7

- [x] 8.0 Complete admin refund and tax management
  - [x] 8.1 Write 3-4 focused tests for refund and tax management
    - Test: Refund form validates amount and reason
    - Test: Refund processing creates refund record and updates payment status
    - Test: Tax rate CRUD operations work
    - Test: Tax calculation applies correctly to invoices
  - [x] 8.2 Create refund form component
    - Create `src/components/admin/RefundForm.tsx`
    - Fields: refund amount (full or partial), reason selection, confirmation
    - Validate amount doesn't exceed payment amount
  - [x] 8.3 Create refund processing page
    - Create `src/pages/admin/ProcessRefundPage.tsx`
    - Use RefundForm component
    - Process refund via Stripe API
    - Create refund record in database
    - Update payment and invoice status
    - Create notification and log activity
  - [x] 8.4 Create tax rates management page
    - Create `src/pages/admin/TaxRatesPage.tsx`
    - List all tax rates with: name, rate, country/state, active status
    - Create/Edit/Delete tax rates
    - Follow pattern from other admin management pages
  - [x] 8.5 Add refund and tax routes
    - Update `src/routes.tsx`:
      - `/admin/invoices/:id/refund` - ProcessRefundPage
      - `/admin/settings/tax-rates` - TaxRatesPage
  - [x] 8.6 Ensure refund and tax management tests pass
    - Run ONLY the 3-4 tests written in 8.1
    - Verify refund processing and tax management work

**Acceptance Criteria:**
- The 3-4 tests written in 8.1 pass
- Admin can process refunds
- Admin can manage tax rates
- Tax calculation applies to invoices

---

### Client Interface

#### Task Group 9: Client Billing Dashboard
**Dependencies:** Task Groups 1-8

- [x] 9.0 Complete client billing dashboard
  - [x] 9.1 Write 5-6 focused tests for client billing UI
    - Test: Billing tab appears in client navigation
    - Test: Invoice list displays client's invoices with status badges
    - Test: Invoice detail shows line items and payment history
    - Test: "Pay Now" button redirects to Stripe Checkout
    - Test: Billing summary widget displays on dashboard home
    - Test: Project detail page shows project-specific invoices
  - [x] 9.2 Add "Billing" to ClientLayout navigation
    - Update `src/layouts/ClientLayout.tsx`
    - Add "Billing" navigation item to `clientNavLinks` array (between Portfolio and Settings)
    - Use CreditCard icon from lucide-react
  - [x] 9.3 Create billing list page
    - Create `src/pages/client/BillingPage.tsx`
    - Display invoices in list/card format with: invoice number, status badge, total, due date, "Pay Now" button
    - Add filters: all/paid/unpaid/overdue
    - Add sort options: date, amount, status
    - Follow pattern from `src/pages/client/MyProjectsPage.tsx`
  - [x] 9.4 Create invoice detail page for clients
    - Create `src/pages/client/InvoiceDetailPage.tsx`
    - Display invoice details, line items, payment history
    - "Pay Now" button (if unpaid)
    - "Request Quote" button (simple implementation - creates notification for admin)
    - Download PDF invoice button
  - [x] 9.5 Create billing summary widget
    - Create `src/components/client/BillingSummaryWidget.tsx`
    - Display: total outstanding, overdue count, recent payments, next due invoice
    - Add to `src/pages/client/ClientDashboardHome.tsx`
  - [x] 9.6 Add billing section to project detail page
    - Update `src/pages/client/ClientProjectDetailPage.tsx`
    - Add billing section showing project-specific invoices
    - Display invoice status and payment links
  - [x] 9.7 Add client billing routes
    - Update `src/routes.tsx`:
      - `/dashboard/billing` - BillingPage
      - `/dashboard/billing/:id` - InvoiceDetailPage
  - [x] 9.8 Ensure client billing UI tests pass
    - Run ONLY the 5-6 tests written in 9.1
    - Verify all client billing features work

**Acceptance Criteria:**
- The 5-6 tests written in 9.1 pass
- Client can view invoices and billing information
- Payment flow works from client interface
- Billing summary displays on dashboard home
- Project-specific billing visible

---

### PDF Generation & Email

#### Task Group 10: PDF Generation & Email Delivery
**Dependencies:** Task Groups 1-9

- [x] 10.0 Complete PDF generation and email delivery
  - [x] 10.1 Write 3-4 focused tests for PDF generation
    - Test: Invoice PDF includes all required fields (business details, line items, totals)
    - Test: Receipt PDF includes payment details
    - Test: PDF styling matches brand guide
    - Test: PDF generation handles edge cases (no line items, zero amounts)
  - [x] 10.2 Create invoice PDF generation Edge Function
    - Create `supabase/functions/generate-invoice-pdf/index.ts`
    - Use PDF library (pdfkit or puppeteer)
    - Include: business details, client details, invoice number, line items table, subtotal/discount/tax/total breakdown, due date, payment instructions
    - Brand-consistent styling (colors, fonts from brand guide)
    - Return PDF as base64 or blob
  - [x] 10.3 Create receipt PDF generation Edge Function
    - Create `supabase/functions/generate-receipt-pdf/index.ts`
    - Include: payment details, invoice reference, receipt number, date
    - Brand-consistent styling
  - [x] 10.4 Create email delivery Edge Function
    - Create or extend `supabase/functions/send-invoice-email/index.ts`
    - Send invoice email with PDF attachment or link
    - Send payment confirmation email with receipt PDF
    - Use existing email infrastructure patterns
  - [x] 10.5 Integrate PDF generation with invoice sending
    - Update send invoice functionality to generate PDF
    - Attach PDF to email or include download link
  - [x] 10.6 Add PDF download buttons
    - Add "Download Invoice PDF" button to invoice detail pages (admin and client)
    - Add "Download Receipt PDF" button to payment history
    - Call PDF generation Edge Function and trigger download
  - [x] 10.7 Ensure PDF and email tests pass
    - Run ONLY the 3-4 tests written in 10.1
    - Verify PDFs generate correctly and emails send

**Acceptance Criteria:**
- The 3-4 tests written in 10.1 pass
- Invoice and receipt PDFs generate with correct content and styling
- Email delivery works with PDF attachments
- Download buttons work on invoice pages

---

### Notifications & Activity

#### Task Group 11: Payment Notifications & Activity Logging
**Dependencies:** Task Groups 1-10

- [ ] 11.0 Complete payment notifications and activity logging
  - [ ] 11.1 Write 3-4 focused tests for payment notifications
    - Test: Invoice sent creates notification for client
    - Test: Payment received creates notification and activity log
    - Test: Payment failed creates notification
    - Test: Refund processed creates notification and activity log
  - [ ] 11.2 Extend notification creation for payment events
    - Update invoice creation/sending to create 'invoice_sent' notification
    - Update payment processing to create 'payment_received' notification
    - Update payment failure handling to create 'payment_failed' notification
    - Update refund processing to create 'refund_processed' notification
    - Use existing `createNotification()` function from `src/lib/db/notifications.ts`
  - [ ] 11.3 Extend activity logging for payment events
    - Update invoice operations to log 'invoice_created', 'invoice_sent' events
    - Update payment operations to log 'payment_received' events
    - Update refund operations to log 'refund_processed' events
    - Use existing `logActivity()` function from `src/lib/db/activityLog.ts`
    - Include relevant metadata in event_data (invoice_id, amount, etc.)
  - [ ] 11.4 Update notification display
    - Ensure payment notifications display correctly in NotificationBell dropdown
    - Payment notifications should link to invoice detail page
    - Follow existing notification display patterns
  - [ ] 11.5 Update activity feed
    - Ensure payment activities display in ActivityFeed component
    - Payment activities should show in project activity timeline
    - Follow existing activity display patterns
  - [ ] 11.6 Ensure notification and activity tests pass
    - Run ONLY the 3-4 tests written in 11.1
    - Verify notifications and activity logs are created correctly

**Acceptance Criteria:**
- The 3-4 tests written in 11.1 pass
- All payment events create appropriate notifications
- All payment events are logged to activity log
- Notifications and activities display correctly in UI

---

### Testing

#### Task Group 12: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-11

- [ ] 12.0 Review existing tests and fill critical gaps only
  - [ ] 12.1 Review tests from Task Groups 1-11
    - Review the 4-5 tests written by database-engineer (Task 1.1, 2.1, 3.1, 4.1)
    - Review the 4-5 tests written by Stripe integration (Task 5.1, 6.1)
    - Review the 5-6 tests written by admin UI (Task 7.1, 8.1)
    - Review the 5-6 tests written by client UI (Task 9.1)
    - Review the 3-4 tests written by PDF/email (Task 10.1, 11.1)
    - Total existing tests: approximately 25-30 tests
  - [ ] 12.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus ONLY on gaps related to this spec's payment/invoicing requirements
    - Prioritize end-to-end workflows: invoice creation → payment → receipt
    - Do NOT assess entire application test coverage
  - [ ] 12.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points: Stripe webhook → database update, invoice creation → email delivery, payment → notification
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests, and accessibility tests unless business-critical
  - [ ] 12.4 Run feature-specific tests only
    - Run ONLY tests related to this spec's payment/invoicing feature (tests from 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, and 12.3)
    - Expected total: approximately 35-40 tests maximum
    - Do NOT run the entire application test suite
    - Verify critical workflows pass

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 35-40 tests total)
- Critical user workflows for payment/invoicing are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on this spec's payment/invoicing requirements

---

## Execution Order

Recommended implementation sequence:
1. Database Layer (Task Groups 1-4) - Foundation for all features
2. Stripe Integration (Task Groups 5-6) - Payment processing infrastructure
3. Admin Interface (Task Groups 7-8) - Invoice management and refunds
4. Client Interface (Task Group 9) - Client billing dashboard
5. PDF Generation & Email (Task Group 10) - Document generation and delivery
6. Notifications & Activity (Task Group 11) - User communication and tracking
7. Test Review & Gap Analysis (Task Group 12) - Quality assurance

**Note:** Some task groups can be worked on in parallel (e.g., Task Groups 7 and 9 can be developed simultaneously once database and Stripe integration are complete).

