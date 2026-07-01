# Time Project Upgrade Plan
https://inioluwa-ashamu.github.io/Time-project/
## Goal

Bring the Time Specialist Support website to a handover-ready state: clear ownership, working content workflows, reliable validation, reduced external-link risk, and documented deployment/admin operations.

## Current Readiness Summary

The static site renders well across public pages, mobile screenshots pass without horizontal overflow, Supabase public team profiles are live, and Netlify routing/protected pages are mostly in place. The remaining work is not a redesign; it is a finishing pass around CMS consistency, test automation, e-learning reliability, stale artifacts, and handover documentation.

## Implementation Status

- Phase 1 - Repository Cleanup And Baseline: implemented on 2026-07-01.
- Phase 2 - Real Test And QA Commands: implemented on 2026-07-01.
- Phase 3 - Support Worker Resources CMS Decision: implemented on 2026-07-01.
- Phase 4 - Complete Team Directory Fallback: implemented on 2026-07-01.
- Phase 5 - E-learning Reliability: implemented on 2026-07-01.
- Phase 6 - External Links And Policy Documents: implemented on 2026-07-01.
- Phase 7 onward: pending.

## Definition Of Done

- `npm test` runs meaningful checks and exits `0` on a healthy project.
- The Support Worker Hub content source is clear: either fully Supabase-driven or explicitly static.
- Team directory fallback data is complete enough for a Supabase/Google Sheets outage.
- E-learning pages load predictably and do not block validation on third-party embeds.
- All local links, local assets, anchors, and important external links are validated.
- Handover docs explain deployment, admin access, content updates, passwords, Supabase setup, and common maintenance tasks.
- The git worktree is clean except for intentionally committed changes.

## S-tier Target

The first nine phases make the project stable, maintainable, and handover-ready. The S-tier version goes further: it should feel trustworthy within the first viewport, guide each audience to the right action, load quickly on mobile, be easy for the Time team to operate, and give leadership enough data to improve the service over time.

### S-tier Principles

- Parents and carers should immediately understand what Time does, who it helps, and why it is safe to enquire.
- Professionals should quickly find referral context, safeguarding posture, standards, and contact routes.
- Applicants should understand the role, expectations, process, and next step without needing a phone call first.
- Current workers should reach forms, policies, training, and session resources quickly.
- Site maintainers should be able to update core content without editing fragile HTML wherever practical.
- Every major claim should be supported by a proof point, policy, process, people, or approved testimonial.

## Phase 1 - Repository Cleanup And Baseline

### Scope

Clean accidental artifacts and establish a stable starting point before feature work.

### Tasks

- Decide whether regenerated screenshots under `screenshots/mobile/` should be committed or reverted.
- Remove the tracked empty `missing` file if it is not intentionally used.
- Confirm `node_modules/` is not part of deployment expectations; keep it ignored if already ignored.
- Add or update `.gitignore` if generated/local files are missing from it.
- Confirm `supabase/imports/team_profiles.csv` is generated in storage mode, matching `supabase/imports/README.md`.

### Files

- `missing`
- `screenshots/mobile/`
- `.gitignore`
- `supabase/imports/team_profiles.csv`
- `supabase/imports/README.md`

### Acceptance Criteria

- `git status --short` contains only intentional upgrade changes.
- `node scripts/generate-supabase-imports.js --image-mode=storage` produces no unexpected diff.

## Phase 2 - Real Test And QA Commands

### Scope

Replace the placeholder test command with useful handover checks.

### Tasks

- Replace `npm test` placeholder with a real smoke test command.
- Add a script that checks:
  - Local HTML links.
  - Local asset references.
  - Cross-page anchors.
  - Image `alt` attributes.
  - Required metadata for public pages.
- Add a browser smoke test for:
  - Public page load.
  - No horizontal overflow.
  - Team directory renders at least one office card and one support card.
  - Support Worker Hub password unlock works.
  - Admin page reaches login state when Supabase is configured.
- Keep `npm run screenshots:mobile`, but make the README clear that it rewrites screenshot artifacts.
- Consider adding `npm run check:links`, `npm run check:browser`, and `npm run check:external`.

### Files

- `package.json`
- `scripts/`
- `HANDOVER.md`

### Acceptance Criteria

- `npm test` exits `0` locally.
- A failing local link or missing asset makes `npm test` exit non-zero.
- Browser smoke checks can run from local files without a separate web server.

## Phase 3 - Support Worker Resources CMS Decision

### Scope

Resolve the mismatch between admin-managed `staff_resources` and the hard-coded Support Worker Hub.

### Current Issue

`admin/admin.js` can create, edit, publish, unpublish, and delete `staff_resources`, but `support-workers.html` renders hard-coded resource cards and `script.js` only searches DOM cards already on the page.

### Preferred Implementation

Make the Support Worker Hub Supabase-driven with static fallback.

### Tasks

- Add a public/staff resource fetcher in `script.js`.
- Fetch `staff_resources` from Supabase after the worker hub is unlocked.
- Render resources grouped by `section`, ordered by `section`, `sort_order`, then `title`.
- Preserve the current hard-coded content as fallback data if Supabase is unavailable or empty.
- Decide whether staff-only resources should be browser-readable:
  - Option A: Keep Netlify Basic Auth as the access gate and allow published `visibility = 'staff'` reads from the anon key.
  - Option B: Keep `staff_resources` admin-only and treat the current static hub as the source of truth.
- If using Option A, update RLS deliberately and document that Basic Auth is the staff access control.
- If using Option B, remove or hide staff resource CRUD from admin to avoid false expectations.

### Files

- `support-workers.html`
- `script.js`
- `admin/admin.js`
- `supabase/schema.sql`
- `supabase/README.md`
- `HANDOVER.md`
- `support-worker-resources.csv`
- `supabase/imports/staff_resources.csv`

### Acceptance Criteria

- A resource created in admin appears in the worker hub after publish, if Supabase-driven is chosen.
- Search works for Supabase-rendered and fallback resources.
- Private/staff resource access model is documented in `HANDOVER.md`.
- Anonymous access to `admin_users` and admin-only writes remains blocked.

## Phase 4 - Complete Team Directory Fallback

### Scope

Make the team page resilient if Supabase and Google Sheets are unavailable.

### Tasks

- Generate `team-data.js` fallback from the same CSV source used for Supabase imports, or add a script that does so.
- Include all active office and support worker profiles in fallback, not only the first 13.
- Preserve local image paths where available.
- Document the update flow:
  1. Update source CSV or Google Sheet export.
  2. Run import generation.
  3. Run fallback generation.
  4. Verify team page.

### Files

- `team-data.js`
- `scripts/generate-supabase-imports.js`
- New script, for example `scripts/generate-team-data.js`
- `team-spreadsheet - time-team-directory-sheet.csv`
- `team-directory-google-sheet.csv`
- `HANDOVER.md`

### Acceptance Criteria

- With Supabase disabled and external fetch blocked, `team.html` still shows the full directory from local fallback.
- Fallback generation is repeatable and documented.
- `team.html` renders 5 office profiles and expected support worker count from local data.

## Phase 5 - E-learning Reliability

### Scope

Reduce load time and third-party embed fragility on `elearning-modules.html`.

### Current Issue

The page embeds many YouTube, Google Slides, and Vimeo iframes at once. It renders, but automated browser checks time out on `networkidle`, screenshots show blank/dark frames while embeds settle, and the Vimeo player URL currently returns `401`.

### Tasks

- Replace eager iframes with lazy-loaded embeds:
  - Render a button or thumbnail placeholder.
  - Only create the iframe when a user opens a module or clicks "Load video".
- Add `loading="lazy"` to remaining iframes where supported.
- Replace or remove the Vimeo embed returning `401`.
- Consider splitting very large sections into separate pages or collapsible modules.
- Update screenshot/browser QA to wait for document readiness instead of all third-party network activity.

### Files

- `elearning-modules.html`
- `extra-elearning.html`
- `orientation-elearning.html`
- `script.js`
- `style.css`
- `scripts/mobile-screenshots.js`

### Acceptance Criteria

- `elearning-modules.html` reaches browser smoke-test completion without a `networkidle` timeout.
- The broken Vimeo module is replaced, removed, or documented as intentionally access-restricted.
- Mobile screenshots still pass without horizontal overflow.

## Phase 6 - External Links And Policy Documents

### Scope

Verify and stabilize important third-party links before handover.

### Tasks

- Add an external link checker script with allow-list support for providers that block automated checks.
- Manually verify the Manchester Local Offer URL that returned `403` to the automated checker.
- Replace blocked/stale URLs with stable alternatives where possible.
- Decide whether Dropbox policy links should be migrated to local files or kept external.
- Confirm FormSubmit has been activated for `info@time-specialist-support.com`.

### Files

- `support-workers.html`
- `policies.html`
- `contact.html`
- `scripts/`
- `HANDOVER.md`

### Acceptance Criteria

- External link report is documented with clear "passed", "manual verify", and "known blocked" categories.
- Contact form is tested after deployment and documented as active.
- Critical policy and safeguarding links are reachable by intended users.

## Phase 7 - Security, Access, And Privacy Review

### Scope

Make sure access controls and handover expectations are explicit.

### Tasks

- Rotate the Support Worker Hub password before handover if the repo has been shared widely.
- Document where the password must be updated:
  - Netlify Basic Auth in `netlify.toml`.
  - Client-side SHA-256 hash in `script.js`.
- Decide whether Support Worker Hub access should remain developer-managed or become office-admin-managed.
- If office-admin-managed, replace the code-managed shared password with a proper access model, such as Supabase Auth, Netlify Identity, or a server-side password validation flow.
- Review whether staff pages need stronger access control than Basic Auth.
- Confirm Supabase RLS policies match the selected staff resource model.
- Keep service-role keys out of frontend code and committed files.
- Add a short privacy/admin note explaining what data is stored in Supabase.

### Files

- `netlify.toml`
- `script.js`
- `supabase/schema.sql`
- `supabase/README.md`
- `HANDOVER.md`
- `.env.example`

### Acceptance Criteria

- Password update process is documented and tested.
- The plan explicitly states whether future password/access changes require a developer or can be handled by an office admin.
- Supabase anon key cannot read admin-only data.
- Admin CRUD requires authenticated allow-listed user.
- No service-role keys are committed.

## Phase 8 - Handover Documentation

### Scope

Turn the current handover notes into an operator-ready document.

### Tasks

- Expand `HANDOVER.md` with:
  - Local setup.
  - Deployment target and Netlify behavior.
  - Supabase setup and admin user creation.
  - Team profile update flow.
  - Support Worker Hub resource update flow.
  - Contact form activation/testing.
  - Password rotation.
  - QA checklist before publishing.
  - Known limitations and future improvements.
- Add a short "quick commands" section.
- Add a "who owns what" section for Time staff/admin responsibilities.

### Files

- `HANDOVER.md`
- `supabase/README.md`
- `supabase/imports/README.md`

### Acceptance Criteria

- A new maintainer can run, validate, update content, and deploy the site using docs alone.
- Known caveats are explicit rather than hidden in code.

## Phase 9 - Final Verification

### Commands

Run these from the repository root:

```sh
npm install
npm test
python3 -m http.server 8765
npm run screenshots:mobile
node scripts/generate-supabase-imports.js --image-mode=storage
git status --short
```

### Manual Checks

- Open the home page, services page, team page, contact page, support worker hub, e-learning module library, and admin login.
- Submit a safe test contact form after deployment.
- Log in to admin with an allow-listed account and create a draft profile.
- Publish/unpublish a test profile and confirm the public team page responds correctly.
- Confirm staff page Basic Auth works on deployed Netlify.
- Confirm 404 route and old WordPress redirects work.

### Acceptance Criteria

- All automated checks pass.
- Manual checklist is complete.
- No unintended generated artifacts remain in git status.
- Handover docs reflect the final implementation, not planned behavior.

## Phase 10 - Audience Journeys And Content Strategy

### Scope

Move beyond "pages exist" into clear, high-trust journeys for each audience.

### Tasks

- Define four primary journeys:
  - Parent/carer looking for support.
  - Professional considering referral or signposting.
  - Applicant considering support work.
  - Current worker looking for resources.
- Audit every page against its intended audience, primary question, and next action.
- Rewrite calls to action so they are consistent and specific.
- Add clearer "what happens next" content for enquiries, referrals, and recruitment.
- Add stronger signposting for urgent safeguarding versus ordinary enquiries.
- Create a content source map that says which content lives in HTML, Supabase, CSV, Dropbox, Google Forms, or external services.

### Files

- `index.html`
- `services.html`
- `about.html`
- `faq.html`
- `careers.html`
- `contact.html`
- `resources.html`
- `HANDOVER.md`

### Acceptance Criteria

- Each primary audience can reach its main next action from the home page in one click.
- Each core page has one obvious primary action and one useful secondary action.
- A maintainer can identify the source of truth for each major content type.

## Phase 11 - Trust, Proof, And Conversion Layer

### Scope

Increase confidence without adding unsupported marketing fluff.

### Tasks

- Add approved trust signals where they are currently implied but not evidenced:
  - Safer recruitment process.
  - Enhanced DBS checks.
  - Training and orientation.
  - Matching and review process.
  - Safeguarding routes.
  - Complaint and feedback routes.
- Add approved testimonials or anonymised case-study snippets only if consent and wording are confirmed.
- Create a "How support starts" section with clear steps from enquiry to matching.
- Add a professional/referrer section covering what information helps Time assess suitability.
- Add a recruitment process timeline with expectations, checks, and onboarding.
- Add structured FAQ groups by audience instead of one flat mixed list if content grows.

### Files

- `index.html`
- `services.html`
- `about.html`
- `faq.html`
- `careers.html`
- `contact.html`
- `style.css`

### Acceptance Criteria

- Trust claims are specific and grounded in real process or policy.
- The enquiry journey feels safer and clearer for families.
- The recruitment journey answers common candidate questions before application.

## Phase 12 - Visual Design And Interaction Polish

### Scope

Make the site feel more polished, less templated, and easier to scan while preserving the existing calm brand direction.

### Tasks

- Review spacing, type scale, page rhythm, and repeated section patterns across all public pages.
- Reduce visual monotony by varying section structure where appropriate.
- Improve staff/resource search ergonomics.
- Add better loading and empty states for Supabase-powered sections.
- Improve focus states, keyboard behavior, and skip-link visibility.
- Optimize mobile navigation and quick-help behavior.
- Make page footers and repeated navigation easier to maintain.

### Files

- `style.css`
- `script.js`
- All public `.html` pages as needed.

### Acceptance Criteria

- No text overlap or horizontal overflow at small mobile widths.
- Keyboard navigation is usable for nav, quick help, forms, search, and profile expand/collapse.
- Supabase loading, empty, and fallback states are visible and human-readable.
- Mobile screenshots look intentionally designed, not merely functional.

## Phase 13 - Performance And Asset Optimization

### Scope

Make the site fast and resilient on real mobile networks.

### Tasks

- Optimize large images in `assets/images/team/` and preserve reasonable display quality.
- Add explicit image dimensions or aspect-ratio rules where layout shifts occur.
- Lazy-load below-the-fold images.
- Review `style.css` size and remove unused or duplicate rules where safe.
- Lazy-load third-party embeds and avoid `networkidle` dependency for QA.
- Consider local thumbnails for video modules.
- Add basic performance budgets for page weight and image sizes.

### Files

- `assets/images/team/`
- `assets/videos/`
- `style.css`
- `script.js`
- `elearning-modules.html`
- `scripts/mobile-screenshots.js`
- New performance/check scripts as needed.

### Acceptance Criteria

- Home, services, team, and contact pages load quickly on mobile.
- E-learning page no longer eagerly loads every video/slide provider.
- Image-heavy team page remains usable and stable during load.

## Phase 14 - SEO, Structured Data, And Local Search

### Scope

Improve discoverability for local autism support and recruitment searches without compromising accuracy.

### Tasks

- Add canonical URLs for public indexable pages.
- Add Open Graph and social preview metadata.
- Add structured data where appropriate:
  - Organisation.
  - Local business/service.
  - FAQ page, if content remains suitable.
  - Breadcrumbs, if navigation structure grows.
- Review page titles and descriptions for local search intent.
- Strengthen internal links between services, FAQs, team, careers, and contact.
- Keep staff/protected pages out of the sitemap and search index.
- Add sitemap generation/checking if routes grow.

### Files

- Public `.html` pages.
- `sitemap.xml`
- `robots.txt`
- New metadata helper/generator if worthwhile.

### Acceptance Criteria

- Every indexable public page has a canonical, title, description, and appropriate social metadata.
- Protected/staff pages remain noindex and absent from the sitemap.
- Local service intent is clear without keyword stuffing.

## Phase 15 - Analytics, Feedback, And Continuous Improvement

### Scope

Give the team enough evidence to improve the website after handover.

### Tasks

- Decide on an analytics provider that fits privacy expectations.
- Track key non-sensitive events:
  - Contact form started.
  - Contact form submitted.
  - Recruitment form clicked.
  - Support Worker Hub opened.
  - Team search used.
  - Resource search used.
  - E-learning module opened.
- Add a simple monthly review checklist:
  - Broken links.
  - Form submissions.
  - Recruitment clicks.
  - Most-used support resources.
  - Search terms with no resource result.
- Document analytics ownership and privacy wording.

### Files

- `script.js`
- `contact.html`
- `careers.html`
- `support-workers.html`
- `privacy.html`
- `HANDOVER.md`

### Acceptance Criteria

- Analytics do not collect unnecessary sensitive personal information.
- The team can review useful site health and conversion signals monthly.
- Privacy notice reflects the analytics setup if analytics are added.

## Recommended Implementation Order

1. Clean repo baseline.
2. Add real test scripts.
3. Decide and implement staff resource CMS behavior.
4. Generate complete team fallback.
5. Stabilize e-learning embeds.
6. Verify/replace external links.
7. Review security and rotate staff password if needed.
8. Expand handover docs.
9. Run final verification and prepare release commit.
10. Rework audience journeys and content strategy.
11. Add proof, trust, and conversion improvements.
12. Polish visual design and interactions.
13. Optimize performance and heavy assets.
14. Add SEO, structured data, and local search improvements.
15. Add analytics and continuous improvement workflow.

## Release Checklist

### Handover-ready Release

- [ ] `npm test` passes.
- [ ] `npm run screenshots:mobile` passes.
- [ ] Supabase public/team/admin access checked.
- [ ] Contact form tested on deployed domain.
- [ ] Staff pages protected on deployed domain.
- [ ] E-learning modules manually sampled.
- [ ] External link report reviewed.
- [ ] `HANDOVER.md` updated.
- [ ] Git worktree clean.

### S-tier Release

- [ ] Primary audience journeys reviewed and tightened.
- [ ] Trust/proof content approved by Time.
- [ ] Testimonials or case studies have explicit approval and consent, if used.
- [ ] Core pages meet mobile performance expectations.
- [ ] E-learning embeds lazy-load or are otherwise controlled.
- [ ] Public pages have canonical/social/structured metadata where appropriate.
- [ ] Analytics or feedback measurement is documented and privacy-safe.
- [ ] Monthly maintenance checklist is in `HANDOVER.md`.
