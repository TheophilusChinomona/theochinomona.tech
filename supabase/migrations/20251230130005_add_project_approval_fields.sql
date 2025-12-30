-- Add new fields to projects table for approval workflow
-- Task Group 2: Projects Table Updates & Migrations

-- Create payment_preference enum type
CREATE TYPE payment_preference AS ENUM ('upfront_deposit', 'milestone_based');

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_preference payment_preference,
ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_requires_payment ON projects(requires_payment);
CREATE INDEX IF NOT EXISTS idx_projects_invoice_id ON projects(invoice_id);

-- Update RLS policies to allow clients to view projects where they are client_id OR created_by
-- Note: We need to update the existing "Public can view published projects" policy
-- to also allow clients to view their own projects regardless of status

-- Drop existing public policy (we'll recreate it)
DROP POLICY IF EXISTS "Public can view published projects" ON projects;

-- Recreate public policy for published projects
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'published');

-- Add policy for clients to view their own projects (where client_id matches)
CREATE POLICY "Clients can view their own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.client_id
      AND auth_user_id = auth.uid()
    )
  );

-- Add policy for clients to view projects they created (where created_by matches)
CREATE POLICY "Clients can view projects they created"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = projects.created_by
      AND auth_user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON COLUMN projects.created_by IS 'User who created the project (admin or client)';
COMMENT ON COLUMN projects.payment_preference IS 'Client payment preference: upfront_deposit or milestone_based';
COMMENT ON COLUMN projects.requires_payment IS 'Whether payment is required (set by admin during review)';
COMMENT ON COLUMN projects.deposit_paid IS 'Whether deposit has been paid';
COMMENT ON COLUMN projects.invoice_id IS 'Linked deposit invoice (only if payment required)';

