# Time Specialist Support Website Maintenance

Use this as the quick checklist when the site needs updates.

## Regular Updates

- Team profiles: update `team-data.js` fallback entries and the live Google Sheet source if it is still being used.
- Public resources: update `resources.html` for family-facing links.
- Support worker resources: update `support-workers.html` for staff-only links, forms, and training resources.
- Contact details: check phone, email, recruitment email, and office address in every footer.
- Sitemap: update `sitemap.xml` when a public page is added, removed, or renamed.
- Redirects: update `netlify.toml` if old WordPress URLs or page IDs should point somewhere new.

## Content Rules

- Do not add self-aware copy about the old website or the new website.
- Keep emergency wording short: "This form is not monitored for emergencies. If someone is in immediate danger, call 999 or contact the relevant safeguarding service."
- Do not call the guided assistant "live chat" unless someone is actively monitoring it.
- Keep contact forms focused on information needed to respond to the enquiry.

## Pre-launch Checks

- Open `index.html`, `services.html`, `contact.html`, `team.html`, `resources.html`, `support-workers.html`, `privacy-safety.html`, and `404.html`.
- Test the contact form on the live domain.
- Check mobile navigation at a narrow width.
- Run a broken internal link check.
- Submit the sitemap in Google Search Console after launch.
