-- Create request_status enum type
-- Task Group 1: Project Requests Schema & Migrations

CREATE TYPE request_status AS ENUM ('pending', 'approved', 'denied', 'needs_info');

-- Add comment
COMMENT ON TYPE request_status IS 'Status of project requests: pending, approved, denied, needs_info';

