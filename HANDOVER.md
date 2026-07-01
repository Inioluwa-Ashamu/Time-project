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

The team page is driven by `team-data.js` and the CSV files in the repo. Keep names, roles, biographies, teams, and image URLs consistent. The JavaScript falls back to local data if a remote source is unavailable.

## Updating Resources

Support worker resources live in `support-workers.html`. Keep links grouped by purpose: safeguarding, session forms, planning, admin, training, and reference material. WordPress-hosted support worker documents have been copied into `assets/documents/support-workers/`; use local links for new resources where possible.

## Supabase Admin

The team directory can read published public profiles from Supabase before falling back to the Google Sheet/static data in `team-data.js`. Backend setup lives in `supabase/schema.sql` and `supabase/README.md`. Browser code uses only the Supabase publishable key in `assets/js/supabase-config.js`; never add a secret/service-role key to frontend code. The admin dashboard is at `admin/index.html` and requires Supabase Auth plus an `admin_users` allow-list row.

## Contact Form

The contact form posts to FormSubmit using `info@time-specialist-support.com`. The form redirects to `thank-you.html` and includes an autoresponse. Test the form after deployment because FormSubmit may require first-time email verification for the receiving address.

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
