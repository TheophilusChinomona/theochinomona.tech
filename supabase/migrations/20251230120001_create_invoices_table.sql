-- Migration: Create invoices and invoice_line_items tables
-- Task Group 1: Invoice Schema & Migrations

-- Create invoice_status enum type
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'refunded', 'cancelled');

-- Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  status invoice_status NOT NULL DEFAULT 'draft',
  subtotal BIGINT NOT NULL DEFAULT 0, -- Amount in cents
  discount_amount BIGINT NOT NULL DEFAULT 0, -- Amount in cents
  tax_amount BIGINT NOT NULL DEFAULT 0, -- Amount in cents
  total BIGINT NOT NULL DEFAULT 0, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create invoice_line_items table
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price BIGINT NOT NULL, -- Amount in cents
  total BIGINT NOT NULL, -- Amount in cents (quantity * unit_price)
  phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_phase_id ON invoice_line_items(phase_id);
CREATE INDEX idx_invoice_line_items_task_id ON invoice_line_items(task_id);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Clients can SELECT invoices where client_id matches their user_id
CREATE POLICY "Clients can view their own invoices"
  ON invoices FOR SELECT
  USING (
    client_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Admins can SELECT/INSERT/UPDATE/DELETE all invoices
CREATE POLICY "Admins can manage all invoices"
  ON invoices FOR ALL
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

-- RLS Policy: Service role full access for backend operations
CREATE POLICY "Service role full access on invoices"
  ON invoices FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policy: Clients can SELECT line items for their invoices
CREATE POLICY "Clients can view line items for their invoices"
  ON invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      JOIN users ON invoices.client_id = users.id
      WHERE invoices.id = invoice_line_items.invoice_id
        AND users.auth_user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can manage all line items
CREATE POLICY "Admins can manage all line items"
  ON invoice_line_items FOR ALL
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

-- RLS Policy: Service role full access on line items
CREATE POLICY "Service role full access on invoice_line_items"
  ON invoice_line_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE invoices IS 'Invoice records with status, totals, and Stripe integration';
COMMENT ON COLUMN invoices.subtotal IS 'Subtotal amount in cents (smallest currency unit)';
COMMENT ON COLUMN invoices.discount_amount IS 'Discount amount in cents';
COMMENT ON COLUMN invoices.tax_amount IS 'Tax amount in cents';
COMMENT ON COLUMN invoices.total IS 'Total amount in cents (subtotal - discount + tax)';
COMMENT ON COLUMN invoices.currency IS 'Currency code (e.g., usd, eur)';
COMMENT ON COLUMN invoice_line_items.unit_price IS 'Unit price in cents';
COMMENT ON COLUMN invoice_line_items.total IS 'Line total in cents (quantity * unit_price)';

