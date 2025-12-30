-- Extend project_status enum to include new values
-- Task Group 2: Projects Table Updates & Migrations

-- Add new enum values to existing project_status enum
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'awaiting_payment';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'denied';

-- Add comment
COMMENT ON TYPE project_status IS 'Project status: draft, published, pending_approval, awaiting_payment, approved, denied';

