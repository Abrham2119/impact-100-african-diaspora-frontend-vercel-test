# Claude Code prompt playbook: Impact 100 African Diaspora

Paste these prompts into Claude Code **one at a time, in order**. Each prompt is tagged with the terminal it belongs to:

- **[BE]** runs in the backend terminal: `cd …/impact-100-african-diaspora-backend && claude`
- **[FE]** runs in the frontend terminal: `cd …/impact-100-african-diaspora-frontend && claude`

## How to work

1. **One prompt per session.** Run `/clear` before each new step so the context stays clean. CLAUDE.md is re-read automatically.
2. **Plan first.** Press `Shift+Tab` to switch to **plan mode**, paste the prompt, review the plan, then approve it.
3. **Review and commit.** After each step, review the diff, run the app, and commit (`git add -A && git commit -m "step N: …"`).
4. **Watch the UI.** If Claude starts changing the UI, stop it with `Esc` and say: *"Stop. The design in design-reference is fixed. Revert the visual changes."*
5. **Content and languages.** Every public text, image, button, banner, gallery and video must be manageable from the admin dashboard in every language (see `CONTENT_AND_I18N.md`). Nothing public-facing stays hard-coded.
6. **New packages.** If Claude asks for a new package, say yes only when it is really needed. Your CLAUDE.md forbids unapproved packages.

---

## STEP 0: Manual setup (you, not Claude)

```bash
# Backend
cd ~/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-backend
git checkout -b feat/impact100
cp .env.example .env
npm install
docker compose up -d postgres redis kafka zookeeper
npm run db:generate && npm run db:push && npm run seed
npm run dev                       # gateway on http://localhost:3000

# Frontend (second terminal)
cd ~/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-frontend
unzip -o design-reference.zip && rm design-reference.zip   # pages, snapshots, CSS, images
git checkout -b feat/impact100
cp .env.example .env              # set VITE_API_BASE_URL=/api to use the Vite proxy
npm install
npm run dev                       # http://localhost:5173

# Look at the design (third terminal)
cd ~/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-frontend
python3 -m http.server 4000 -d design-reference   # open http://localhost:4000/snapshots/index.html
```

---

## STEP 1 [BE]: Understand the codebase and write the architecture (plan only, no code)

```
Read CLAUDE.md, STRUCTURE.md, README.md, docs/BUSINESS_RULES.md, docs/CONTENT_AND_I18N.md, docs/IMPLEMENTATION_PLAN.md and the frontend design
reference at ../impact-100-african-diaspora-frontend/design-reference (README.md, ROUTES.md, and skim pages/*.dc.html
to see the fields, filters and actions each screen needs).

Do NOT write code yet. Produce docs/ARCHITECTURE.md containing:
1. Which existing services we reuse (auth, user, permission, notification, gateway) and what changes in each.
2. New services, following the exact existing service anatomy:
   content-service (CMS), engagement-service, membership-service (campaigns, pledges, payments, donations),
   governance-service (ballots, votes, decisions, amendments, results, nominations, signing, reviews).
   Justify each boundary; propose ports and DB names consistent with STRUCTURE.md.
3. The full Prisma data model per service (entities, fields, relations, indexes, enums). Money in integer cents.
   The content model MUST be multilingual from day one, as in docs/CONTENT_AND_I18N.md: Locale, Page → Section →
   SectionItem, translatable FieldValue per locale, language-specific media, collections with per-locale slugs, UiString,
   versions — one page tree, never duplicated per language. Also decide how other services' public text (e.g. event
   titles, volunteer roles, campaign names) is translated.
4. The REST API contract for every screen in ROUTES.md: method, path via the gateway, auth/permission, request,
   response, pagination, filters. Group by service.
5. Kafka events between services (e.g. payment.received → eligibility.recomputed → notification).
6. Roles and the permission matrix (Visitor, Member, Voting member, Reviewer, Hub co-Ambassador, Editor, Finance,
   Chapter admin, Super admin) mapped to the existing PERMISSIONS constants.
7. The WAZIImpact.org payment adapter interface + webhook flow (mock implementation until the real API is confirmed).
8. Locale resolution + fallback rules and the public content API (cache keys include locale and version).
9. Risks, open questions for the client (e.g. which languages to launch with), and the build order.
Ask me questions where a rule is ambiguous instead of guessing.
```

## STEP 2 [FE]: Understand the frontend and plan the port (plan only, no code)

```
Read CLAUDE.md, README.md, IMPLEMENTATION_PLAN.md, everything in design-reference/ (README, ROUTES, DESIGN_SYSTEM,
BUSINESS_RULES, CONTENT_AND_I18N) and ../impact-100-african-diaspora-backend/docs/ARCHITECTURE.md.

Do NOT write code yet. Produce ARCHITECTURE.md for the frontend containing:
1. How the design CSS (design-reference/assets/css) is loaded globally and how it coexists with Tailwind
   (recommend preflight off; prove nothing in the starter breaks).
2. Folder plan inside the existing Clean Architecture: where layouts, shared design components, feature slices
   (content, events, news, grants, membership, donations, volunteer, contact, portal, governance, admin, cms) go.
3. Component inventory: every repeated block in the snapshots → one React component (name, props, source classes).
4. Route table from design-reference/ROUTES.md with layout, guard (public / auth / role) and data source.
5. How each .dc.html state/renderVals maps to React state, React Query hooks, URL params (hash deep links → search params).
6. API client plan: endpoints registry additions, types, React Query keys, error/loading/empty states.
7. Content-driven rendering: a section registry that maps each CMS section type to one design component (typed field
   schema shared with the backend), a <CmsPage pageKey> renderer, and how every public page is composed from it.
8. i18n plan: locale state (URL/param/cookie/user preference), the existing top-bar language select as the switcher,
   React Query keys including locale, <html lang dir>, hreflang, UiString lookup with fallback, RTL readiness.
9. Any package you think is needed (and why) — do not install anything.
Ask me questions where the design is unclear.
```

## STEP 3 [FE]: Design system, assets and global styles

```
Implement Phase "Design system" from ARCHITECTURE.md:
- Copy design-reference/assets/images → src/assets/images and design-reference/assets/css → src/styles/design/
  (unchanged). Load fonts + CSS globally in the documented order. Apply the Tailwind preflight decision.
- Create the shared design components from the inventory (SectionHeading, Button/CommonBtn, Card, Badge, Chip, ResultBox,
  FormField/ContactInput, Select, Flow/Steps, Timeline, Table, Accordion, Breadcrumb banner, Slider, Pagination) that
  render EXACTLY the class names and markup of the snapshots.
- Add a dev-only /design route that shows every component, like the Main and Components boards.
Do not build pages yet. Run lint, typecheck, build. Screenshot /design and compare with
design-reference/snapshots/Components.html and Main.html.
```

## STEP 4 [FE]: Layouts, navigation and the router

```
Implement the four layouts and the router:
- PublicLayout: top info bar, header with mega menus (About two-column with icons, Opportunities, Grants, Events, News),
  Donate / Become a member / account icon, breadcrumb banner, footer with newsletter. Build from one typed navConfig copied
  from snapshots/index.html. Hover/active rules: only hovered and active item orange. Mobile menu shows every item.
- AuthLayout for sign-in screens.
- PortalShell and AdminShell: navy top bar, icon rail (first item "Dashboard"), section sidebar that lists only the active
  rail group's pages (no chevrons), breadcrumb + h1. Configs from snapshots/portal.html and snapshots/admin.html.
- Register EVERY route in design-reference/ROUTES.md with a placeholder page using the right layout and guard.
Compare header, footer and both shells with the snapshots at 1440 and 390 px; fix every difference.
```

## STEP 5 [FE]: Public pages A (static first, data behind typed content files)

```
Build these pages pixel-identical to their snapshots, with behaviour from their .dc.html:
index (hero 3 slides, about, purpose, campaign cycle, four ways to belong, WAZI, campaigns, events slider, etc.),
about_us, committees (?c=), charter (sticky TOC + version select), our_model, volunteers, testimonial, donot_list,
photo_gallery, video_gallery, faq, privacy, newsletter_confirmed, unsubscribed.
Build every page from CMS section components (the registry from ARCHITECTURE.md), NOT hard-coded JSX copy. Until the
API exists, feed them from typed fixture files under src/features/content/fixtures/<locale>/ shaped EXACTLY like the
content API response (page → sections → items → fields, media), in English. One source per dataset (e.g. events are
used by BOTH the home slider and /events). All microcopy goes through the UiString helper. Swapping to the API later
must not touch the components.
After each page: screenshot vs snapshot (1440 + 390), list differences, fix.
```

## STEP 6 [FE]: Public pages B (interactive)

```
Build these pages pixel-identical with full client behaviour from their .dc.html:
grants (inline SVG Africa map from the snapshot — every Sub-Saharan country incl. Sudan and Somaliland selectable, list
and map in sync, interest chips, "Projects under review here" filtered by country + interest, "Volunteer roles for you",
How grants are selected, Roadmap), nonprofits (5 steps, 4-question eligibility check, 7 FAQs), campaign_list,
campaign_details, category, event + event_details (8 events, RSVP, US hubs launch plan), hubs, blogs + blog_details +
share_story, contact (6 topics, ?topic=), volunteer (filters with counts, tray, validation), join (Level → Details →
Payment → Done, installments), donate (Direct donor, 4 portfolios, Sub-Saharan country), donate_thanks, cancel_gift,
contact_thanks, volunteer_thanks.
All copy, images, buttons, map labels, FAQs, steps and galleries come from CMS fixtures/sections (no hard-coded text).
Forms use react-hook-form + zod; error texts come from UiStrings with the exact English wording from the design. Submissions call typed API functions
(mocked for now). Screenshot vs snapshot and fix differences.
```

## STEP 7 [BE]: Auth, users, roles and permissions

```
Implement the auth/user/permission changes from docs/ARCHITECTURE.md:
passwordless email-link sign-in (keep existing password/OTP flows working), two-step verification (reuse existing 2FA),
WAZI SSO behind an adapter (stub), user profile fields needed by the design (hub, interests: portfolio + country,
preferences, privacy/consent), the roles and permission matrix seeded via the permission service.
Unit-test the new flows. Update Swagger + postman_collection.json. Do not break existing endpoints.
```

## STEP 8 [BE]: content-service: multilingual CMS for every public page

```
Create content-service following the existing anatomy and docs/CONTENT_AND_I18N.md exactly.
First inspect the existing services, shared packages and i18n middleware and reuse them.

Data model (Prisma): Locale, Page, Section, SectionItem, FieldValue (per locale, nullable for non-translatable),
Media + language-specific media, FieldMedia, Collection/CollectionEntry (news, events, hubs, committees, leadership,
partners, sponsors, testimonials, FAQs, galleries, volunteer roles display text, portfolios, values, charter versions and
sections), NavMenu/NavItem, UiString, ContentVersion. One page tree — never duplicate pages per language.

Section types = the design blocks (hero_slider, section_heading, rich_text, card_grid, flow_steps, timeline, faq,
image_gallery, video, cta_band, event_slider, campaign_cards, stats, map_hub_panel, …). Each type has a typed field
schema (Joi here, exported as JSON/TS for the frontend) covering headings, descriptions, images, buttons, banners,
galleries and inline videos.

Features: add / edit / replace / duplicate / hide / delete / reorder sections and items; translations per field with
missing/outdated status; language-specific images and videos (+ captions per locale); media upload (reuse existing
storage approach or propose one), alt text per locale, usage tracking; draft → review → published, scheduled publish,
preview tokens per locale, version history + restore; locale management (enable, default, fallback, ltr/rtl);
UiString management; SEO fields per page and locale; audit events for every change; permissions (editor, translator,
publisher).
Public API: GET page by key/route with ?locale= → resolved fields with fallback (+ resolvedLocale, isFallback),
collections with pagination and per-locale slugs, navigation, UiStrings bundle; cached by (key, locale, version) and
invalidated on publish. Admin CRUD APIs for everything above.
Seed: ALL copy, images and videos currently in the design snapshots, in English, so pages render identically.
Unit + integration tests (fallback, ordering, publish/versioning, permissions). Swagger + Postman.
```

## STEP 9 [BE]: engagement-service

```
Create engagement-service: contact submissions with 6 topics and routing rules (admin_routing), volunteer roles
(19, by area) + sign-ups with tray, newsletter double opt-in / confirm / unsubscribe, event RSVPs, share-a-story
submissions (editor review), nonprofit partner interest + eligibility answers, "I'd like to help" committee interest.
Emit Kafka events for notifications. Admin list/filter/export endpoints. Tests + Swagger + Postman.
```

## STEP 10 [BE]: membership-service (campaigns, pledges, payments, donations)

```
Create membership-service enforcing docs/BUSINESS_RULES.md exactly:
campaigns (one active, $100,000 goal, Oct 1 – Mar 31, auto move to history), memberships per campaign (buy / renew),
pledges + installments (≤6, rounded up to $5, done by Mar 31), payments ledger, Apr 1 – Sep 30 crediting to next cycle,
level + voting-eligibility computation (≥ $501 received when a vote opens), charter-eligibility, overpayment flags,
offline payments (finance role), reconciliation runs, direct-donor donations (portfolio + Sub-Saharan country, monthly
gifts + cancel), exports. WAZIImpact.org adapter + signature-verified idempotent webhook (mock provider for dev).
Unit tests for every rule (boundaries: $500 vs $501, Mar 31 vs Apr 1, rounding). Tests + Swagger + Postman.
```

## STEP 11 [BE]: governance-service

```
Create governance-service: ballots (schedule, eligible voters frozen at open), proposals, voting with COI confirmation,
one vote per member, receipts, live turnout vs quorum (50% rounded up, abstentions excluded), outcome rules
(no quorum → fail, tie → fail, else majority), chapter decisions + amendments (≥10 chars, circulate, adopt → new charter
version via content-service event), results publishing, suggestions/nominations (priority / nominee / proposal),
charter signing (typed-name match, eligibility from membership-service), rubric settings (5 criteria, weights),
reviewer assignments, scoring, review board. Audit every admin action. Unit tests for quorum/outcome. Swagger + Postman.
```

## STEP 12 [BE]: Notifications, audit, gateway, seed

```
Wire everything together: gateway routes for the new services, aggregated Swagger, rate limits for public forms,
email templates (admin_emails) + delivery log (admin_delivery) through notification-service for: magic link, payment
received, installment reminder, eligibility reached, charter ready to sign, ballot open/closing, results published,
newsletter confirm, RSVP confirmation, contact routing. Central audit log endpoint (admin_audit, admin_audit_entry).
Seed script that creates demo users for every role and the sample data shown in the design. Update README.
Run typecheck and all tests.
```

## STEP 13 [FE]: Connect the public site to the API

```
Replace the content fixtures with the real multilingual content API (React Query keys include locale; language switch
re-fetches and keeps the current page; html lang/dir + hreflang; fallback handled). Then the other endpoints in
../impact-100-african-diaspora-backend/docs/ARCHITECTURE.md. Add endpoints to src/infrastructure/api/endpoints.ts,
feature api/ services that unwrap { success, message, data } into domain types, query keys, loading / empty / error
states in the design's style. Wire every public form (contact, volunteer, newsletter, RSVP, share story, nonprofit
interest, join, donate) to the API with the design's success screens. Visual output must not change — prove it with
screenshots vs snapshots. Finally add the "no hard-coded public content" check from CONTENT_AND_I18N.md §5.
```

## STEP 14 [FE]: Auth flows

```
Wire sign_in (email link + WAZI SSO button), check_email, two_step, two_step_enrol, sign_up and forgot_password to the
auth API, reusing authStore, ProtectedRoute, PermissionRoute and <Can>. Redirect members to /portal and admins to /admin.
The account icon menu in the header shows Member login / Become a member / Member portal / Admin console per role.
```

## STEP 15 [FE]: Member portal

```
Build and wire every portal screen in ROUTES.md inside PortalShell, pixel-identical to snapshots:
portal summary (membership card, pay-next-installment card with fixed height and overlay result, 4 status cards),
history (memberships + direct donations), vote + proposal + receipt (COI dialog, turnout vs quorum), decisions +
amendment, results + result, suggest, sign + signed (locked until eligible, typed-name match), reviews + score,
profile, privacy. Use the permission/eligibility data from the API — never compute eligibility only on the client.
```

## STEP 16 [FE]: Admin console and CMS studio

```
Build and wire every admin screen in ROUTES.md inside AdminShell, pixel-identical to snapshots, grouped as in the rail:
Overview (chapter / finance / hub dashboards, exports), People (people, person, roles, permission matrix), Charter rules
(campaigns with fixed $100,000 goal, settings, approvals, settings history), Payments (ledger, offline payment, flags,
reconciliation), Governance (ballots, new proposal, decisions, publish results, nominations, signatures, rubric, review
board), Engagement (sign-ups, submissions, routing), Content (CMS studio + preview), System (emails, delivery log,
audit log + entry).
CMS studio (inside the existing admin_cms / admin_preview designs, reusing their components): page → section → item
tree in live order; add / edit / replace / duplicate / hide / delete / reorder (drag + keyboard); typed field editors
for text, rich text, links/buttons, images, banners, galleries and inline videos; media library with replace, alt text
per locale and language-specific variants; side-by-side translation editor with missing/outdated badges and progress;
locale settings; UiString editor; draft/review/publish, schedule, per-locale preview, version history + restore. Tables: server-side pagination, filters, sorting, compact pill actions. Every action guarded by <Can>.
```

## STEP 17 [BOTH]: Testing and QA

```
[BE] Raise test coverage on business rules and API integration tests for each service (happy path + permission denied +
validation errors). [FE] Add component/hook tests for forms, eligibility display, map selection, voting dialog.
Then run a full visual QA: for every route in design-reference/ROUTES.md screenshot 1440 and 390 px and compare with the
snapshot; produce QA_REPORT.md with differences and fix them. Run an accessibility pass (labels, focus, contrast, aria
from the design). Propose (don't install) any test tooling we lack.
```

## STEP 18 [BOTH]: Production readiness

```
Prepare for production without changing behaviour: security review (helmet/CORS/rate limits, input validation, auth
token storage, CSRF on cookie flows, webhook signatures, secrets in env only, OWASP top 10), performance (code-splitting
per route, image sizes, React Query caching, DB indexes, N+1), env configs for dev/staging/prod, Dockerfiles +
docker-compose.prod, CI pipeline (lint, typecheck, test, build), structured logging, health checks, error monitoring
hooks, DB migrations + backups, and a DEPLOYMENT.md runbook. List anything that needs a decision from me.
```

---

## Reusable prompts (any time)

**Fix a UI mismatch [FE]**
```
The page <route> does not match design-reference/snapshots/<file>.html. Screenshot both at 1440 and 390 px, list every
difference (spacing, font, colour, copy, image, order), then fix only those — no other changes.
```

**New content from the client [FE or BE]**
```
Here is new content for <page/section>: <paste>. Keep the existing design; change only the content. Put it in the CMS
seed / content source (not hard-coded in JSX). Tell me which section you used for what. Don't add sections or UI
without asking; ask before removing any section; use only my content.
```

**Make all public content CMS-managed and multilingual [BOTH]**
```
Review all public pages and make all their content dynamically manageable through the admin dashboard, including
headings, descriptions, images, buttons, banners, galleries, and inline videos. Ensure administrators can add, edit,
replace, reorder, and publish content without modifying the code.
Very important – multilingual support: design the content architecture to support multiple languages from the
beginning; allow administrators to manage translations for every content item; support language-specific text, images,
and videos where necessary; public pages display content according to the selected language; support language
switching and fallback translations; avoid duplicating pages for different languages.
Implement everything across the frontend, backend, database, and admin dashboard, following design-reference/
CONTENT_AND_I18N.md. Follow the existing architecture, use TypeScript, preserve the current UI/design, and avoid
unnecessary refactoring. First inspect the existing implementation and reuse available components and functionality.
Do not leave any public-facing content hardcoded if it should be manageable from the admin dashboard. Finish with a
list of every public page and confirmation that each field is CMS-driven and translatable.
```

**Continue after a break**
```
Read CLAUDE.md, IMPLEMENTATION_PLAN.md and ARCHITECTURE.md, check git log and git status, tell me which step we are on
and what is left, then continue that step.
```

**Review before commit**
```
Review the uncommitted changes as a senior engineer: bugs, rule violations (CLAUDE.md, BUSINESS_RULES.md), design drift,
missing loading/error states, missing tests, security issues. Fix what you find and summarise.
```
