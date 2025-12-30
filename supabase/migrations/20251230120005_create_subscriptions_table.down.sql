-- Down Migration: Remove subscriptions table
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Drop policies
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role full access on subscriptions" ON subscriptions;

-- Drop trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

-- Drop indexes
DROP INDEX IF EXISTS idx_subscriptions_project_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_stripe_subscription_id;
DROP INDEX IF EXISTS idx_subscriptions_client_id;

-- Drop table
DROP TABLE IF EXISTS subscriptions;

