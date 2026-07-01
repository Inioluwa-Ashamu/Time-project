# Time Specialist Support Website Handover

## Core Routes

- `index.html`: parent-first overview and main service journey.
- `services.html`: autism-specific support, matching, preparation, respite, and community access.
- `about.html`: values, director note, standards, safeguarding, and trust.
- `team.html`: office team and support-worker directory.
- `careers.html`: support-worker recruitment and application links.
- `faq.html`: parent and professional questions.
- `resources.html`: public links and Support Worker Hub entry.
- `support-workers.html`: password-protected worker resources.
- `contact.html`: enquiries, referrals, recruitment, feedback, and complaints.
- `privacy.html`: website enquiry privacy notice.

## Updating Team Data

The team page tries Supabase first, then the published Google Sheet CSV, then the local fallback in `team-data.js`. The fallback is generated from the same CSV source as the Supabase import files, so avoid hand-editing `team-data.js` unless it is an emergency hotfix.

Normal update flow:

1. Update `team-spreadsheet - time-team-directory-sheet.csv` or refresh `team-directory-google-sheet.csv` from the approved Google Sheet export.
2. Run `node scripts/generate-supabase-imports.js --image-mode=storage`.
3. Run `npm run generate:team-data`.
4. Run `npm test` and verify `team.html`.

The current local fallback contains 5 office profiles and 67 support-worker profiles. Local image paths are used where matching files exist in `assets/images/team/`.

## Updating Resources

Support worker resources are managed in Supabase `staff_resources` through `admin/index.html`. A published resource appears in `support-workers.html` after the hub is unlocked. Resources are grouped by `section` and ordered by `section`, `sort_order`, then `title`.

The hard-coded resource sections in `support-workers.html` are the static fallback if Supabase is not configured, unavailable, or has no published staff resources. Keep those fallback links grouped by purpose: safeguarding, session forms, planning, admin, training, and reference material. WordPress-hosted support worker documents have been copied into `assets/documents/support-workers/`; use local links for new resources where possible.

Private/staff access model: the Support Worker Hub is protected by Netlify Basic Auth and the hub password. Office admins can change the hub password in `admin/index.html` under the Access tab; the dashboard stores only a SHA-256 hash in Supabase `site_settings`. Supabase RLS deliberately allows anonymous browser reads of the public `support_worker_password_hash` setting and `published` staff resources with `visibility = 'staff'` or `visibility = 'public'` so the static site can render admin-managed resources after the gate. `admin_users`, admin-only settings, and all admin writes remain restricted to authenticated allow-listed admins.

Netlify Basic Auth is a separate deployment-level gate configured in `netlify.toml` for the worker and e-learning pages. It cannot be changed from the browser admin dashboard. If Time wants one office-managed password only, remove or replace Basic Auth as a later deployment decision; otherwise treat Basic Auth as a deployment-owner password and the hub password as the office-admin-managed worker password.

## Supabase Admin

The team directory can read published public profiles from Supabase before falling back to the Google Sheet/static data in `team-data.js`. Backend setup lives in `supabase/schema.sql` and `supabase/README.md`. Browser code uses only the Supabase publishable key in `assets/js/supabase-config.js`; never add a secret/service-role key to frontend code. The admin dashboard is at `admin/index.html` and requires Supabase Auth plus an `admin_users` allow-list row.

Supabase stores public team profile content, staff resource links, profile image references, the admin allow-list, and the Support Worker Hub password hash. It does not store the plain hub password.

## Password Rotation

To change the Support Worker Hub password:

1. Sign in to `admin/index.html` with an allow-listed office admin account.
2. Open the Access tab.
3. Enter and confirm the new hub password.
4. Save, then open `support-workers.html` in a fresh browser session and confirm the new password unlocks the hub.
5. Share the new password only through Time's approved staff channel.

If the deployed site still uses Netlify Basic Auth and that outer password also needs to rotate, a developer or deployment owner must update the `Basic-Auth` values in `netlify.toml` and redeploy. The browser admin dashboard changes the Support Worker Hub password hash in Supabase; it does not edit Netlify deployment configuration.

## Contact Form

The contact form posts to FormSubmit using `info@time-specialist-support.com`. The form redirects to `thank-you.html` and includes an autoresponse. Test the form after deployment because FormSubmit may require first-time email verification for the receiving address.

FormSubmit endpoint status on 2026-07-01: `https://formsubmit.co/info@time-specialist-support.com` is reachable, but activation cannot be proven from the repository or a GET/HEAD request. After deployment, submit a safe test enquiry and confirm that the message arrives in the `info@time-specialist-support.com` mailbox. If FormSubmit sends an activation email, follow that email before treating the contact route as live.

## Privacy And Safeguarding

The form asks users not to share unnecessary sensitive detail and links to `privacy.html`. Emergency and urgent safeguarding wording appears on the form, quick help assistant, FAQ, privacy page, and thank-you page.

## SEO And Deployment

- `sitemap.xml` lists the public pages.
- `robots.txt` points search engines to the sitemap.
- `netlify.toml` includes security headers, old WordPress-style redirects, and a 404 route.
- `404.html` handles missing pages.

## QA Commands

Run the core handover checks before publishing:

```sh
npm test
```

This runs:

- `npm run check:local`: validates local HTML links, local assets, anchors, image alt text, public page metadata, and sitemap coverage.
- `npm run check:browser`: loads the HTML pages in Playwright from local files, checks mobile overflow, verifies the team directory renders, checks the Support Worker Hub unlock flow, and confirms the admin page reaches either the login or configuration-warning state.

To check third-party links before a release, run:

```sh
npm run check:external
```

This command needs public internet access and is not part of `npm test`, because provider responses can vary and some sites block automated checks. The allow-list lives in `scripts/external-link-allowlist.json`. Keep allow-list entries specific and include a human-readable reason.

The current external link report is in `external-link-report.md`. The latest networked run on 2026-07-01 found 113 passed links, 3 manual-verification links, 2 known-blocked links, and 0 failed links.

Manual verification items:

- Manchester Local Offer: `support-workers.html` now links directly to the current Manchester Service Directory Local Offer page. It was manually verified in browser on 2026-07-01, but automated checks can receive a Cloudflare challenge or `403`.
- Support worker Facebook group: verify using an authorised Facebook account.
- FormSubmit: submit a safe test enquiry after deployment and confirm mailbox receipt.

Known blocked items:

- Vimeo e-learning embed: `elearning-modules.html` still has a `player.vimeo.com` URL that returns `401` to automated checks. This is the broken Vimeo item already listed under Phase 5.
- Apple App Store toilet-finder link: automated checks may receive `429`; verify manually if the app link remains a required worker resource.

Policy document decision: keep Dropbox policy links external for now. They all passed the networked external-link check, and the filenames carry current version/date information. Move policy PDFs/documents into `assets/documents/` only if Time confirms Dropbox is no longer the source of truth and provides a replacement process for future policy updates.

To regenerate the full local team fallback from the team CSV source, run:

```sh
npm run generate:team-data
```

For visual mobile review, run:

```sh
npm run screenshots:mobile
```

This rewrites PNG files in `screenshots/mobile/`; review those diffs before committing them.

## Future Improvements

- Keep team image references local in `assets/images/team/` when updating `team-data.js` or the CSV source files.
- Add real parent testimonials only when the wording is approved and consented.
- Add a fuller privacy policy if Time wants more formal GDPR wording from a legal/privacy adviser.
- Consider a true live chat only if the team can monitor it reliably.
