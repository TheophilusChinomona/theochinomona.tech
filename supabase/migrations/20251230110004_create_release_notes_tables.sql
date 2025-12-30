-- Migration: Create release_notes, release_note_targets, and release_note_reads tables
-- Task Group 4: Release Notes Schema & Migration

-- Create release_note_target_type enum
CREATE TYPE release_note_target_type AS ENUM ('all', 'group', 'specific');

-- Create release_notes table
CREATE TABLE release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  target_type release_note_target_type NOT NULL DEFAULT 'all',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_release_notes_updated_at
  BEFORE UPDATE ON release_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create release_note_targets table (for group or specific user targeting)
CREATE TABLE release_note_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('group', 'user')), -- 'group' or 'user'
  target_id UUID NOT NULL, -- References either client_groups.id or users.id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(release_note_id, target_type, target_id)
);

-- Create release_note_reads table (tracks which users have read which notes)
CREATE TABLE release_note_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_note_id UUID NOT NULL REFERENCES release_notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(release_note_id, user_id)
);

-- Create indexes for release_notes
CREATE INDEX idx_release_notes_is_published ON release_notes(is_published);
CREATE INDEX idx_release_notes_published_at ON release_notes(published_at DESC);
CREATE INDEX idx_release_notes_target_type ON release_notes(target_type);

-- Create indexes for release_note_targets
CREATE INDEX idx_release_note_targets_release_note_id ON release_note_targets(release_note_id);
CREATE INDEX idx_release_note_targets_target_id ON release_note_targets(target_id);

-- Create indexes for release_note_reads
CREATE INDEX idx_release_note_reads_user_id ON release_note_reads(user_id);
CREATE INDEX idx_release_note_reads_release_note_id ON release_note_reads(release_note_id);

-- Enable Row Level Security on release_notes
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user can see a release note
CREATE OR REPLACE FUNCTION can_user_see_release_note(note_id UUID, check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  note_target_type release_note_target_type;
  is_note_published BOOLEAN;
BEGIN
  -- Get the note's target type and published status
  SELECT target_type, is_published INTO note_target_type, is_note_published
  FROM release_notes
  WHERE id = note_id;
  
  -- Must be published
  IF NOT is_note_published THEN
    RETURN FALSE;
  END IF;
  
  -- If target_type is 'all', everyone can see it
  IF note_target_type = 'all' THEN
    RETURN TRUE;
  END IF;
  
  -- If target_type is 'specific', check if user is directly targeted
  IF note_target_type = 'specific' THEN
    RETURN EXISTS (
      SELECT 1 FROM release_note_targets
      WHERE release_note_id = note_id
        AND target_type = 'user'
        AND target_id = check_user_id
    );
  END IF;
  
  -- If target_type is 'group', check if user is in any targeted group
  IF note_target_type = 'group' THEN
    RETURN EXISTS (
      SELECT 1 FROM release_note_targets rnt
      JOIN client_group_members cgm ON cgm.group_id = rnt.target_id
      WHERE rnt.release_note_id = note_id
        AND rnt.target_type = 'group'
        AND cgm.user_id = check_user_id
    );
  END IF;
  
  RETURN FALSE;
END;
$$;

-- RLS Policy: Users can SELECT published release notes targeted to them
CREATE POLICY "Users can view release notes targeted to them"
  ON release_notes FOR SELECT
  USING (
    can_user_see_release_note(
      id, 
      (SELECT id FROM users WHERE auth_user_id = auth.uid())
    )
  );

-- RLS Policy: Admins can manage all release notes
CREATE POLICY "Admins can manage all release notes"
  ON release_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on release_notes
CREATE POLICY "Service role full access on release_notes"
  ON release_notes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Enable Row Level Security on release_note_targets
ALTER TABLE release_note_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all targets
CREATE POLICY "Admins can manage all release note targets"
  ON release_note_targets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on release_note_targets
CREATE POLICY "Service role full access on release_note_targets"
  ON release_note_targets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Enable Row Level Security on release_note_reads
ALTER TABLE release_note_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can SELECT their own read records
CREATE POLICY "Users can view their own release note reads"
  ON release_note_reads FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Users can INSERT their own read records
CREATE POLICY "Users can mark release notes as read"
  ON release_note_reads FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- RLS Policy: Admins can view all read records
CREATE POLICY "Admins can view all release note reads"
  ON release_note_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Service role full access on release_note_reads
CREATE POLICY "Service role full access on release_note_reads"
  ON release_note_reads FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE release_notes IS 'Release notes / announcements for the What''s New feature';
COMMENT ON TABLE release_note_targets IS 'Targets for release notes (groups or specific users)';
COMMENT ON TABLE release_note_reads IS 'Tracks which users have read which release notes';
COMMENT ON COLUMN release_notes.content IS 'Markdown content for the release note';
COMMENT ON COLUMN release_notes.target_type IS 'all = everyone, group = specific groups, specific = specific users';
COMMENT ON FUNCTION can_user_see_release_note IS 'Helper function to determine if a user can see a release note based on targeting';


