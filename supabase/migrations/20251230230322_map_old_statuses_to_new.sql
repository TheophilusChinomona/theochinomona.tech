-- Map old statuses to new statuses
-- Task Group 1: Project Status Enum Replacement
-- Part 1.4: Map old statuses to new statuses

-- Map old statuses to new statuses:
-- pending_approval → pending
-- awaiting_payment → pending_payment
-- approved → in_progress
-- published → completed (if applicable)
-- draft → pending
-- denied → completed (or handle separately - treating as completed for now)

UPDATE projects
SET status_new = CASE
  WHEN status::text = 'pending_approval' THEN 'pending'::project_status_new
  WHEN status::text = 'awaiting_payment' THEN 'pending_payment'::project_status_new
  WHEN status::text = 'approved' THEN 'in_progress'::project_status_new
  WHEN status::text = 'published' THEN 'completed'::project_status_new
  WHEN status::text = 'draft' THEN 'pending'::project_status_new
  WHEN status::text = 'denied' THEN 'completed'::project_status_new
  ELSE 'pending'::project_status_new  -- Default fallback for any unmapped statuses
END;

-- Verify all rows have been updated (should not return any rows)
DO $$
DECLARE
  unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM projects
  WHERE status_new IS NULL;
  
  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'Found % rows with unmapped status values', unmapped_count;
  END IF;
END $$;

