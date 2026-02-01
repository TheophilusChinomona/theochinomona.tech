-- Add admin_requested_info and client_responded_info to notification_type enum
-- Task Group 14: Comment Thread Components

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'admin_requested_info';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'client_responded_info';

-- Add comment
COMMENT ON TYPE notification_type IS 'Notification types including project updates, phase completion, comments, invoices, payments, and refunds';

