# Supabase Backend

This project now supports Supabase as the real content backend for team profiles and staff/support-worker resource content.

## What Supabase Stores

- `team_profiles`: office team and support-worker directory profiles.
- `staff_resources`: support-worker/admin resource links and documents.
- `site_settings`: small site settings, including the Support Worker Hub password hash.
- `profile-images` storage bucket: public profile images uploaded from the admin dashboard.
- `admin_users`: allow-list of authenticated Supabase users who can manage content.

## Security Model

- The public site uses only the Supabase publishable key.
- Public reads are limited by RLS to `published = true` and `public_profile = true` for team profiles.
- Staff resource reads are limited to `published = true` and `visibility in ('public', 'staff')`.
- The Support Worker Hub remains the access gate for staff-only resources through Netlify Basic Auth and the hub password. The browser anon key can read published staff rows and the public `support_worker_password_hash` setting after that gate so admin-managed resources can render on the static site.
- Office admins can rotate the hub password in `admin/index.html`. Supabase stores the SHA-256 hash only; it does not store the plain password.
- Netlify Basic Auth is deployment configuration in `netlify.toml` and still requires a developer or deployment owner to change.
- Admin reads/writes require Supabase Auth plus a matching row in `admin_users`.
- Never expose a Supabase service-role key in frontend code or Netlify public variables.

## Setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. In Supabase Auth, create/invite the admin user.
4. Add that user to `admin_users` using the SQL snippet at the bottom of `schema.sql`.
5. In Supabase Storage, confirm the `profile-images` bucket exists and is public.
6. Fill in the project URL and publishable key in `assets/js/supabase-config.js`.
7. Set `enabled` to `true`.

The browser config must use the publishable key only. Publishable keys are designed for browser/client-side use when RLS is configured correctly; secret/service-role keys must never be committed or used in browser code.

## Current Site Behaviour

`team.html` tries Supabase first when it is configured. If Supabase is not configured or unavailable, the page falls back to the existing Google Sheet/static fallback data.

`support-workers.html` unlocks locally, then tries to read published `staff_resources` from Supabase. If Supabase is not configured, unavailable, or empty, it keeps the static resource sections already in the page.

`admin/index.html` requires Supabase to be configured and requires an authenticated admin user. It can create, edit, publish, unpublish, and delete team profiles and staff resources, and it can update the Support Worker Hub password hash.
