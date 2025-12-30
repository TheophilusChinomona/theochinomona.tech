-- Rollback: Remove project approval fields

-- Drop policies
DROP POLICY IF EXISTS "Clients can view projects they created" ON projects;
DROP POLICY IF EXISTS "Clients can view their own projects" ON projects;

-- Recreate original public policy
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  USING (status = 'published');

-- Drop indexes
DROP INDEX IF EXISTS idx_projects_invoice_id;
DROP INDEX IF EXISTS idx_projects_requires_payment;
DROP INDEX IF EXISTS idx_projects_created_by;

-- Drop columns
ALTER TABLE projects
DROP COLUMN IF EXISTS invoice_id,
DROP COLUMN IF EXISTS deposit_paid,
DROP COLUMN IF EXISTS requires_payment,
DROP COLUMN IF EXISTS payment_preference,
DROP COLUMN IF EXISTS created_by;

-- Drop enum type
DROP TYPE IF EXISTS payment_preference;

