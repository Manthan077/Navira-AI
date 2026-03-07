-- Create dashboard_locks table
CREATE TABLE IF NOT EXISTS dashboard_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('ambulance', 'hospital')),
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dashboard_type)
);

-- Insert default records
INSERT INTO dashboard_locks (dashboard_type, is_locked) 
VALUES 
  ('ambulance', FALSE),
  ('hospital', FALSE)
ON CONFLICT (dashboard_type) DO NOTHING;

-- Enable RLS
ALTER TABLE dashboard_locks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view locks" ON dashboard_locks FOR SELECT USING (true);
CREATE POLICY "Admins can update locks" ON dashboard_locks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);
