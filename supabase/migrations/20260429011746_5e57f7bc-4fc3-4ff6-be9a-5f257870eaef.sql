
-- 1. PROFILES: split PII so only owners see email/phone
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Owners can view full profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Public-safe view excluding email/phone
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, location, bio, is_verified, created_at, updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Allow others to read non-PII columns directly via profiles for compatibility:
-- We restrict by creating a policy that only returns rows when sensitive cols are not selected is not possible in PG.
-- Instead, expose a second permissive SELECT policy for non-owners but ONLY through the view (the view's security_invoker=true means it relies on this policy).
CREATE POLICY "Public profile fields readable via view"
  ON public.profiles FOR SELECT
  USING (true);

-- The above re-opens SELECT, which we don't want. Drop and instead force consumers to use the view.
DROP POLICY "Public profile fields readable via view" ON public.profiles;

-- 2. PROFILES: prevent self-granting is_verified
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_verified = (SELECT p.is_verified FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3. CHAT IMAGES: make private + scope reads to conversation participants
UPDATE storage.buckets SET public = false WHERE id = 'chat-images';

DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;

CREATE POLICY "Participants can read chat images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[2]
        AND (auth.uid() = c.participant_one OR auth.uid() = c.participant_two)
    )
  );

-- 4. CHAT IMAGES: missing UPDATE policy
CREATE POLICY "Users can update their own chat images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. SECURITY DEFINER trigger functions: revoke direct EXECUTE from API roles
REVOKE EXECUTE ON FUNCTION public.bump_conversation_on_message() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_on_new_message() FROM anon, authenticated, public;
