# Time Specialist Support Website Handover

This is the operator runbook for the Time Specialist Support static website. It explains how to run the site locally, update content, manage Supabase-backed data, validate changes, and publish safely.

## Quick Commands

Run these from the repository root:

```sh
npm install
npm test
npm run check:local
npm run check:browser
npm run check:external
npm run generate:team-data
node scripts/generate-supabase-imports.js --image-mode=storage
npm run screenshots:mobile
python3 -m http.server 8765
```

`npm test` is the normal pre-publish check. `npm run check:external` needs internet access and is kept separate because third-party services sometimes block automated checks.

## Project Shape

- Static HTML/CSS/JS site published from the repository root.
- Netlify handles deployment, security headers, old WordPress-style redirects, 404 routing, and Basic Auth for protected staff pages.
- Supabase provides editable content for team profiles, support-worker resources, profile images, admin allow-listing, and the Support Worker Hub password hash.
- The public browser code uses only the Supabase publishable key in `assets/js/supabase-config.js`.
- Local fallbacks keep core pages usable if Supabase or Google Sheets is unavailable.

## Core Routes

- `index.html`: parent-first overview and main service journey.
- `services.html`: autism-specific support, matching, preparation, respite, and community access.
- `about.html`: values, director note, standards, safeguarding, and trust.
- `team.html`: office team and support-worker directory.
- `careers.html`: support-worker recruitment and application links.
- `faq.html`: parent and professional questions.
- `resources.html`: public links and Support Worker Hub entry.
- `support-workers.html`: password-protected worker resources.
- `orientation-elearning.html`: orientation training index.
- `extra-elearning.html`: extra training index.
- `elearning-modules.html`: protected training module library.
- `contact.html`: enquiries, referrals, recruitment, feedback, and complaints.
- `privacy.html`: website enquiry privacy notice.
- `admin/index.html`: Supabase-backed content admin dashboard.

## Local Setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm test`.
4. For a local web server, run `python3 -m http.server 8765` and open `http://127.0.0.1:8765/`.

Most checks load pages directly from local files, so a server is not required for `npm test`. Use the local server when manually testing browser behavior, Netlify-style paths, or external embeds.

## Deployment And Netlify

The deployment target is Netlify with `publish = "."` in `netlify.toml`. Netlify publishes the repository root, so all public HTML, assets, scripts, and config files must remain reachable from the root paths used in the HTML.

Netlify responsibilities:

- Serve the static site.
- Apply security headers.
- Protect staff/e-learning pages with Basic Auth.
- Redirect old WordPress `page_id` URLs to the new static pages.
- Serve `404.html` for missing routes.

Protected by Netlify Basic Auth:

- `support-workers.html`
- `orientation-elearning.html`
- `extra-elearning.html`
- `elearning-modules.html`
- `one-minute-feedback.html`

Changing Netlify Basic Auth requires a developer or deployment owner to edit `netlify.toml` and redeploy. The office admin dashboard does not change Netlify deployment configuration.

## Supabase Setup

Full backend setup notes live in `supabase/README.md`.

Initial setup:

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create or invite the admin user in Supabase Auth.
4. Add the Auth user to `public.admin_users` using the SQL snippet at the bottom of `supabase/schema.sql`.
5. Confirm the `profile-images` storage bucket exists and is public.
6. Put the project URL and publishable key in `assets/js/supabase-config.js`.
7. Set `enabled: true`.
8. Open `admin/index.html` and confirm the admin reaches the login state.

The browser config must use the publishable key only. Never commit a service-role key or put one in frontend code, Netlify public variables, or any file served to users.

Supabase stores:

- `team_profiles`: public office and support-worker directory content.
- `staff_resources`: Support Worker Hub resource links and document references.
- `site_settings`: small site settings, including the Support Worker Hub password hash.
- `admin_users`: authenticated users allowed to manage content.
- `profile-images`: public storage bucket for team profile photos.

## Supabase Security Model

RLS is deliberately configured so the static site can read only the content it needs:

- Anonymous users can read published public team profiles.
- Anonymous users can read published staff resources with `visibility = 'staff'` or `visibility = 'public'`.
- Anonymous users can read public site settings, including the support-worker password hash.
- Admin dashboard writes require Supabase Auth and a matching `admin_users` row.
- `admin_users`, admin-only settings, and all admin writes are blocked from anonymous users.

The Support Worker Hub access model uses Netlify Basic Auth plus the hub password as the staff gate. Because the site is static, published staff resources must be readable by the browser after the gate opens.

## Admin Dashboard

Use `admin/index.html` for content operations when Supabase is configured.

The dashboard can:

- Create, edit, publish, unpublish, and delete team profiles.
- Upload profile images to the Supabase `profile-images` bucket.
- Create, edit, publish, unpublish, and delete support-worker resources.
- Change the Support Worker Hub password hash.

Admin access requires both:

- A valid Supabase Auth session.
- A matching row in `public.admin_users`.

If the admin page shows the configuration warning, check `assets/js/supabase-config.js` first.

## Updating Team Data

The team page tries data sources in this order:

1. Supabase `team_profiles`, if configured and published rows exist.
2. The configured Google Sheet/CSV source.
3. Local fallback data in `team-data.js`.

Normal update flow:

1. Update the Supabase record in `admin/index.html`, or update `team-spreadsheet - time-team-directory-sheet.csv` / `team-directory-google-sheet.csv` for batch changes.
2. If using CSV imports, run `node scripts/generate-supabase-imports.js --image-mode=storage`.
3. Import `supabase/imports/team_profiles.csv` into Supabase.
4. Run `npm run generate:team-data` to refresh the local fallback.
5. Run `npm test`.
6. Open `team.html` and confirm office and support-worker profiles render as expected.

The current local fallback contains 5 office profiles and 67 support-worker profiles. Local image paths are used where matching files exist in `assets/images/team/`.

Avoid hand-editing `team-data.js` except for an emergency hotfix; regenerate it from the source CSV instead.

## Updating Support Worker Resources

Support worker resources are managed in Supabase `staff_resources` through `admin/index.html`. A published resource appears in `support-workers.html` after the hub is unlocked.

Resource fields:

- `title`: visible resource name.
- `description`: optional detail shown under the title.
- `section`: grouping on the worker hub.
- `link_label`: admin/helper label for the action.
- `url`: local file/page or external URL.
- `resource_type`: `link`, `document`, `form`, `video`, or `page`.
- `visibility`: normally `staff`.
- `published`: must be on before the public hub reads it.
- `sort_order`: lower numbers appear earlier within a section.

The static resource sections in `support-workers.html` are the fallback if Supabase is not configured, unavailable, or has no published staff resources. Keep fallback links grouped by purpose: safeguarding, session forms, planning, admin, training, and reference material.

WordPress-hosted support worker documents have been copied into `assets/documents/support-workers/`. Prefer local document links for new staff resources unless Time confirms an external service is the source of truth.

## Password Rotation

There are two staff access layers:

- Netlify Basic Auth, configured in `netlify.toml`.
- Support Worker Hub password, stored as a SHA-256 hash in Supabase `site_settings`.

To change the office-managed hub password:

1. Sign in to `admin/index.html` with an allow-listed office admin account.
2. Open the Access tab.
3. Enter and confirm the new hub password.
4. Save.
5. Open `support-workers.html` in a fresh browser session and confirm the new password unlocks the hub.
6. Share the new password only through Time's approved staff channel.

To change Netlify Basic Auth, a developer or deployment owner must edit the `Basic-Auth` values in `netlify.toml` and redeploy.

## Contact Form Activation And Testing

The contact form posts to FormSubmit using `info@time-specialist-support.com`, redirects to `thank-you.html`, and includes an autoresponse.

Before treating the form as live after deployment:

1. Submit a safe test enquiry from the deployed site.
2. Check the `info@time-specialist-support.com` mailbox.
3. If FormSubmit sends an activation email, follow that email.
4. Confirm the user is redirected to `thank-you.html`.
5. Confirm the enquiry email content is readable and complete.

FormSubmit endpoint status on 2026-07-01: the endpoint is reachable, but activation cannot be proven from repository files or a GET/HEAD request.

## QA Checklist Before Publishing

Run:

```sh
npm test
node scripts/generate-supabase-imports.js --image-mode=storage
npm run generate:team-data
git status --short
```

For release-level checks, also run:

```sh
npm run check:external
npm run screenshots:mobile
```

Manual checks:

- Open home, services, team, contact, support worker hub, e-learning module library, and admin login.
- Confirm no mobile horizontal overflow on key pages.
- Unlock the Support Worker Hub.
- Search support-worker resources.
- Confirm team search and profile expansion work.
- Confirm admin reaches login or the expected configuration warning.
- If signed in as an admin, create a draft test profile, then delete it.
- Publish/unpublish a test profile and confirm `team.html` responds.
- Submit a safe contact form test after deployment.
- Confirm deployed staff pages require Netlify Basic Auth.
- Confirm old WordPress-style redirects and the 404 route work on Netlify.

`npm test` runs:

- `npm run check:local`: validates local HTML links, local assets, anchors, image alt text, public page metadata, and sitemap coverage.
- `npm run check:browser`: loads pages in Playwright from local files, checks mobile overflow, verifies team fallback rendering, checks Support Worker Hub unlock/resource rendering, and confirms admin reaches login/config-warning state.

`npm run screenshots:mobile` rewrites PNG files in `screenshots/mobile/`; review those diffs before committing them.

## External Links

Run this before release when internet access is available:

```sh
npm run check:external
```

The allow-list lives in `scripts/external-link-allowlist.json`. Keep allow-list entries specific and include a human-readable reason.

The current external link report is in `external-link-report.md`. The latest networked run on 2026-07-01 found 113 passed links, 3 manual-verification links, 2 known-blocked links, and 0 failed links.

Manual verification items:

- Manchester Local Offer: manually verified in browser on 2026-07-01, but automated checks can receive a Cloudflare challenge or `403`.
- Support worker Facebook group: verify using an authorised Facebook account.
- FormSubmit: submit a safe test enquiry after deployment and confirm mailbox receipt.

Known blocked items:

- Vimeo e-learning embed: `elearning-modules.html` still has a `player.vimeo.com` URL that returns `401` to automated checks. This is planned for Phase 5.
- Apple App Store toilet-finder link: automated checks may receive `429`; verify manually if the app link remains required.

Policy document decision: keep Dropbox policy links external for now. They passed the networked external-link check, and the filenames carry current version/date information. Move policy PDFs/documents into `assets/documents/` only if Time confirms Dropbox is no longer the source of truth and provides a replacement update process.

## Who Owns What

Time office/admin staff own:

- Team profile content and publishing status.
- Support Worker Hub resource content and publishing status.
- Support Worker Hub password rotation in the admin dashboard.
- Contact form mailbox monitoring and FormSubmit activation.
- Confirming policy links, Dropbox documents, Google Forms, and staff-only external resources remain current.
- Sharing staff passwords through approved internal channels.

Developer or deployment owner owns:

- Netlify deployment settings and Basic Auth.
- Supabase project setup, schema changes, RLS policy changes, and storage bucket setup.
- Supabase admin allow-list SQL changes if no existing admin can manage access.
- Static HTML/CSS/JS changes.
- Build/test scripts and release verification.
- Moving external policy/resource files into the repository, if Time chooses that route.

Shared responsibility:

- Running the QA checklist before publishing.
- Reviewing external link reports.
- Confirming content changes do not expose private or sensitive information.
- Keeping service-role keys out of committed files and frontend code.

## Known Limitations And Caveats

- Phase 5 e-learning reliability is still pending. `elearning-modules.html` eagerly embeds many third-party iframes, and one Vimeo URL returns `401` to automated checks.
- Netlify Basic Auth is developer/deployment-managed, not office-admin-managed.
- Supabase-published staff resources are browser-readable after the staff gate by design; do not publish resources that should never be accessible from client-side code.
- FormSubmit activation must be confirmed from the live mailbox after deployment.
- Facebook and some app-store/provider links may block automated link checks.
- Dropbox remains the source of truth for policy documents unless Time approves a local-document workflow.
- `assets/js/supabase-config.js` currently contains the browser publishable key. This is acceptable only with correct RLS; never replace it with a service-role key.

## Future Improvements

- Complete Phase 5 by lazy-loading e-learning embeds and replacing/removing the broken Vimeo module.
- Keep team image references local in `assets/images/team/` when updating CSV fallback data.
- Add real parent testimonials only when wording is approved and consented.
- Add a fuller privacy policy if Time wants more formal GDPR wording from a legal/privacy adviser.
- Consider a true live chat only if the team can monitor it reliably.
- Add privacy-safe analytics only after choosing an owner, provider, and review workflow.
