-- Create storage buckets for avatars and ID cards
-- These usually need to be created in the Supabase Dashboard, 
-- but these SQL statements can be used to set up the policies.

-- 1. Create buckets (These might fail if not using storage API directly, but included for reference)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('id-cards', 'id-cards', false);

-- 2. Set up RLS for 'avatars' (Public viewing, authenticated uploading)
CREATE POLICY "Avatar Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 3. Set up RLS for 'id-cards' (PRIVATE - only Wali and Admins can see)
CREATE POLICY "Walis can view their own ID cards"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Walis can upload their own ID cards"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'id-cards' AND (storage.foldername(name))[1] = auth.uid()::text);
