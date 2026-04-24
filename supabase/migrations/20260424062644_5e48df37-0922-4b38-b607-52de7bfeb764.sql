CREATE TABLE public.saved_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT saved_listings_unique UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_saved_listings_user ON public.saved_listings(user_id, created_at DESC);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved listings"
ON public.saved_listings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
ON public.saved_listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own saved listings"
ON public.saved_listings FOR DELETE
USING (auth.uid() = user_id);
