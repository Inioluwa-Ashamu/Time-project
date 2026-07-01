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

Private/staff access model: the Support Worker Hub is protected by Netlify Basic Auth and the client-side hub password. Supabase RLS deliberately allows anonymous browser reads of `published` staff resources with `visibility = 'staff'` or `visibility = 'public'` so the static site can render admin-managed resources after that gate. `admin_users` and all admin writes remain restricted to authenticated allow-listed admins.

## E-learning Modules

`elearning-modules.html` uses lazy media placeholders for YouTube and Google Slides training items. The page does not create third-party iframes until a worker clicks `Load training media`, which keeps local QA and mobile screenshots from waiting on external embed networks.

The previous Vimeo embed for "Top five signs of exploitation to look out for" is removed because Vimeo/Cloudflare returned an access-restricted challenge during handover checks on 2026-07-01. Replace it only when Time has an approved source that loads reliably for workers.

## Supabase Admin

The team directory can read published public profiles from Supabase before falling back to the Google Sheet/static data in `team-data.js`. Backend setup lives in `supabase/schema.sql` and `supabase/README.md`. Browser code uses only the Supabase publishable key in `assets/js/supabase-config.js`; never add a secret/service-role key to frontend code. The admin dashboard is at `admin/index.html` and requires Supabase Auth plus an `admin_users` allow-list row.

## Contact Form

The contact form posts to FormSubmit using `info@time-specialist-support.com`. The form redirects to `thank-you.html` and includes an autoresponse. The FormSubmit endpoint responded successfully to a handover check on 2026-07-01, but final activation still requires the recipient mailbox confirmation email if FormSubmit has not already been activated for this address.

## External Links And Policy Documents

Run the external link report before handover or after content updates:

```sh
npm run check:external
```

This reports external URLs as `passed`, `manual verify`, `known blocked`, or `failed`. Allow-list rules live in `scripts/external-link-allowlist.json` for providers that block automated checks.

The Manchester Local Offer link in `support-workers.html` returned a Cloudflare challenge/`403` to automation on 2026-07-01, so it is marked `manual verify`. Check it in a normal browser during final handover QA.

The careers application Google Form redirects to a Google sign-in flow in automated checks, so it is also marked `manual verify`. Before go-live, confirm the form is intentionally sign-in restricted or update the form sharing settings/link if public applicant access is preferred.

Policy documents are intentionally kept as Dropbox links for this phase because the current links point to live, versioned policy files. A future content pass should migrate approved policy PDFs into local `assets/documents/` files or an approved CMS/storage bucket if Time wants the site to be independent of Dropbox.

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

External link checks are intentionally separate from `npm test` because they depend on third-party network behavior:

```sh
npm run check:external
```

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
