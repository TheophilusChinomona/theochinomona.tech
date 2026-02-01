-- Add missing activity_log_event_type enum values
-- Task Group 15: Integration Updates

ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'project_status_changed';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'project_soft_deleted';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'project_hard_deleted';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'project_comment_added';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'project_cloned';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'template_created';
ALTER TYPE activity_log_event_type ADD VALUE IF NOT EXISTS 'template_used';

COMMENT ON TYPE activity_log_event_type IS 'Activity log event types including project lifecycle, comments, templates, and status changes';

