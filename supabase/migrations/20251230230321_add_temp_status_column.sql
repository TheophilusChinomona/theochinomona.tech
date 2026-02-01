-- Add temporary status_new column to projects table
-- Task Group 1: Project Status Enum Replacement
-- Part 1.3: Add temporary status_new column

ALTER TABLE projects
ADD COLUMN status_new project_status_new;

-- Add comment
COMMENT ON COLUMN projects.status_new IS 'Temporary column for status enum migration';

