-- Down Migration: Remove invoices and invoice_line_items tables
-- Task Group 1: Invoice Schema & Migrations

-- Drop policies for invoice_line_items
DROP POLICY IF EXISTS "Clients can view line items for their invoices" ON invoice_line_items;
DROP POLICY IF EXISTS "Admins can manage all line items" ON invoice_line_items;
DROP POLICY IF EXISTS "Service role full access on invoice_line_items" ON invoice_line_items;

-- Drop policies for invoices
DROP POLICY IF EXISTS "Clients can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
DROP POLICY IF EXISTS "Service role full access on invoices" ON invoices;

-- Drop trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

-- Drop indexes for invoice_line_items
DROP INDEX IF EXISTS idx_invoice_line_items_task_id;
DROP INDEX IF EXISTS idx_invoice_line_items_phase_id;
DROP INDEX IF EXISTS idx_invoice_line_items_invoice_id;

-- Drop indexes for invoices
DROP INDEX IF EXISTS idx_invoices_invoice_number;
DROP INDEX IF EXISTS idx_invoices_project_id;
DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_invoices_client_id;

-- Drop tables
DROP TABLE IF EXISTS invoice_line_items;
DROP TABLE IF EXISTS invoices;

-- Drop enum type
DROP TYPE IF EXISTS invoice_status;

