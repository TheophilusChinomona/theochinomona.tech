-- Create new project_status_new enum type
-- Task Group 1: Project Status Enum Replacement
-- Part 1.2: Create new project_status_new enum type

CREATE TYPE project_status_new AS ENUM (
  'pending',
  'pending_payment',
  'pending_info',
  'in_progress',
  'in_testing',
  'completed'
);

-- Add comment
COMMENT ON TYPE project_status_new IS 'Unified project status: pending, pending_payment, pending_info, in_progress, in_testing, completed';

