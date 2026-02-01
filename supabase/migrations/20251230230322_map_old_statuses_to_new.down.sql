-- Rollback: Clear status_new column
-- Task Group 1: Project Status Enum Replacement

UPDATE projects
SET status_new = NULL;

