-- Rollback: Drop dev policies
-- NOTE: This does NOT restore the original policies. To restore original policies,
-- you would need to re-run all the previous RLS migration files.

-- Drop all dev_full_access policies
DROP POLICY IF EXISTS "dev_full_access" ON activity_log;
DROP POLICY IF EXISTS "dev_full_access" ON client_group_members;
DROP POLICY IF EXISTS "dev_full_access" ON client_groups;
DROP POLICY IF EXISTS "dev_full_access" ON client_notification_preferences;
DROP POLICY IF EXISTS "dev_full_access" ON invoice_line_items;
DROP POLICY IF EXISTS "dev_full_access" ON invoices;
DROP POLICY IF EXISTS "dev_full_access" ON notifications;
DROP POLICY IF EXISTS "dev_full_access" ON payments;
DROP POLICY IF EXISTS "dev_full_access" ON project_attachments;
DROP POLICY IF EXISTS "dev_full_access" ON project_comment_attachments;
DROP POLICY IF EXISTS "dev_full_access" ON project_comments;
DROP POLICY IF EXISTS "dev_full_access" ON project_phases;
DROP POLICY IF EXISTS "dev_full_access" ON project_tasks;
DROP POLICY IF EXISTS "dev_full_access" ON project_template_attachments;
DROP POLICY IF EXISTS "dev_full_access" ON project_templates;
DROP POLICY IF EXISTS "dev_full_access" ON projects;
DROP POLICY IF EXISTS "dev_full_access" ON refunds;
DROP POLICY IF EXISTS "dev_full_access" ON release_note_reads;
DROP POLICY IF EXISTS "dev_full_access" ON release_note_targets;
DROP POLICY IF EXISTS "dev_full_access" ON release_notes;
DROP POLICY IF EXISTS "dev_full_access" ON tax_rates;
DROP POLICY IF EXISTS "dev_full_access" ON tracking_codes;
DROP POLICY IF EXISTS "dev_full_access" ON user_preferences;
DROP POLICY IF EXISTS "dev_full_access" ON users;

-- To restore original policies, run the following migrations in order:
-- (These need to be run manually after running this down migration)
--
-- Original policy migrations:
-- - 20251229000001_create_users_table.sql (users policies)
-- - 20251230090133_create_projects_table.sql (projects policies)
-- - 20251230100001_create_tracking_codes_table.sql (tracking_codes policies)
-- - 20251230100002_create_project_phases_table.sql (project_phases policies)
-- - 20251230100003_create_project_tasks_attachments_tables.sql (project_tasks, project_attachments policies)
-- - 20251230110001_create_user_preferences_table.sql (user_preferences policies)
-- - 20251230110002_create_activity_log_table.sql (activity_log policies)
-- - 20251230110003_create_client_groups_tables.sql (client_groups, client_group_members policies)
-- - 20251230110004_create_release_notes_tables.sql (release_notes, release_note_targets, release_note_reads policies)
-- - 20251230110005_create_notifications_table.sql (notifications policies)
-- - (and other policy-related migrations)
