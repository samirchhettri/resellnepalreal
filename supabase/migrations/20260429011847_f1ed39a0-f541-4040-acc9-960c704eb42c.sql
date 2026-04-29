
CREATE SCHEMA IF NOT EXISTS internal;

DROP FUNCTION IF EXISTS public.bump_conversation_on_message() CASCADE;
DROP FUNCTION IF EXISTS public.notify_on_new_message() CASCADE;

CREATE OR REPLACE FUNCTION internal.bump_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION internal.notify_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c RECORD;
  recipient uuid;
  sender_name text;
BEGIN
  SELECT * INTO c FROM public.conversations WHERE id = NEW.conversation_id;
  IF c.participant_one = NEW.sender_id THEN
    recipient := c.participant_two;
  ELSE
    recipient := c.participant_one;
  END IF;

  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, type, title, body, actor_id, link)
  VALUES (
    recipient,
    'message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    LEFT(COALESCE(NEW.content, '📷 Image'), 140),
    NEW.sender_id,
    '/chat/' || NEW.conversation_id::text
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION internal.bump_conversation_on_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION internal.notify_on_new_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SCHEMA internal FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_message_inserted_bump_conversation
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION internal.bump_conversation_on_message();

CREATE TRIGGER on_message_inserted_notify
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION internal.notify_on_new_message();
