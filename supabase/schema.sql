-- ==============================================================================
-- SUPABASE DATABASE & STORAGE SCHEMA FOR JOB TRACKER APP
-- ==============================================================================
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run.
-- ==============================================================================

-- 1. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  name text,
  title text default 'Software Engineer',
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Trigger to create profile automatically on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, title)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'title', 'Tech Professional')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. SHEETS TABLE (Job Categories / Boards)
create table if not exists public.sheets (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text default '',
  icon text default 'Building2',
  color text default 'blue',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on sheets
alter table public.sheets enable row level security;

-- Sheets Policies
create policy "Users can view their own sheets." on public.sheets
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sheets." on public.sheets
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own sheets." on public.sheets
  for update using (auth.uid() = user_id);

create policy "Users can delete their own sheets." on public.sheets
  for delete using (auth.uid() = user_id);

-- Index for fast user sheet lookup
create index if not exists idx_sheets_user_id on public.sheets(user_id);


-- 3. JOBS TABLE (Job Applications)
create table if not exists public.jobs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  sheet_id text references public.sheets(id) on delete cascade not null,
  company text not null,
  role text not null,
  status text not null default 'Wishlist',
  company_type text default 'Startup',
  workplace_type text default 'Remote',
  location text default '',
  salary_min numeric,
  salary_max numeric,
  salary_currency text default 'USD',
  applied_date text,
  job_url text,
  contact text,
  notes text,
  rating integer default 0,
  priority text default 'Medium',
  resume_url text,
  resume_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on jobs
alter table public.jobs enable row level security;

-- Jobs Policies
create policy "Users can view their own jobs." on public.jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert their own jobs." on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own jobs." on public.jobs
  for update using (auth.uid() = user_id);

create policy "Users can delete their own jobs." on public.jobs
  for delete using (auth.uid() = user_id);

-- Indices for performance
create index if not exists idx_jobs_user_id on public.jobs(user_id);
create index if not exists idx_jobs_sheet_id on public.jobs(sheet_id);
create index if not exists idx_jobs_status on public.jobs(status);


-- 4. STORAGE BUCKET: resumes & attachments
insert into storage.buckets (id, name, public)
values ('job-attachments', 'job-attachments', true)
on conflict (id) do update set public = true;

-- Storage RLS Policies for job-attachments
create policy "Users can upload their own attachments."
  on storage.objects for insert
  with check (
    bucket_id = 'job-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own attachments."
  on storage.objects for select
  using (
    bucket_id = 'job-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own attachments."
  on storage.objects for update
  using (
    bucket_id = 'job-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own attachments."
  on storage.objects for delete
  using (
    bucket_id = 'job-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
