-- Migration: Create tax_rates table
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Create tax_rates table
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate NUMERIC NOT NULL, -- Percentage, e.g., 8.5 for 8.5%
  country TEXT,
  state TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tax_rates_is_active ON tax_rates(is_active);
CREATE INDEX idx_tax_rates_country_state ON tax_rates(country, state);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all tax rates
CREATE POLICY "Admins can manage all tax rates"
  ON tax_rates FOR ALL
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

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access on tax_rates"
  ON tax_rates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE tax_rates IS 'Configurable tax rates for invoice calculations';
COMMENT ON COLUMN tax_rates.rate IS 'Tax rate as percentage (e.g., 8.5 for 8.5%)';
COMMENT ON COLUMN tax_rates.country IS 'Country code for location-specific tax rates (nullable)';
COMMENT ON COLUMN tax_rates.state IS 'State/province code for location-specific tax rates (nullable)';
COMMENT ON COLUMN tax_rates.is_active IS 'Whether this tax rate is currently active';

