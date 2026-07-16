# Time Website Roadmap

## Goal

Make day-to-day website updates manageable from the admin page, using Supabase for content that changes often and keeping static HTML for stable page structure.

## Current Admin Coverage

- Team profiles: office and support-worker profiles, images, order, publish status.
- Staff resources: Support Worker Hub links/documents/forms/videos.
- Access: Support Worker Hub password hash.

## Recommended Admin Sections

### 1. Resources

Expand the current staff resources manager into a broader resource manager.

Content to manage:
- Public resource links.
- Parent/carer resources.
- Professional/referral links.
- Candidate/recruitment links.
- Staff hub resources.
- Policy/document links.
- Quick action links.

Suggested fields:
- `title`
- `description`
- `section`
- `audience`
- `resource_type`
- `url`
- `link_label`
- `quick_action`
- `published`
- `sort_order`

Priority: High.

### 2. E-learning

Move e-learning modules out of hardcoded HTML and into Supabase.

Content to manage:
- Module title.
- Category, such as Admin, Theory, Practical, Extra.
- Short description.
- Video or embed URL.
- Quiz/form URL.
- Document/resource links.
- Page placement.
- Published status.
- Sort order.

Priority: High.

### 3. Site Settings

Manage repeated operational details in one place.

Content to manage:
- Main phone number.
- General enquiries email.
- Recruitment email.
- Bookings/feedback email.
- Address.
- Footer copy.
- Contact form endpoint.
- Contact form thank-you URL.

Priority: High.

### 4. FAQs

Make FAQ content editable by category/page.

Content to manage:
- Question.
- Answer.
- Category/page.
- Published status.
- Sort order.

Priority: Medium.

### 5. Careers

Manage recruitment-specific content from admin.

Content to manage:
- Current opportunity text.
- Pay/location notes.
- Application form link.
- Job description link.
- Recruitment video.
- Equal opportunities/policy links.
- Published status.

Priority: Medium.

### 6. Access

Keep the existing Support Worker Hub password manager.

Potential future additions:
- Admin-facing notes about who has access.
- Last updated details for access settings.

Priority: Existing.

## Suggested Build Order

1. Expand Resources.
2. Add E-learning manager.
3. Add Site Settings.
4. Add FAQs.
5. Add Careers.

## Implementation Notes

- Public pages should read from Supabase first and fall back to local/static content where sensible.
- Keep stable layout and page structure in HTML/CSS.
- Use Supabase for content that changes often, links that need updating, and content that non-developers should be able to edit.
- Avoid putting secrets in browser-readable Supabase tables.
- Keep staff-only content behind the existing Support Worker Hub gate, but remember browser-readable Supabase content is not suitable for highly sensitive material.

