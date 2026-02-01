-- Add is_hiring_request field to projects table
-- Task Group 2: Projects Table Updates
-- Part 2.2: Add is_hiring_request field

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_hiring_request BOOLEAN NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN projects.is_hiring_request IS 'Indicates if client is hiring vs suggesting project (affects admin prioritization)';

