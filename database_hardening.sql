-- 1. Ensure profiles.is_verified defaults to false
ALTER TABLE public.profiles 
ALTER COLUMN is_verified SET DEFAULT false;

-- 2. Create a function to prevent users from self-verifying
-- Only a service_role (Admin/Edge Function) should be able to set this to true.
CREATE OR REPLACE FUNCTION protect_is_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- If the requester is not a service_role and is trying to change is_verified to true
  IF (auth.role() <> 'service_role' AND NEW.is_verified IS DISTINCT FROM OLD.is_verified) THEN
    -- Keep the OLD value for is_verified, ignore the user's attempt to change it
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS tr_protect_is_verified ON public.profiles;
CREATE TRIGGER tr_protect_is_verified
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION protect_is_verified();

-- 4. Secure the wali_verifications table
-- Ensure that only high-confidence matches from the backend can settle the status
ALTER TABLE public.wali_verifications 
ALTER COLUMN match_status SET DEFAULT 'pending';
