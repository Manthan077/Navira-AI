# Fix: Missing emergency_type and medical_keyword Columns

## Problem
Error: "Could not find the 'emergency_type' column of 'emergency_tokens' in the schema cache"

## Solution

You need to add the missing columns to your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `ADD_EMERGENCY_COLUMNS.sql`
5. Click "Run" to execute the SQL
6. Verify the columns were added successfully

### Option 2: Using Supabase CLI

```bash
cd backend
supabase db push
```

This will run all pending migrations including the emergency type fields.

### Option 3: Manual SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Add emergency_type column
ALTER TABLE public.emergency_tokens 
ADD COLUMN IF NOT EXISTS emergency_type text;

-- Add medical_keyword column
ALTER TABLE public.emergency_tokens 
ADD COLUMN IF NOT EXISTS medical_keyword text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_type 
ON public.emergency_tokens(emergency_type);

CREATE INDEX IF NOT EXISTS idx_emergency_tokens_keyword 
ON public.emergency_tokens(medical_keyword);
```

### Verify

After running the SQL, verify the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'emergency_tokens' 
AND column_name IN ('emergency_type', 'medical_keyword');
```

You should see both columns listed.

### After Fix

1. Refresh your browser
2. Try creating an emergency again
3. The emergency type and medical keyword will now be saved

## Note

The code has been updated to handle missing columns gracefully, but it's recommended to add the columns for full functionality.
