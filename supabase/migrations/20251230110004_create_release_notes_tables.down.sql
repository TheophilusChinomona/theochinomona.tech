-- Down Migration: Remove release_notes, release_note_targets, and release_note_reads tables
-- Task Group 4: Release Notes Schema & Migration

-- Drop policies on release_note_reads
DROP POLICY IF EXISTS "Users can view their own release note reads" ON release_note_reads;
DROP POLICY IF EXISTS "Users can mark release notes as read" ON release_note_reads;
DROP POLICY IF EXISTS "Admins can view all release note reads" ON release_note_reads;
DROP POLICY IF EXISTS "Service role full access on release_note_reads" ON release_note_reads;

-- Drop indexes on release_note_reads
DROP INDEX IF EXISTS idx_release_note_reads_user_id;
DROP INDEX IF EXISTS idx_release_note_reads_release_note_id;

-- Drop release_note_reads table
DROP TABLE IF EXISTS release_note_reads;

-- Drop policies on release_note_targets
DROP POLICY IF EXISTS "Admins can manage all release note targets" ON release_note_targets;
DROP POLICY IF EXISTS "Service role full access on release_note_targets" ON release_note_targets;

-- Drop indexes on release_note_targets
DROP INDEX IF EXISTS idx_release_note_targets_release_note_id;
DROP INDEX IF EXISTS idx_release_note_targets_target_id;

-- Drop release_note_targets table
DROP TABLE IF EXISTS release_note_targets;

-- Drop policies on release_notes
DROP POLICY IF EXISTS "Users can view release notes targeted to them" ON release_notes;
DROP POLICY IF EXISTS "Admins can manage all release notes" ON release_notes;
DROP POLICY IF EXISTS "Service role full access on release_notes" ON release_notes;

-- Drop helper function
DROP FUNCTION IF EXISTS can_user_see_release_note;

-- Drop indexes on release_notes
DROP INDEX IF EXISTS idx_release_notes_is_published;
DROP INDEX IF EXISTS idx_release_notes_published_at;
DROP INDEX IF EXISTS idx_release_notes_target_type;

-- Drop trigger on release_notes
DROP TRIGGER IF EXISTS update_release_notes_updated_at ON release_notes;

-- Drop release_notes table
DROP TABLE IF EXISTS release_notes;

-- Drop enum type
DROP TYPE IF EXISTS release_note_target_type;


