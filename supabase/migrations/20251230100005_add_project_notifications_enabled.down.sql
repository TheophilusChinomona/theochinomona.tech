-- Down Migration: Remove notifications_enabled column from projects

ALTER TABLE projects
DROP COLUMN IF EXISTS notifications_enabled;

