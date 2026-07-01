# Supabase Import Files

These CSVs seed or refresh Supabase content from the repository source files. They are useful for initial migration, batch updates, and keeping the static fallback aligned with Supabase.

Run commands from the repository root.

## Generate Import CSVs

Regenerate the import CSVs:

```sh
node scripts/generate-supabase-imports.js
```

For the preferred Supabase Storage image migration, use:

```sh
node scripts/generate-supabase-imports.js --image-mode=storage
```

Generated files:

- `team_profiles.csv` into the `team_profiles` table.
- `staff_resources.csv` into the `staff_resources` table.

The import files intentionally do not include `id`, `created_at`, or `updated_at`; Supabase fills those automatically.

## Import Into Supabase

Use Supabase Table Editor:

1. Open the target table.
2. Choose Insert.
3. Choose Import data from CSV.
4. Upload the matching CSV from `supabase/imports/`.
5. Review column mapping before confirming.

For repeat imports, avoid creating accidental duplicates. Either update existing records manually in the admin dashboard, clear/replace the target table intentionally, or use a controlled SQL import strategy that matches on stable fields. The generated CSVs do not include UUIDs, so Supabase treats imported rows as new records.

## Content Sources

- Team import source: `team-spreadsheet - time-team-directory-sheet.csv` or the approved team CSV export used by `scripts/generate-supabase-imports.js`.
- Staff resource import source: `support-worker-resources.csv`.
- Static team fallback output: `team-data.js`, generated separately with `npm run generate:team-data`.

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

## Recommended Update Flow

Team profiles:

1. Update the approved source CSV or make changes directly in `admin/index.html`.
2. If using CSV, run `node scripts/generate-supabase-imports.js --image-mode=storage`.
3. Import `team_profiles.csv` into Supabase.
4. Run `npm run generate:team-data`.
5. Run `npm test`.
6. Verify `team.html`.

Support worker resources:

1. Update resources in `admin/index.html`, or update `support-worker-resources.csv` for batch import.
2. If using CSV, run `node scripts/generate-supabase-imports.js --image-mode=storage`.
3. Import `staff_resources.csv` into Supabase.
4. Unlock `support-workers.html` and confirm published resources appear.
5. Run `npm test`.

## Safety Notes

- Do not commit `.env`.
- Do not place `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- Keep unpublished/draft rows unpublished until content has been checked.
- The worker hub can read published staff resources from the browser after the staff gate; do not publish content that should remain server-secret.
