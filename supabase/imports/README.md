# Supabase Import Files

Run this from the repo root to regenerate the import CSVs:

```sh
node scripts/generate-supabase-imports.js
```

For the preferred Supabase Storage image migration, use:

```sh
node scripts/generate-supabase-imports.js --image-mode=storage
```

Then import:

- `team_profiles.csv` into the `team_profiles` table.
- `staff_resources.csv` into the `staff_resources` table.

Use Supabase Table Editor → table name → Insert → Import data from CSV.

The import files intentionally do not include `id`, `created_at`, or `updated_at`; Supabase fills those automatically.

## Team Profile Images

The preferred migration stores existing profile images in Supabase Storage, matching how future admin uploads work.

1. Create a local `.env` file in the repo root. This file is ignored by git.
2. Add:

```sh
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

3. Upload the local team images to the `profile-images` bucket:

```sh
node scripts/upload-team-images-to-supabase.js
```

4. Regenerate the import CSV in storage mode:

```sh
node scripts/generate-supabase-imports.js --image-mode=storage
```

In storage mode, `team_profiles.csv` uses `image_path` values such as `team/Ally-e1487589049713.jpg` and leaves `image_url` blank. Do not commit the service-role key or put it in frontend code.

## Static Team Fallback

After updating the team CSV source and regenerating Supabase imports, also regenerate the local browser fallback:

```sh
npm run generate:team-data
```

This rewrites `team-data.js` with the full office and support-worker directory, using local image paths where matching files exist in `assets/images/team/`.
