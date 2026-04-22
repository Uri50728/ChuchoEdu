-- =========================================================
-- Educational platform schema
-- Tables: profiles, teachers, courses, modules (videos),
-- enrollments, video_progress, ratings, certificates
-- =========================================================

-- PROFILES (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- TEACHERS (catalog of instructors)
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  avatar_url text,
  specialty text,
  created_at timestamptz not null default now()
);

alter table public.teachers enable row level security;

drop policy if exists "teachers_select_all" on public.teachers;
create policy "teachers_select_all"
  on public.teachers for select
  using (true);

drop policy if exists "teachers_admin_write" on public.teachers;
create policy "teachers_admin_write"
  on public.teachers for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- COURSES
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  category text,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  teacher_id uuid references public.teachers(id) on delete set null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "courses_select_published" on public.courses;
create policy "courses_select_published"
  on public.courses for select
  using (
    is_published
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "courses_admin_write" on public.courses;
create policy "courses_admin_write"
  on public.courses for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- MODULES (each video/lesson inside a course, ordered)
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_path text,            -- storage path inside 'course-videos' bucket
  duration_seconds int default 0,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists modules_course_position_idx on public.modules (course_id, position);

alter table public.modules enable row level security;

drop policy if exists "modules_select_all" on public.modules;
create policy "modules_select_all"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and (c.is_published
        or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );

drop policy if exists "modules_admin_write" on public.modules;
create policy "modules_admin_write"
  on public.modules for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ENROLLMENTS (a user subscribed to a course)
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

drop policy if exists "enrollments_select_own" on public.enrollments;
create policy "enrollments_select_own"
  on public.enrollments for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "enrollments_insert_own" on public.enrollments;
create policy "enrollments_insert_own"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

drop policy if exists "enrollments_update_own" on public.enrollments;
create policy "enrollments_update_own"
  on public.enrollments for update
  using (auth.uid() = user_id);

drop policy if exists "enrollments_delete_own" on public.enrollments;
create policy "enrollments_delete_own"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- VIDEO PROGRESS (per user per module)
create table if not exists public.video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  watched_seconds int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

alter table public.video_progress enable row level security;

drop policy if exists "progress_select_own" on public.video_progress;
create policy "progress_select_own"
  on public.video_progress for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "progress_insert_own" on public.video_progress;
create policy "progress_insert_own"
  on public.video_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.video_progress;
create policy "progress_update_own"
  on public.video_progress for update
  using (auth.uid() = user_id);

-- RATINGS (stars + comment per course)
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.ratings enable row level security;

drop policy if exists "ratings_select_all" on public.ratings;
create policy "ratings_select_all"
  on public.ratings for select
  using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own"
  on public.ratings for insert
  with check (auth.uid() = user_id);

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own"
  on public.ratings for update
  using (auth.uid() = user_id);

drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own"
  on public.ratings for delete
  using (auth.uid() = user_id);

-- CERTIFICATES (one per completed course)
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  issued_at timestamptz not null default now(),
  certificate_code text unique not null default upper(substr(md5(random()::text), 1, 10)),
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

drop policy if exists "certs_select_own" on public.certificates;
create policy "certs_select_own"
  on public.certificates for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "certs_insert_own" on public.certificates;
create policy "certs_insert_own"
  on public.certificates for insert
  with check (auth.uid() = user_id);
