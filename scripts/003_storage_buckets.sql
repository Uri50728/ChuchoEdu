-- Storage buckets for the platform
-- - course-videos: private bucket with video files
-- - course-covers: public bucket with cover images
-- - avatars:       public bucket with user/teacher avatars

insert into storage.buckets (id, name, public)
values ('course-videos', 'course-videos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('course-covers', 'course-covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies: admins can write to any bucket. Authenticated users can read private videos (enrollment check enforced at API level).

-- course-videos: admin write, authenticated read
drop policy if exists "videos_admin_write" on storage.objects;
create policy "videos_admin_write" on storage.objects for all
  using (
    bucket_id = 'course-videos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    bucket_id = 'course-videos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "videos_auth_read" on storage.objects;
create policy "videos_auth_read" on storage.objects for select
  using (
    bucket_id = 'course-videos'
    and auth.uid() is not null
  );

-- course-covers and avatars: public read, admin write
drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects for select
  using (bucket_id in ('course-covers', 'avatars'));

drop policy if exists "covers_admin_write" on storage.objects;
create policy "covers_admin_write" on storage.objects for all
  using (
    bucket_id in ('course-covers', 'avatars')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    bucket_id in ('course-covers', 'avatars')
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Users can upload their own avatar under <user_id>/...
drop policy if exists "avatars_user_upload" on storage.objects;
create policy "avatars_user_upload" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
