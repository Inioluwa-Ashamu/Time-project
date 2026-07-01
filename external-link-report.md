# External Link Report

Last checked: 2026-07-01

Command:

```sh
npm run check:external
```

The command requires public internet access. If it is run in a sandbox without network access, every non-allow-listed link may show `fetch failed`; rerun it from a normal local terminal or with network permission.

## Summary

- Passed: 113 external URLs.
- Manual verify: 3 external URLs.
- Known blocked: 2 external URLs.
- Failed: 0 external URLs.

## Passed

The networked run returned successful HTTP responses for:

- All Dropbox policy links in `policies.html`, `being-open.html`, `modern-slavery.html`, `careers.html`, and `contact.html`.
- Support Worker Hub Google Forms, Google Sheets, booking system, Google Play, YouTube, Vimeo, Red Cross, High Speed Training, Day Out With The Kids, and Dropbox resource links. The Apple App Store link is listed under known blocked because it returned `429` during the latest run.
- E-learning Google Forms, Google Slides, YouTube embeds, Dropbox file, NAPAC, NHS, and Epilepsy Action links.
- Supabase CDN script links.

## Manual Verify

- `https://www.manchesterservicedirectory.co.uk/kb5/manchester/directory/localoffer.page?localofferchannel=0`
  - Source: `support-workers.html`
  - Reason: verified in browser on 2026-07-01 as "Welcome to Manchester Local Offer", but automated checks can receive a Cloudflare challenge or `403`.
- `https://www.facebook.com/groups/154269294662396`
  - Source: `support-workers.html`
  - Reason: Facebook group pages may require login or show interstitials; staff access should be checked with an authorised account.
- `https://formsubmit.co/info@time-specialist-support.com`
  - Source: `contact.html`
  - Reason: the endpoint is reachable, but activation can only be confirmed by submitting the deployed form and checking `info@time-specialist-support.com`.

## Known Blocked

- `https://player.vimeo.com/video/492134079?dnt=1&app_id=122963`
  - Source: `elearning-modules.html`
  - Result: `401` to automated request.
  - Note: this is the Vimeo e-learning embed already called out in Phase 5. It should be replaced, removed, or documented when Phase 5 is implemented.
- `https://apps.apple.com/gb/app/toilet-finder/id311896604`
  - Source: `support-workers.html`
  - Result: `429` to automated request.
  - Note: Apple App Store sometimes rate-limits automated checks. Verify manually before handover if this toilet-finder app remains a required support-worker resource.

## Policy Documents

Dropbox policy links are being kept external for this handover pass. They all returned `200` in the networked checker, and the filenames include current policy version/date information such as `6.25` and `7.25`. Migrating them into local files should only happen if Time confirms Dropbox is no longer the source of truth and provides an update process for replacing policy versions.
