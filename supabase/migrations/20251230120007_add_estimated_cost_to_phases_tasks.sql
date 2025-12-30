-- Migration: Add estimated_cost to project_phases and project_tasks
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Add estimated_cost column to project_phases table
ALTER TABLE project_phases
  ADD COLUMN estimated_cost BIGINT; -- Amount in cents, nullable

-- Add estimated_cost column to project_tasks table
ALTER TABLE project_tasks
  ADD COLUMN estimated_cost BIGINT; -- Amount in cents, nullable

-- Add comments for documentation
COMMENT ON COLUMN project_phases.estimated_cost IS 'Estimated cost for this phase in cents (smallest currency unit)';
COMMENT ON COLUMN project_tasks.estimated_cost IS 'Estimated cost for this task in cents (smallest currency unit)';

