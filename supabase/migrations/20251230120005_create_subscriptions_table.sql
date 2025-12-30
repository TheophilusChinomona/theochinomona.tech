-- Migration: Create subscriptions table
-- Task Group 3: Subscription & Tax Schema & Migrations

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_project_id ON subscriptions(project_id);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions FOR ALL
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
CREATE POLICY "Service role full access on subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Recurring payment subscriptions linked to Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Unique Stripe subscription identifier';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price ID for the subscription';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active, canceled, or past_due';

