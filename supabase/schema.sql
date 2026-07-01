-- Time Specialist Support website content backend.
-- Run this in the Supabase SQL editor for the project that will power the site.
-- The public website uses the publishable key only. Do not place a service-role key in
-- frontend code, Netlify public env vars, or committed files.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = auth.uid()
    );
$$;

create table if not exists public.team_profiles (
    id uuid primary key default gen_random_uuid(),
    display_name text not null,
    role text not null default 'Support Worker',
    directory_group text not null default 'support'
        check (directory_group in ('office', 'support')),
    bio text not null default '',
    image_path text,
    image_url text,
    public_profile boolean not null default true,
    published boolean not null default false,
    sort_order integer not null default 1000,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.staff_resources (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null default '',
    section text not null default 'General',
    link_label text not null default 'Open resource',
    url text not null,
    resource_type text not null default 'link'
        check (resource_type in ('link', 'document', 'form', 'video', 'page')),
    visibility text not null default 'staff'
        check (visibility in ('public', 'staff')),
    published boolean not null default false,
    sort_order integer not null default 1000,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
    key text primary key,
    value text not null,
    description text not null default '',
    is_public boolean not null default false,
    updated_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_team_profiles_updated_at on public.team_profiles;
create trigger set_team_profiles_updated_at
before update on public.team_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_staff_resources_updated_at on public.staff_resources;
create trigger set_staff_resources_updated_at
before update on public.staff_resources
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.team_profiles enable row level security;
alter table public.staff_resources enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());

drop policy if exists "Published public team profiles are readable" on public.team_profiles;
create policy "Published public team profiles are readable"
on public.team_profiles
for select
to anon, authenticated
using (published and public_profile);

drop policy if exists "Admins can manage team profiles" on public.team_profiles;
create policy "Admins can manage team profiles"
on public.team_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published public resources are readable" on public.staff_resources;
drop policy if exists "Published staff hub resources are readable" on public.staff_resources;
create policy "Published staff hub resources are readable"
on public.staff_resources
for select
to anon, authenticated
using (published and visibility in ('public', 'staff'));

drop policy if exists "Admins can manage staff resources" on public.staff_resources;
create policy "Admins can manage staff resources"
on public.staff_resources
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public site settings are readable" on public.site_settings;
create policy "Public site settings are readable"
on public.site_settings
for select
to anon, authenticated
using (is_public);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.site_settings (key, value, description, is_public)
values (
    'support_worker_password_hash',
    'b03ae420e342195770900e49fd6ff0f2f3d266b631075c7dc57c87782625a3c3',
    'SHA-256 hash used by support-workers.html for the Support Worker Hub unlock password.',
    true
)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can view profile images" on storage.objects;
create policy "Public can view profile images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'profile-images');

drop policy if exists "Admins can upload profile images" on storage.objects;
create policy "Admins can upload profile images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-images' and public.is_admin());

drop policy if exists "Admins can update profile images" on storage.objects;
create policy "Admins can update profile images"
on storage.objects
for update
to authenticated
using (bucket_id = 'profile-images' and public.is_admin())
with check (bucket_id = 'profile-images' and public.is_admin());

drop policy if exists "Admins can delete profile images" on storage.objects;
create policy "Admins can delete profile images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'profile-images' and public.is_admin());

create index if not exists team_profiles_public_idx
on public.team_profiles (published, public_profile, directory_group, sort_order, display_name);

create index if not exists staff_resources_public_idx
on public.staff_resources (published, visibility, section, sort_order, title);

create index if not exists site_settings_public_idx
on public.site_settings (is_public, key);

-- After creating an Auth user in Supabase, grant admin access with:
--
-- insert into public.admin_users (user_id, email)
-- select id, email
-- from auth.users
-- where email = 'admin@example.com'
-- on conflict (user_id) do nothing;
