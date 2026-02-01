-- Rollback: Restore old status column
-- Task Group 1: Project Status Enum Replacement
-- Note: This rollback is complex and may require manual intervention

-- Step 1: Rename status back to status_new
ALTER TABLE projects
RENAME COLUMN status TO status_new;

-- Step 2: Recreate old enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('draft', 'published', 'pending_approval', 'awaiting_payment', 'approved', 'denied');
  END IF;
END $$;

-- Step 3: Add old status column back
ALTER TABLE projects
ADD COLUMN status project_status;

-- Step 4: Map status_new back to status (reverse mapping)
-- Note: This is a best-effort reverse mapping, some data may be lost
UPDATE projects
SET status = CASE
  WHEN status_new::text = 'pending' THEN 'pending_approval'::project_status
  WHEN status_new::text = 'pending_payment' THEN 'awaiting_payment'::project_status
  WHEN status_new::text = 'in_progress' THEN 'approved'::project_status
  WHEN status_new::text = 'completed' THEN 'published'::project_status
  ELSE 'draft'::project_status
END;

-- Step 5: Make status NOT NULL and set default
ALTER TABLE projects
ALTER COLUMN status SET NOT NULL;
ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'draft'::project_status;

-- Step 6: Drop status_new column
ALTER TABLE projects
DROP COLUMN status_new;

