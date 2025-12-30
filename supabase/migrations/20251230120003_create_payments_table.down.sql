-- Down Migration: Remove payments and refunds tables
-- Task Group 2: Payment & Refund Schema & Migrations

-- Drop policies for refunds
DROP POLICY IF EXISTS "Clients can view refunds for their invoices" ON refunds;
DROP POLICY IF EXISTS "Admins can manage all refunds" ON refunds;
DROP POLICY IF EXISTS "Service role full access on refunds" ON refunds;

-- Drop policies for payments
DROP POLICY IF EXISTS "Clients can view payments for their invoices" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
DROP POLICY IF EXISTS "Service role full access on payments" ON payments;

-- Drop indexes for refunds
DROP INDEX IF EXISTS idx_refunds_status;
DROP INDEX IF EXISTS idx_refunds_stripe_refund_id;
DROP INDEX IF EXISTS idx_refunds_invoice_id;
DROP INDEX IF EXISTS idx_refunds_payment_id;

-- Drop indexes for payments
DROP INDEX IF EXISTS idx_payments_created_at;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_stripe_payment_intent_id;
DROP INDEX IF EXISTS idx_payments_invoice_id;

-- Drop tables
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payments;

-- Drop enum type
DROP TYPE IF EXISTS payment_status;

