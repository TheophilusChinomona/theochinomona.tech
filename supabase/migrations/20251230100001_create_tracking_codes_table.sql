-- Create tracking_codes table
-- Stores unique tracking codes for client project visibility

CREATE TABLE tracking_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tracking_codes_project_id ON tracking_codes(project_id);
CREATE INDEX idx_tracking_codes_is_active ON tracking_codes(is_active);
CREATE INDEX idx_tracking_codes_code ON tracking_codes(code);

-- Create trigger for updated_at (reuse existing function)
CREATE TRIGGER update_tracking_codes_updated_at
  BEFORE UPDATE ON tracking_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique tracking code
-- Format: TC-XXXXXX where X is alphanumeric (excluding ambiguous chars 0/O, 1/I/L)
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result TEXT := 'TC-';
  i INTEGER;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := 'TC-';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM tracking_codes WHERE code = result) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$;

-- Function to auto-generate tracking code when project is created
CREATE OR REPLACE FUNCTION auto_generate_tracking_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO tracking_codes (project_id, code)
  VALUES (NEW.id, generate_tracking_code());
  RETURN NEW;
END;
$$;

-- Create trigger on projects table to auto-generate tracking code
CREATE TRIGGER create_tracking_code_on_project_insert
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_tracking_code();

-- Function to regenerate tracking code for a project (admin use)
-- Deactivates old code and creates new one
CREATE OR REPLACE FUNCTION regenerate_tracking_code(p_project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Deactivate all existing active codes for this project
  UPDATE tracking_codes 
  SET is_active = false, updated_at = NOW()
  WHERE project_id = p_project_id AND is_active = true;
  
  -- Generate and insert new code
  new_code := generate_tracking_code();
  
  INSERT INTO tracking_codes (project_id, code, is_active)
  VALUES (p_project_id, new_code, true);
  
  RETURN new_code;
END;
$$;

-- Enable Row Level Security
ALTER TABLE tracking_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view active tracking codes
CREATE POLICY "Public can view active tracking codes"
  ON tracking_codes FOR SELECT
  USING (is_active = true);

-- RLS Policy: Admins can manage all tracking codes
CREATE POLICY "Admins can manage all tracking codes"
  ON tracking_codes FOR ALL
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


