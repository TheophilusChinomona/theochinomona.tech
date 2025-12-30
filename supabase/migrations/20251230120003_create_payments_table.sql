-- Migration: Create payments and refunds tables
-- Task Group 2: Payment & Refund Schema & Migrations

-- Create payment_status enum type
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL, -- Amount in cents
  currency TEXT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create refunds table
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL, -- Amount in cents
  reason TEXT,
  stripe_refund_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_invoice_id ON refunds(invoice_id);
CREATE INDEX idx_refunds_stripe_refund_id ON refunds(stripe_refund_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can SELECT payments for their invoices
CREATE POLICY "Clients can view payments for their invoices"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN users ON invoices.client_id = users.id
      WHERE invoices.id = payments.invoice_id
        AND users.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can SELECT/INSERT/UPDATE all payments
CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on payments
CREATE POLICY "Service role full access on payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policy: Clients can SELECT refunds for their invoices
CREATE POLICY "Clients can view refunds for their invoices"
  ON refunds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN users ON invoices.client_id = users.id
      WHERE invoices.id = refunds.invoice_id
        AND users.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can SELECT/INSERT/UPDATE all refunds
CREATE POLICY "Admins can manage all refunds"
  ON refunds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on refunds
CREATE POLICY "Service role full access on refunds"
  ON refunds FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Payment records linked to invoices with Stripe integration';
COMMENT ON COLUMN payments.amount IS 'Payment amount in cents (smallest currency unit)';
COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'Unique Stripe payment intent identifier';
COMMENT ON TABLE refunds IS 'Refund records for payments';
COMMENT ON COLUMN refunds.amount IS 'Refund amount in cents';
COMMENT ON COLUMN refunds.stripe_refund_id IS 'Unique Stripe refund identifier';

