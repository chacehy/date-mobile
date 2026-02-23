-- Migration to add detailed profile fields based on the "Mouqabala" card model

-- 1. Create Enums for better data integrity (Optional but recommended)
DO $$ BEGIN
    CREATE TYPE prayer_freq AS ENUM ('always', 'sometimes', 'rarely');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE practice_lvl AS ENUM ('obligatory', 'sunnah_and_more');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS prayer_frequency TEXT, -- e.g., '5 prayers', 'not as much'
ADD COLUMN IF NOT EXISTS practice_level TEXT,    -- e.g., 'obligatory only', 'obligatory + surerogatory'
ADD COLUMN IF NOT EXISTS quran_knowledge INTEGER, -- Number of surahs
ADD COLUMN IF NOT EXISTS reads_arabic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS veil_type TEXT,          -- For females (e.g., 'Hijab', 'Niqab')
ADD COLUMN IF NOT EXISTS age_gap_pref TEXT,
ADD COLUMN IF NOT EXISTS accepts_divorced BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS accepts_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ethnicity_pref TEXT,
ADD COLUMN IF NOT EXISTS job TEXT,
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS was_married BOOLEAN DEFAULT FALSE;

-- 3. Update the handle_new_user trigger to populate these from metadata on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    role,
    ethnicity,
    age,
    prayer_frequency,
    practice_level,
    quran_knowledge,
    reads_arabic,
    job,
    has_children,
    was_married
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'male')::public.user_role,
    NEW.raw_user_meta_data->>'ethnicity',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    NEW.raw_user_meta_data->>'prayer_frequency',
    NEW.raw_user_meta_data->>'practice_level',
    (NEW.raw_user_meta_data->>'quran_knowledge')::INTEGER,
    (NEW.raw_user_meta_data->>'reads_arabic')::BOOLEAN,
    NEW.raw_user_meta_data->>'job',
    (NEW.raw_user_meta_data->>'has_children')::BOOLEAN,
    (NEW.raw_user_meta_data->>'was_married')::BOOLEAN
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
