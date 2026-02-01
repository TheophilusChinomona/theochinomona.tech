-- Rollback: Remove the foreign key read policy
DROP POLICY IF EXISTS "Users can read user info through foreign keys" ON users;

