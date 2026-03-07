-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================

-- 1. Create dashboard_locks table
CREATE TABLE IF NOT EXISTS dashboard_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('ambulance', 'hospital')),
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dashboard_type)
);

-- 2. Insert default records
INSERT INTO dashboard_locks (dashboard_type, is_locked) 
VALUES 
  ('ambulance', FALSE),
  ('hospital', FALSE)
ON CONFLICT (dashboard_type) DO NOTHING;

-- 3. Enable RLS
ALTER TABLE dashboard_locks ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view locks" ON dashboard_locks;
DROP POLICY IF EXISTS "Admins can update locks" ON dashboard_locks;

-- 5. Create policies
CREATE POLICY "Anyone can view locks" ON dashboard_locks FOR SELECT USING (true);
CREATE POLICY "Admins can update locks" ON dashboard_locks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 6. Verify the table was created
SELECT * FROM dashboard_locks;
