-- Rollback: Cannot remove enum values in PostgreSQL
-- Note: PostgreSQL does not support removing enum values
-- This migration would require recreating the enum type and updating all references
-- For now, we'll leave a comment indicating manual rollback is required

-- WARNING: Rolling back enum extensions requires:
-- 1. Create new enum without the values
-- 2. Update all columns using the enum
-- 3. Drop old enum and rename new one
-- This is a complex operation and should be done manually if needed

