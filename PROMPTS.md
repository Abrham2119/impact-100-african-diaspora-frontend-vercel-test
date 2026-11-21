# Claude Code prompt playbook: Impact 100 African Diaspora

The work has two parts. Finish Part A completely before you start Part B.

- **Part A: frontend only.** Build every screen: the public site, auth, the member portal, the admin console, the CMS studio and multilingual support. Everything runs on the **existing dummy data** from the design. No backend calls.
- **Part B: backend and integration.** Build the APIs and database, then connect the finished frontend to them one feature at a time.

Each prompt is tagged with the terminal it belongs to:

- **[FE]** runs in the frontend terminal: `cd …/impact-100-african-diaspora-frontend && claude`
- **[BE]** runs in the backend terminal: `cd …/impact-100-african-diaspora-backend && claude`

## How to work

1. **One prompt per session.** Run `/clear` before each new step. CLAUDE.md is re-read automatically.
2. **Plan first.** Press `Shift+Tab` for **plan mode**, paste the prompt, review the plan, then approve it.
3. **Review and commit.** After each step, review the diff, run the app, and commit (`git commit -am "FE-3: …"`).
4. **The design is fixed.** `design-reference/snapshots/*.html` is the current approved design. If Claude changes the look, press `Esc` and say *"Stop. The design in design-reference is fixed. Revert the visual changes."*
5. **Dummy data is the default.** The sample data in the design (events, news, campaigns, members, proposals, ledger rows, figures and so on) is the default data everywhere. It is never removed or replaced during frontend work. Later, the backend seeds the same data.
6. **Content and languages.** Every public text, image, button, banner, gallery and video is admin-managed and translatable (`design-reference/CONTENT_AND_I18N.md`). In Part A this runs on the mock data layer.
7. **New packages.** Say yes to a new package only when it is really needed. CLAUDE.md forbids unapproved packages.

---

# PART A: FRONTEND (no backend)

## FE-0: Manual setup (you, not Claude)

```bash
cd ~/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-frontend
unzip -o design-reference.zip && rm design-reference.zip   # current design: snapshots, sources, CSS, images
git checkout -b feat/frontend
npm install
npm run dev                                             # http://localhost:5173  (the backend is NOT needed in Part A)

# In a second terminal, view the design to compare against
python3 -m http.server 4000 -d design-reference         # http://localhost:4000/snapshots/index.html
```

## FE-1 [FE]: Understand everything and plan the frontend (plan only, no code)

```
Read CLAUDE.md, README.md, IMPLEMENTATION_PLAN.md and everything in design-reference/ (README, ROUTES, DESIGN_SYSTEM,
BUSINESS_RULES, CONTENT_AND_I18N). Open the snapshots and the .dc.html sources. Inspect the existing src/ code
(providers, router, guards, stores, components, features, infrastructure) — we reuse it.

This part is FRONTEND ONLY: no backend calls. All data comes from the existing dummy data in the design.

Do NOT write code yet. Produce ARCHITECTURE.md (if it already exists, review and UPDATE it to this frontend-first plan —
keep what is still valid, and keep any work already done that follows the design) with:
1. CSS strategy: load design-reference/assets/css globally (impact100 → icons → ext) and how it coexists with Tailwind
   (recommend preflight off; prove nothing in the starter breaks).
2. Folder plan inside the existing Clean Architecture for layouts, shared design components and feature slices
   (content/cms, i18n, events, news, campaigns, grants, membership/join, donations, volunteer, contact, auth, portal,
   governance, admin).
3. Component inventory: every repeated block in the snapshots → one React component (name, props, source classes).
4. Route table from design-reference/ROUTES.md with layout and guard (public / auth / member / role).
5. DATA LAYER (key decision): repository interfaces per domain (e.g. ContentRepository, EventsRepository,
   MembershipRepository, GovernanceRepository, AdminRepository…) with a MOCK implementation backed by fixtures that
   contain the design's existing dummy data, exposed through React Query hooks. Mock writes (forms, admin edits, votes,
   payments) update an in-memory store persisted to localStorage, with a "reset demo data" action that restores the
   original dummy data. Later Part B adds an HTTP implementation of the SAME interfaces, chosen by
   VITE_DATA_SOURCE=mock|api. Components never know which one is used.
6. Content model for CMS + i18n (per CONTENT_AND_I18N.md): pages → sections → items → fields per locale, media with
   language-specific variants, collections, UiStrings, versions, and how public pages render from it (section registry).
7. i18n: locale state (URL param, cookie, user preference), the existing top-bar language select as switcher,
   fallback to default locale, <html lang dir>, React Query keys include locale.
8. Mock auth: demo users for every role (Visitor, Member, Voting member, Reviewer, Hub co-Ambassador, Editor,
   Finance, Chapter admin, Super admin) using the existing authStore, guards and <Can>.
9. How each .dc.html state / renderVals maps to React state, hooks and URL params.
10. Any package you think is needed and why — do not install anything.
Ask me questions where something is unclear.
```

## FE-2 [FE]: Design system, assets and global styles

```
Implement the design system from ARCHITECTURE.md:
- Copy design-reference/assets/images → src/assets/images and design-reference/assets/css → src/styles/design/
  (unchanged). Load fonts and CSS globally in the documented order; apply the Tailwind preflight decision.
- Build the shared design components from the inventory (SectionHeading, CommonBtn/Button, Card, Badge, Chip,
  ResultBox, FormField, Select, FlowSteps, Timeline, Table, Accordion, BreadcrumbBanner, Slider, Pagination, Tabs,
  Modal/Dialog) rendering EXACTLY the class names and markup of the snapshots.
- Add a dev-only /design route showing every component, like the Main and Components boards.
No pages yet. Run lint, typecheck, build. Screenshot /design and compare with design-reference/snapshots/Components.html
and Main.html; fix differences.
```

## FE-3 [FE]: Dummy-data layer, repositories, i18n and mock auth

```
Implement the data layer from ARCHITECTURE.md:
- Extract ALL existing dummy data from design-reference/snapshots and pages/*.dc.html into typed fixtures — nothing
  invented, nothing dropped: page content for every public page (CMS shape, English), events (8), news (4),
  campaigns (active 2026–27 + history), hubs, committees, leadership, portfolios, volunteer roles, nonprofits steps/FAQs,
  grants map data (all Sub-Saharan countries incl. Sudan and Somaliland, proposals per country/interest), charter
  versions, member Amara Mensah and other members, pledges/installments, proposals, ballots, votes, decisions, results,
  ledger rows, finance flags, reconciliation runs, audit log, email templates, submissions, sign-ups, settings…
- Repository interfaces + mock implementations + React Query hooks, simulated latency, localStorage persistence for
  writes, and a "Reset demo data" action. The fixtures are the default data and must never be deleted.
- i18n: locale provider, UiString helper with fallback, locale-aware content queries (English is complete; other
  enabled locales fall back to English until translated).
- Mock auth with demo users per role and a dev-only role switcher.
Write unit tests for the business-rule helpers you need on the client for display (levels, eligibility display,
quorum/turnout display, installments rounding) based on design-reference/BUSINESS_RULES.md.
```

## FE-4 [FE]: Layouts, navigation and router

```
Implement the four layouts and the router, with content from the data layer (no hard-coded copy):
- PublicLayout: top info bar (contact details + language select as the locale switcher), header with mega menus
  (About two-column with icons, Opportunities, Grants, Events, News), Donate / Become a member / account icon menu,
  breadcrumb banner, footer with newsletter. Navigation comes from the CMS nav fixtures. Only hovered and active items are orange.
  Mobile menu shows every item.
- AuthLayout.
- PortalShell and AdminShell: navy top bar, icon rail (first item "Dashboard"), section sidebar listing only the
  active rail group's pages (no chevrons), breadcrumb + h1.
- Register EVERY route in design-reference/ROUTES.md with the right layout and guard (placeholder pages for now).
Compare header, footer and both shells with the snapshots at 1440 and 390 px; fix every difference.
```

## FE-5 [FE]: Public pages A (content pages)

```
Build these pages pixel-identical to their snapshots, rendered from CMS section components fed by the dummy-data
fixtures (no hard-coded copy), with behaviour from their .dc.html:
index (hero 3 slides, about, purpose, campaign cycle, four ways to belong, WAZI, campaigns, events slider using the SAME
events data as /events, testimonials, leadership…), about_us, committees (?c=), charter (sticky TOC + version select),
our_model, volunteers, testimonial, donot_list, photo_gallery, video_gallery, faq, privacy, newsletter_confirmed,
unsubscribed.
After each page: screenshot vs snapshot at 1440 and 390 px, list differences, fix them.
```

## FE-6 [FE]: Public pages B (interactive pages and forms)

```
Build these pages pixel-identical with full behaviour from their .dc.html, data from the dummy-data repositories:
grants (inline SVG Africa map — every Sub-Saharan country incl. Sudan and Somaliland selectable, map and list in sync,
interest chips, "Projects under review here" filtered by country + interest, "Volunteer roles for you", How grants
are selected, Roadmap), nonprofits (5 steps, eligibility check, 7 FAQs), campaign_list, campaign_details, category,
event + event_details (8 events, RSVP, US hubs launch plan), hubs, blogs + blog_details + share_story, contact
(6 topics, ?topic=), volunteer (filters with counts, tray, validation), join (Level → Details → Payment → Done,
installments), donate (Direct donor, 4 portfolios, Sub-Saharan country), donate_thanks, cancel_gift, contact_thanks,
volunteer_thanks.
Forms: react-hook-form + zod, error texts from UiStrings with the design's exact wording; submissions are saved by the
mock repositories so they appear later in the admin screens. Screenshot vs snapshot and fix.
```

## FE-7 [FE]: Auth screens

```
Build sign_in (email link + WAZI SSO button), check_email, two_step, two_step_enrol, sign_up and forgot_password
pixel-identical to the snapshots, working against mock auth (demo users per role). Members land on /portal, admins on
/admin. The header account menu shows Member login / Become a member / Member portal / Admin console by role.
Guards and <Can> protect portal and admin routes.
```

## FE-8 [FE]: Member portal (all screens)

```
Build every portal screen in ROUTES.md inside PortalShell, pixel-identical to the snapshots, using the dummy data:
portal summary (membership "card", pay-next-installment card with fixed height and overlay result, 4 status cards),
history (memberships + direct donations), vote + proposal + receipt (COI dialog, turnout vs quorum), decisions +
amendment (≥10 chars), results + result, suggest, sign + signed (locked until eligible, typed-name match), reviews +
score, profile, privacy. Actions (pay installment, vote, sign, suggest, score, profile save) update the mock store so
the change shows everywhere, e.g. in admin. Screenshot vs snapshot and fix.
```

## FE-9 [FE]: Admin console part 1 (Overview, People, Charter rules, Payments)

```
Build inside AdminShell, pixel-identical to the snapshots, with the dummy data:
Overview (admin chapter dashboard, admin_finance, admin_hub, admin_exports), People (admin_people, admin_person,
admin_roles, admin_permissions), Charter rules (admin_cycles = Campaigns with fixed $100,000 goal and one active
campaign, admin_settings, admin_approvals, admin_settings_history), Payments (admin_ledger, admin_offline,
admin_flags, admin_reconciliation).
Tables: client-side pagination, filters, sorting, compact pill actions; every action guarded by <Can> and written to the
mock audit log. Screenshot vs snapshot and fix.
```

## FE-10 [FE]: Admin console part 2 (Governance, Engagement, System)

```
Build inside AdminShell, pixel-identical, with the dummy data:
Governance (admin_ballots, admin_proposal_form, admin_decisions, admin_publish, admin_nominations, admin_signatures,
admin_rubric, admin_review_board), Engagement (admin_signups, admin_submissions, admin_routing — showing the items
submitted from the public forms), System (admin_emails, admin_delivery, admin_audit, admin_audit_entry).
Same table and permission rules as FE-9. Screenshot vs snapshot and fix.
```

## FE-11 [FE]: CMS studio and multilingual content (mock-backed)

```
Implement the CMS studio inside the existing admin_cms and admin_preview designs (reuse their components), following
design-reference/CONTENT_AND_I18N.md, on the mock data layer:
- Page → section → item tree in live order for EVERY public page; add / edit / replace / duplicate / hide / delete /
  reorder (drag + keyboard); typed field editors for headings, descriptions, rich text, buttons/links, images, banners,
  galleries and inline videos; media library (upload as object URLs/base64 in mock mode, replace, alt text per locale,
  language-specific variants); collections (events, news, campaigns display, hubs, committees, leadership, FAQs…).
- Side-by-side translation editor with missing/outdated badges and progress; locale settings (enable, default,
  fallback, ltr/rtl); UiString editor.
- Draft / review / publish, schedule, per-locale preview, version history + restore.
- Edits persist in the mock store and the public pages immediately reflect published changes; the language switcher
  changes all content with fallback. The original dummy data stays as the default and "Reset demo data" restores it.
Prove it: change a heading, replace a banner, reorder hero slides, add a gallery video, translate a page, publish —
show screenshots.
```

## FE-12 [FE]: Frontend QA and handoff (end of Part A)

```
Finish the frontend:
1. Visual QA: for every route in design-reference/ROUTES.md screenshot 1440 and 390 px and compare with the snapshot;
   write QA_REPORT.md and fix all differences.
2. Add the "no hard-coded public content" check (CONTENT_AND_I18N.md §5) and make it pass.
3. Accessibility pass (labels, focus states, contrast, aria from the design) and responsive checks (390/768/1024/1440).
4. Loading / empty / error states everywhere (simulate with the mock layer).
5. Lint, typecheck, build, tests all green.
6. Write FRONTEND_HANDOFF.md: every repository interface and method with its TypeScript types, the fixtures that back
   it, which screens use it, and the permissions each action needs. This is the contract the backend will implement.
Confirm every screen in ROUTES.md is complete. Do not touch the backend.
```

> **Gate:** do not start Part B until FE-12 is done and you have checked every screen yourself.

---

# PART B: BACKEND AND INTEGRATION (after the frontend is complete)

## BE-0: Manual setup (you)

```bash
cd ~/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-backend
git checkout -b feat/backend
cp .env.example .env
npm install
docker compose up -d postgres redis kafka zookeeper
npm run db:generate && npm run db:push && npm run seed
npm run dev                                             # gateway on http://localhost:3000
```

## BE-1 [BE]: Backend architecture from the frontend contract (plan only, no code)

```
Read CLAUDE.md, STRUCTURE.md, README.md, docs/BUSINESS_RULES.md, docs/CONTENT_AND_I18N.md, docs/IMPLEMENTATION_PLAN.md,
and from the frontend: ../impact-100-african-diaspora-frontend/FRONTEND_HANDOFF.md, ARCHITECTURE.md, the repository
interfaces and the fixtures (they are the default dummy data and the exact data shapes to serve).

Do NOT write code. Produce docs/ARCHITECTURE.md (it already exists from an earlier plan — UPDATE it so every endpoint
matches FRONTEND_HANDOFF.md exactly; keep what is still valid):
1. Existing services reused (auth, user, permission, notification, gateway) and what changes.
2. New services in the existing anatomy: content-service (multilingual CMS), engagement-service, membership-service,
   governance-service — boundaries, ports, DB names.
3. Prisma data models per service (money in integer cents, multilingual content model per CONTENT_AND_I18N.md).
4. REST endpoints that implement EVERY repository method in FRONTEND_HANDOFF.md, with identical request/response
   shapes inside the { success, message, data } envelope, permissions, pagination and filters.
5. Kafka events, roles/permission matrix mapped to PERMISSIONS, WAZIImpact.org payment adapter + webhook (mock first).
6. Seed plan: the backend seed uses the SAME dummy data as the frontend fixtures.
7. Risks and open questions.
```

## BE-2 [BE]: Auth, users, roles and permissions

```
Implement per docs/ARCHITECTURE.md: passwordless email-link sign-in (keep existing flows), two-step verification (reuse
2FA), WAZI SSO adapter (stub), profile fields (hub, interests: portfolio + country, preferences, consent, preferred
locale), roles and permission matrix seeded through the permission service, demo users for every role matching the
frontend's mock users. Tests, Swagger, Postman. Don't break existing endpoints.
```

## BE-3 [BE]: content-service (multilingual CMS)

```
Create content-service per docs/CONTENT_AND_I18N.md and the ContentRepository contract in FRONTEND_HANDOFF.md:
Locale, Page → Section → SectionItem, FieldValue per locale, language-specific media, collections with per-locale slugs,
navigation, UiStrings, versions; add / edit / replace / reorder / hide / delete; draft → review → published,
scheduled publish, preview tokens, restore; media upload + alt text per locale; locale management; audit events;
permissions (editor, translator, publisher). Public API with locale fallback (resolvedLocale, isFallback), cached by
(key, locale, version). Seed with the frontend's content fixtures (identical dummy data). Tests, Swagger, Postman.
```

## BE-4 [BE]: engagement-service

```
Create engagement-service implementing the contracts for contact (6 topics + routing rules), volunteer roles and
sign-ups, newsletter double opt-in / unsubscribe, event RSVPs, share-a-story, nonprofit interest + eligibility answers,
committee interest. Kafka events for notifications; admin list / filter / export. Seed from the frontend fixtures.
Tests, Swagger, Postman.
```

## BE-5 [BE]: membership-service

```
Create membership-service enforcing docs/BUSINESS_RULES.md and the MembershipRepository contract: campaigns (one
active, $100,000 goal, Oct 1 – Mar 31, auto history), memberships per campaign (buy / renew), pledges and
installments (≤6, rounded up to $5, done by Mar 31), ledger, Apr 1 – Sep 30 credited to next cycle, level and voting
eligibility (≥ $501 received when a vote opens), charter eligibility, overpayment flags, offline payments,
reconciliation, direct-donor donations (portfolio + Sub-Saharan country, monthly + cancel), exports. WAZIImpact.org
adapter + signature-verified idempotent webhook (mock provider). Boundary unit tests. Seed from the fixtures.
Swagger, Postman.
```

## BE-6 [BE]: governance-service

```
Create governance-service per the contract: ballots (eligible voters frozen at open), proposals, votes with COI
confirmation and receipts, turnout vs quorum (50% rounded up, abstentions excluded), outcome rules, decisions and
amendments (≥10 chars, adoption → new charter version via content-service event), results publishing, suggestions /
nominations, charter signing (typed-name match, eligibility from membership-service), rubric (5 criteria, weights),
reviewer assignment, scoring, review board. Audit every admin action. Quorum/outcome unit tests. Seed from fixtures.
Swagger, Postman.
```

## BE-7 [BE]: Notifications, audit, gateway and seed

```
Wire gateway routes and aggregated Swagger, rate limits on public forms, email templates + delivery log through
notification-service (magic link, payment received, installment reminder, eligibility reached, charter ready, ballot
open/closing, results, newsletter confirm, RSVP, contact routing), central audit log, and one seed command that loads
ALL frontend dummy data + demo users per role. Update README. Typecheck and all tests green.
```

## INT-1 [FE]: HTTP data layer behind the same interfaces

```
Add the HTTP implementation of every repository interface (axios instance in src/infrastructure/api, endpoints
registry, envelope unwrapping into domain types, auth token, 401 handling, locale header), selected by
VITE_DATA_SOURCE=mock|api. Keep the mock implementation and all fixtures — mock stays the default until each feature
is verified against the API. No component changes, no visual changes.
```

## INT-2 [FE+BE]: Connect public site, content and forms

```
Switch the public pages, navigation, CMS content and UiStrings, and all public forms (contact, volunteer, newsletter,
RSVP, share story, nonprofit interest, join, donate) to the API. Verify locale switching and fallback against the real
content API. Compare with the mock version: the output must be identical. Fix contract mismatches on the side that
deviates from FRONTEND_HANDOFF.md.
```

## INT-3 [FE+BE]: Connect auth and the member portal

```
Switch auth (email link, 2FA, SSO stub, sign-up, forgot password) and every portal screen to the API: membership card,
installments and payments (mock WAZI provider), history, voting with COI and receipts, decisions, amendments,
results, suggestions, charter signing, reviews and scoring, profile, privacy. Eligibility always comes from the API.
```

## INT-4 [FE+BE]: Connect the admin console and CMS studio

```
Switch every admin screen and the CMS studio (pages, sections, media upload, translations, publish, versions,
preview) to the API, with server-side pagination, filters and sorting. Verify permissions per role with the demo users.
```

## INT-5 [FE+BE]: End-to-end QA

```
Run full end-to-end checks with the seeded data: visitor → join → pay installments → become voting member → sign
charter → vote; admin creates a ballot, publishes results; editor edits and translates a page and publishes; finance
records an offline payment and reconciles. Re-run visual QA against the snapshots. Update QA_REPORT.md and fix issues.
```

## INT-6 [FE+BE]: Production readiness

```
Prepare for production without changing behaviour: security review (helmet/CORS/rate limits, validation, token storage,
CSRF on cookie flows, webhook signatures, secrets only in env, OWASP top 10), performance (route code-splitting, image
sizes, caching, DB indexes, N+1), env configs dev/staging/prod (VITE_DATA_SOURCE=api in staging/prod), Dockerfiles,
docker-compose.prod, CI (lint, typecheck, test, build), structured logging, health checks, error monitoring, migrations
and backups, DEPLOYMENT.md. List anything that needs my decision.
```

---

## Reusable prompts (any time)

**Fix a UI mismatch [FE]**
```
The page <route> does not match design-reference/snapshots/<file>.html. Screenshot both at 1440 and 390 px, list every
difference (spacing, font, colour, copy, image, order), then fix only those — no other changes.
```

**New content from the client [FE]**
```
Here is new content for <page/section>: <paste>. Keep the existing design; change only the content. Update the content
fixtures (and later the CMS seed) — not JSX. Tell me which section you used for what. Don't add sections or UI without
asking; ask before removing any section; use only my content. Keep all other existing dummy data.
```

**Make all public content CMS-managed and multilingual [FE now, BE in Part B]**
```
Review all public pages and make all their content dynamically manageable through the admin dashboard, including
headings, descriptions, images, buttons, banners, galleries, and inline videos. Ensure administrators can add, edit,
replace, reorder, and publish content without modifying the code.
Very important – multilingual support: design the content architecture to support multiple languages from the
beginning; allow administrators to manage translations for every content item; support language-specific text, images,
and videos where necessary; public pages display content according to the selected language; support language
switching and fallback translations; avoid duplicating pages for different languages.
Follow design-reference/CONTENT_AND_I18N.md and the existing architecture, use TypeScript, preserve the current UI/design,
avoid unnecessary refactoring, and keep the existing dummy data as the default content. First inspect the existing
implementation and reuse available components. Do not leave any public-facing content hardcoded if it should be
manageable from the admin dashboard. Finish with a list of every public page and confirmation that each field is
CMS-driven and translatable.
```

**Continue after a break**
```
Read CLAUDE.md, IMPLEMENTATION_PLAN.md and ARCHITECTURE.md, check git log and git status, tell me which step we are on
and what is left, then continue that step.
```

**Review before commit**
```
Review the uncommitted changes as a senior engineer: bugs, rule violations (CLAUDE.md, BUSINESS_RULES.md,
CONTENT_AND_I18N.md), design drift, removed or replaced dummy data, missing loading/error states, missing tests,
security issues. Fix what you find and summarise.
```
