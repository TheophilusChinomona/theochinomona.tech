-- Down Migration: Remove user_preferences table
-- Task Group 1: User Preferences Schema & Migration

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can create their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON user_preferences;
DROP POLICY IF EXISTS "Service role full access on user_preferences" ON user_preferences;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

-- Drop index
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Drop table
DROP TABLE IF EXISTS user_preferences;

-- Drop enum type
DROP TYPE IF EXISTS theme_preference;


