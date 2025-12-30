-- Rollback: Drop project_request_attachments table and enum

DROP TABLE IF EXISTS project_request_attachments;
DROP TYPE IF EXISTS attachment_file_type;

