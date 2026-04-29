
-- set_updated_at: doesn't need definer at all, but move to internal anyway
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION internal.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION internal.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION internal.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION internal.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Recreate triggers
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION internal.set_updated_at();
CREATE TRIGGER listings_set_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION internal.set_updated_at();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION internal.set_updated_at();
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON public.user_presence
  FOR EACH ROW EXECUTE FUNCTION internal.set_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION internal.handle_new_user();
