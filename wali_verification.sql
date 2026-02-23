-- 1. Create a table for Wali ID Verification
CREATE TABLE IF NOT EXISTS wali_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wali_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    id_card_url TEXT, -- Temp URL, purged after scan
    ocr_full_text TEXT, -- Raw text extracted from the ID
    extracted_first_name TEXT,
    extracted_last_name TEXT,
    confidence_score FLOAT, -- OCR confidence
    match_status TEXT DEFAULT 'pending', -- 'pending', 'matched', 'manual_review', 'failed'
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add an RLS policy for Wali to see their own verification status
ALTER TABLE wali_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Walis can view their own verifications"
ON wali_verifications FOR SELECT
TO authenticated
USING (auth.uid() = wali_id);

CREATE POLICY "Walis can insert their own verification"
ON wali_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = wali_id);

-- Optional: Create a storage bucket for IDs
-- Note: This usually needs to be done via the Supabase Dashboard or API, 
-- but we can document the intent here.
-- The bucket should be PRIVATE.
