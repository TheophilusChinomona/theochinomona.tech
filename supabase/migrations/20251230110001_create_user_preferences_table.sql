-- Migration: Create user_preferences table for client dashboard settings
-- Task Group 1: User Preferences Schema & Migration

-- Create theme_preference enum type
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme theme_preference NOT NULL DEFAULT 'system',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id (unique constraint creates implicit index, but be explicit)
CREATE UNIQUE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Users can INSERT their own preferences
CREATE POLICY "Users can create their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Users can UPDATE their own preferences
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Admins can SELECT all preferences
CREATE POLICY "Admins can view all preferences"
  ON user_preferences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access on user_preferences"
  ON user_preferences FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE user_preferences IS 'User preferences for theme and notification settings';
COMMENT ON COLUMN user_preferences.theme IS 'User theme preference: light, dark, or system';
COMMENT ON COLUMN user_preferences.email_notifications IS 'Whether user wants to receive email notifications';


