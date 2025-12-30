-- Migration: Add notifications_enabled column to projects
-- This allows admin to toggle email notifications per project

-- Add notifications_enabled column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN projects.notifications_enabled IS 'Whether to send email notifications for this project when phases complete';

