
ALTER FUNCTION public.bump_conversation_on_message() SET search_path = public;
ALTER FUNCTION public.notify_on_new_message() SET search_path = public;

REVOKE ALL ON FUNCTION public.bump_conversation_on_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_new_message() FROM PUBLIC, anon, authenticated;
