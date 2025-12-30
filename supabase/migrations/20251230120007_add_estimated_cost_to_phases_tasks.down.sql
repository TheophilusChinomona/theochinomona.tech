-- Down Migration: Remove estimated_cost from project_phases and project_tasks
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Remove estimated_cost column from project_tasks
ALTER TABLE project_tasks
  DROP COLUMN IF EXISTS estimated_cost;

-- Remove estimated_cost column from project_phases
ALTER TABLE project_phases
  DROP COLUMN IF EXISTS estimated_cost;

