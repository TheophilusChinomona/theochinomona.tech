-- Replace old status column with new
-- Task Group 1: Project Status Enum Replacement
-- Part 1.5: Replace old status column with new

-- Step 1: Drop the old status column
ALTER TABLE projects
DROP COLUMN status;

-- Step 2: Rename status_new to status
ALTER TABLE projects
RENAME COLUMN status_new TO status;

-- Step 3: Make status NOT NULL (since all rows should have values)
ALTER TABLE projects
ALTER COLUMN status SET NOT NULL;

-- Step 4: Set default value
ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'pending'::project_status_new;

-- Step 5: Drop old enum type (only if no other tables reference it)
-- Note: We check if any other tables use project_status before dropping
DO $$
DECLARE
  enum_usage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO enum_usage_count
  FROM information_schema.columns
  WHERE udt_name = 'project_status'
  AND table_name != 'projects';
  
  IF enum_usage_count = 0 THEN
    DROP TYPE IF EXISTS project_status;
  ELSE
    RAISE NOTICE 'Cannot drop project_status enum: still used by % other table(s)', enum_usage_count;
  END IF;
END $$;

-- Update comment
COMMENT ON COLUMN projects.status IS 'Unified project status: pending, pending_payment, pending_info, in_progress, in_testing, completed';

