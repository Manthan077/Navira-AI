-- Add emergency type and medical keyword columns to emergency_tokens table
-- Run this in your Supabase SQL Editor

-- Check if columns exist first
DO $$ 
BEGIN
    -- Add emergency_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'emergency_tokens' 
        AND column_name = 'emergency_type'
    ) THEN
        ALTER TABLE public.emergency_tokens ADD COLUMN emergency_type text;
        CREATE INDEX idx_emergency_tokens_type ON public.emergency_tokens(emergency_type);
    END IF;

    -- Add medical_keyword column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'emergency_tokens' 
        AND column_name = 'medical_keyword'
    ) THEN
        ALTER TABLE public.emergency_tokens ADD COLUMN medical_keyword text;
        CREATE INDEX idx_emergency_tokens_keyword ON public.emergency_tokens(medical_keyword);
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'emergency_tokens' 
AND column_name IN ('emergency_type', 'medical_keyword');
