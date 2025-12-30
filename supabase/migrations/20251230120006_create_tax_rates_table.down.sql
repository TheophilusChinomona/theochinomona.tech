-- Down Migration: Remove tax_rates table
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Drop policies
DROP POLICY IF EXISTS "Admins can manage all tax rates" ON tax_rates;
DROP POLICY IF EXISTS "Service role full access on tax_rates" ON tax_rates;

-- Drop trigger
DROP TRIGGER IF EXISTS update_tax_rates_updated_at ON tax_rates;

-- Drop indexes
DROP INDEX IF EXISTS idx_tax_rates_country_state;
DROP INDEX IF EXISTS idx_tax_rates_is_active;

-- Drop table
DROP TABLE IF EXISTS tax_rates;

