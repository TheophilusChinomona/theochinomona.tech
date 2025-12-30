-- Down migration for tracking_codes table

-- Drop trigger on projects table
DROP TRIGGER IF EXISTS create_tracking_code_on_project_insert ON projects;

-- Drop trigger on tracking_codes table
DROP TRIGGER IF EXISTS update_tracking_codes_updated_at ON tracking_codes;

-- Drop RLS policies
DROP POLICY IF EXISTS "Public can view active tracking codes" ON tracking_codes;
DROP POLICY IF EXISTS "Admins can manage all tracking codes" ON tracking_codes;

-- Drop functions
DROP FUNCTION IF EXISTS regenerate_tracking_code(UUID);
DROP FUNCTION IF EXISTS auto_generate_tracking_code();
DROP FUNCTION IF EXISTS generate_tracking_code();

-- Drop indexes
DROP INDEX IF EXISTS idx_tracking_codes_code;
DROP INDEX IF EXISTS idx_tracking_codes_is_active;
DROP INDEX IF EXISTS idx_tracking_codes_project_id;

-- Drop table
DROP TABLE IF EXISTS tracking_codes;


