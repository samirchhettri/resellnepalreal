
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  actor_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- Triggers can insert; no general INSERT policy is needed since SECURITY DEFINER functions bypass RLS.

-- Trigger: create a notification when a new message is received
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  preview TEXT;
BEGIN
  SELECT CASE WHEN c.participant_one = NEW.sender_id THEN c.participant_two
              ELSE c.participant_one END
  INTO recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  IF recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  preview := COALESCE(
    NULLIF(LEFT(NEW.content, 80), ''),
    CASE WHEN NEW.image_url IS NOT NULL THEN '📷 Sent a photo' ELSE 'New message' END
  );

  INSERT INTO public.notifications (user_id, type, title, body, link, actor_id)
  VALUES (
    recipient_id,
    'message',
    sender_name || ' sent you a message',
    preview,
    '/chat/' || NEW.conversation_id,
    NEW.sender_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_inserted_notify
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();

-- Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
