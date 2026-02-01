-- Migrate project_requests data to projects table
-- Task Group 6: Project Requests Data Migration
-- Part 6.2-6.5: Migrate data, update references, archive tables

-- Step 1: Migrate project_requests to projects
INSERT INTO projects (
  id,
  title,
  description,
  category,
  tech,
  client_id,
  created_by,
  status,
  is_hiring_request,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(), -- Generate new ID for project
  pr.title,
  pr.description,
  pr.category,
  ARRAY[pr.category]::TEXT[], -- Use category as tech array (can be updated later)
  pr.client_id,
  pr.client_id AS created_by, -- Client created the request
  CASE 
    WHEN pr.status = 'pending' THEN 'pending'::project_status_new
    WHEN pr.status = 'approved' THEN 'in_progress'::project_status_new
    WHEN pr.status = 'denied' THEN 'completed'::project_status_new
    WHEN pr.status = 'needs_info' THEN 'pending_info'::project_status_new
    ELSE 'pending'::project_status_new
  END AS status,
  false AS is_hiring_request, -- Default to false
  pr.created_at,
  pr.updated_at
FROM project_requests pr;

-- Step 2: Update project_requests.project_id to point to new project IDs
-- We need to match by client_id, title, and created_at to link them
UPDATE project_requests pr
SET project_id = p.id
FROM projects p
WHERE p.client_id = pr.client_id
  AND p.created_by = pr.client_id
  AND p.title = pr.title
  AND p.created_at = pr.created_at
  AND p.status IN (
    SELECT CASE 
      WHEN pr2.status = 'pending' THEN 'pending'::project_status_new
      WHEN pr2.status = 'approved' THEN 'in_progress'::project_status_new
      WHEN pr2.status = 'denied' THEN 'completed'::project_status_new
      WHEN pr2.status = 'needs_info' THEN 'pending_info'::project_status_new
      ELSE 'pending'::project_status_new
    END
    FROM project_requests pr2
    WHERE pr2.id = pr.id
  );

-- Step 3: Migrate project_request_attachments to project_attachments
-- Note: We assume project_attachments table exists (from previous migrations)
INSERT INTO project_attachments (
  id,
  project_id,
  file_url,
  file_name,
  file_type,
  file_size,
  created_at
)
SELECT 
  gen_random_uuid(),
  pr.project_id, -- Use the updated project_id from project_requests
  pra.file_url,
  pra.file_name,
  pra.file_type::TEXT, -- Convert enum to text if needed
  pra.file_size,
  pra.created_at
FROM project_request_attachments pra
JOIN project_requests pr ON pr.id = pra.request_id
WHERE pr.project_id IS NOT NULL; -- Only migrate if project was created

-- Step 4: Preserve admin_notes and denial_reason in activity log
-- Log admin notes as activity entries
INSERT INTO activity_log (
  project_id,
  event_type,
  event_data,
  user_id,
  created_at
)
SELECT 
  pr.project_id,
  'note_added'::activity_log_event_type,
  jsonb_build_object(
    'note', pr.admin_notes,
    'source', 'project_request_migration',
    'original_request_id', pr.id
  ),
  NULL, -- Admin user_id not stored in request
  pr.updated_at
FROM project_requests pr
WHERE pr.admin_notes IS NOT NULL 
  AND pr.admin_notes != ''
  AND pr.project_id IS NOT NULL;

-- Log denial reasons as activity entries
INSERT INTO activity_log (
  project_id,
  event_type,
  event_data,
  user_id,
  created_at
)
SELECT 
  pr.project_id,
  'project_completed'::activity_log_event_type, -- Using completed as closest match
  jsonb_build_object(
    'denial_reason', pr.denial_reason,
    'source', 'project_request_migration',
    'original_request_id', pr.id
  ),
  NULL,
  pr.updated_at
FROM project_requests pr
WHERE pr.denial_reason IS NOT NULL 
  AND pr.denial_reason != ''
  AND pr.project_id IS NOT NULL;

-- Step 5: Archive project_requests table (rename instead of drop for safety)
ALTER TABLE project_requests RENAME TO project_requests_archived;
ALTER TABLE project_request_attachments RENAME TO project_request_attachments_archived;

-- Add comment to archived tables
COMMENT ON TABLE project_requests_archived IS 'Archived project requests - data migrated to projects table on 2025-12-30';
COMMENT ON TABLE project_request_attachments_archived IS 'Archived project request attachments - data migrated to project_attachments table on 2025-12-30';

-- Note: We keep request_status enum as it might be referenced elsewhere
-- If you want to drop it, check for other references first:
-- SELECT * FROM pg_type WHERE typname = 'request_status';

