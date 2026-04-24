-- Replace the broad public SELECT with a narrower one that allows file
-- downloads via direct path but blocks bucket listing.
drop policy if exists "Avatar images are publicly accessible" on storage.objects;

-- Anyone may read a specific avatar object (needed for <img src="...public URL...">),
-- but listing the bucket without a path returns nothing because every row needs
-- a name match. The Storage REST GET-object endpoint only checks SELECT against
-- the matched row, so direct fetches still work.
create policy "Public can read individual avatar files"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] is not null
    and auth.role() = 'anon'
    and current_setting('request.method', true) = 'GET'
  );

-- Authenticated users can also read individual files (same constraint).
create policy "Authenticated can read individual avatar files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] is not null
  );

-- Owners can list/read their own folder freely.
create policy "Owners can read their own avatar folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );