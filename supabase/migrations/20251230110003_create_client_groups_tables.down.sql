-- Down Migration: Remove client_groups and client_group_members tables
-- Task Group 3: Client Groups Schema & Migration

-- Drop policies on client_group_members
DROP POLICY IF EXISTS "Admins can manage all group members" ON client_group_members;
DROP POLICY IF EXISTS "Service role full access on client_group_members" ON client_group_members;

-- Drop indexes on client_group_members
DROP INDEX IF EXISTS idx_client_group_members_group_id;
DROP INDEX IF EXISTS idx_client_group_members_user_id;

-- Drop client_group_members table (must be dropped before client_groups due to FK)
DROP TABLE IF EXISTS client_group_members;

-- Drop policies on client_groups
DROP POLICY IF EXISTS "Admins can manage all client groups" ON client_groups;
DROP POLICY IF EXISTS "Service role full access on client_groups" ON client_groups;

-- Drop trigger on client_groups
DROP TRIGGER IF EXISTS update_client_groups_updated_at ON client_groups;

-- Drop client_groups table
DROP TABLE IF EXISTS client_groups;


