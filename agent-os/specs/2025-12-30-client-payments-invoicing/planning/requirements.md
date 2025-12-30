# Spec Requirements: Client Payments & Invoicing

## Initial Description

Stripe integration for payment gateway, invoice management, payment status, and checkout flow.

## Requirements Discussion

### First Round Questions

**Q1:** I assume invoices will be created by the admin and sent to clients (not client-initiated). Is that correct, or should clients also be able to request invoices/quotes?
**Answer:** Clients should be able to request invoices or quotes (Phase 9 features tie-in).

**Q2:** I'm thinking payments will be one-time invoices tied to specific projects or milestones. Should we also support recurring payments (e.g., monthly retainer fees)?
**Answer:** Yes, support recurring payments.

**Q3:** For the checkout flow, I assume clients will click a "Pay Now" button on their invoice that redirects to a Stripe-hosted checkout page (Stripe Checkout). Should we instead build a custom embedded checkout form within the app?
**Answer:** Stripe Checkout (redirect) is fine. Recommended for faster implementation, mobile optimization, PCI compliance, and built-in Apple Pay/Google Pay support.

**Q4:** I assume the admin should be able to: Create invoices with line items, send invoices to clients via email, track payment status (Draft → Sent → Paid → Overdue). Is this correct?
**Answer:** Yes to all admin capabilities.

**Q5:** For payment status tracking, I'm thinking the client dashboard should show: A dedicated "Billing" or "Invoices" tab, list of all invoices with status badges, payment history and receipts. Should there also be a summary widget on the main dashboard?
**Answer:** Yes to all, including summary widget on main dashboard.

**Q6:** When a payment is completed, should we: Send email confirmation, create in-app notification, log activity, generate downloadable PDF receipts/invoices?
**Answer:** Yes to all (email confirmation, in-app notification, activity log, and PDF receipts).

**Q7:** Should invoice amounts be auto-calculated from project phases/tasks, or will the admin manually enter amounts for each invoice?
**Answer:** Auto-calculate from project phases/tasks, then admin can approve client quote or adjust/give discounts.

**Q8:** What should be out of scope for initial implementation?
**Answer:** ALL in scope: Refunds/credits, partial payments, multiple currencies, subscription management, tax calculation.

### Existing Code to Reference

No similar existing features identified for reference. However, the following existing patterns should be leveraged:
- Client Dashboard components and layout (`src/components/client/`)
- Notification system (`src/lib/db/notifications.ts`)
- Activity log patterns (`src/lib/db/activityLog.ts`)
- Form patterns from project/phase creation (`src/components/admin/`)

### Follow-up Questions

**Follow-up 1:** For client quote requests, should we build admin-only invoicing or include a simple "Request Quote" button for clients now?
**Answer:** Option B - Include a simple "Request Quote" button for clients now, to be expanded in Phase 9.

**Follow-up 2:** With all features in scope, should we build everything in one spec or split into phases?
**Answer:** Option A - Build everything in one spec (comprehensive implementation).

**Follow-up 3:** For auto-calculating invoice amounts, should we add pricing fields to existing tables or create a separate line_items table?
**Answer:** Create a separate `line_items` table for flexible invoice composition.

**Additional Requirement:** Clients should be able to see invoicing and billing per project (project-specific billing view within project detail page).

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - No mockups or wireframes provided. Implementation should follow existing Client Dashboard design patterns and brand guide.

## Requirements Summary

### Functional Requirements

#### Admin Capabilities
- Create invoices with flexible line items
- Auto-populate line items from project phases/tasks with pricing
- Adjust amounts and apply discounts
- Send invoices to clients via email
- Track invoice status (Draft → Sent → Paid → Partially Paid → Overdue → Refunded)
- Process refunds and credits
- View all invoices across all clients
- Manage subscription/recurring payments
- Configure tax rates and apply tax calculation

#### Client Capabilities
- View dedicated "Billing" or "Invoices" tab in dashboard
- See billing summary widget on main dashboard
- View invoices list with status badges
- View billing per project (project-specific billing view)
- Pay invoices via Stripe Checkout (redirect)
- Make partial payments
- View payment history and receipts
- Download PDF invoices and receipts
- Request quotes (simple button, expanded in Phase 9)
- Pay in multiple currencies

#### Checkout Flow
- Stripe-hosted Checkout (redirect) for payments
- Support for one-time payments
- Support for recurring/subscription payments
- Apple Pay and Google Pay support (via Stripe)

#### Notifications & Activity
- Email confirmation on payment completion
- In-app notification on payment events
- Activity log entries for all payment actions
- Email invoice delivery to clients

#### PDF Generation
- Downloadable PDF invoices
- Downloadable PDF receipts

### Database Design

#### New Tables Required
- `invoices` - Invoice records with status, totals, due dates
- `invoice_line_items` - Flexible line items for each invoice
- `payments` - Payment records linked to invoices
- `payment_methods` - Stored payment methods (optional)
- `subscriptions` - Recurring payment subscriptions
- `tax_rates` - Configurable tax rates
- `refunds` - Refund records

#### Existing Table Modifications
- `project_phases` - May need `estimated_cost` field for auto-calculation
- `project_tasks` - May need `estimated_cost` field for auto-calculation

### Reusability Opportunities
- Client Dashboard layout and components
- Notification system infrastructure
- Activity logging patterns
- Form components from admin dashboard
- Card/list UI patterns from project management

### Scope Boundaries

**In Scope:**
- Complete Stripe integration (Checkout, webhooks, customer management)
- Invoice CRUD (create, read, update, delete/archive)
- Line items table for flexible composition
- Auto-calculation from project phases/tasks
- Manual adjustment and discounts
- Email invoice delivery
- Payment processing via Stripe Checkout
- Recurring/subscription payments
- Partial payments
- Multiple currencies
- Tax calculation
- Refunds and credits
- Payment status tracking
- Client billing dashboard tab
- Project-specific billing view
- Dashboard billing summary widget
- PDF invoice generation
- PDF receipt generation
- Email payment confirmations
- In-app notifications for payment events
- Activity logging for all payment actions
- Simple "Request Quote" button for clients

**Out of Scope:**
- Full quote builder workflow (Phase 9)
- Guided service selection (Phase 9)
- Price estimation calculator (Phase 9)
- Structured request pipeline (Phase 9)

### Technical Considerations

#### Stripe Integration
- Use Stripe Checkout for payment UI
- Implement Stripe webhooks for payment status updates
- Store Stripe customer IDs with user records
- Handle webhook signature verification
- Support test mode and live mode

#### Security
- Never store raw card data (Stripe handles PCI compliance)
- Validate webhook signatures
- RLS policies for invoice/payment access
- Admin-only endpoints for sensitive operations

#### PDF Generation
- Consider server-side PDF generation (Edge Function)
- Include business details, line items, totals, tax
- Brand-consistent styling

#### Email Delivery
- Invoice delivery emails with PDF attachment or link
- Payment confirmation emails
- Payment reminder emails for overdue invoices

#### Currency Handling
- Store amounts in smallest currency unit (cents)
- Support currency conversion display
- Default currency with multi-currency option

#### Subscription Management
- Stripe Billing for recurring payments
- Handle subscription lifecycle (create, update, cancel)
- Proration handling for plan changes

