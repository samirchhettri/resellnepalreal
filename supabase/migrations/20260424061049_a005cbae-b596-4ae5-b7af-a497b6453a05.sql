-- Listings table
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  is_negotiable boolean not null default true,
  category text not null,
  condition text not null,
  location text not null,
  images text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'sold', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_user_id_idx on public.listings(user_id);
create index listings_category_idx on public.listings(category);
create index listings_status_created_idx on public.listings(status, created_at desc);

alter table public.listings enable row level security;

-- Anyone can view active listings; owners can view their own regardless of status
create policy "Active listings are viewable by everyone"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

create policy "Users can create their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

-- Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Public can read individual files (no bucket listing)
create policy "Public can read individual listing images"
  on storage.objects for select
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] is not null
    and auth.role() = 'anon'
    and current_setting('request.method', true) = 'GET'
  );

create policy "Authenticated can read individual listing images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] is not null
  );

create policy "Owners can read their own listing image folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );