-- Rollback: Remove temporary status_new column
-- Task Group 1: Project Status Enum Replacement

ALTER TABLE projects
DROP COLUMN IF EXISTS status_new;

