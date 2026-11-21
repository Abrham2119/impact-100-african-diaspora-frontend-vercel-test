# Implementation plan: Impact 100 African Diaspora

The prompts for each step are in `PROMPTS.md`. The content and language requirements are in `CONTENT_AND_I18N.md`; they apply to every step. Work in order. Commit after every step. Tick a step off when it is done.

| Step | Repo | Phase | Done when |
|---|---|---|---|
| 0 | both | Manual setup (branches, env, docker, dev servers) | Both dev servers run; snapshots open at :4000 |
| 1 | BE | Architecture: services, data model, API contract → `docs/ARCHITECTURE.md` | Reviewed and approved |
| 2 | FE | Frontend architecture: CSS strategy, components, routes → `ARCHITECTURE.md` | Reviewed and approved |
| 3 | FE | Design system: global CSS, assets, shared components, `/design` route | `/design` matches the Components and Main snapshots |
| 4 | FE | Layouts and router: Public, Auth, PortalShell, AdminShell; every route stubbed | Header, footer and shells match the snapshots |
| 5 | FE | Public pages A built from CMS section components (fixtures shaped like the content API) | Visual match at 1440 and 390 px; no hard-coded copy |
| 6 | FE | Public pages B (interactive: map, forms, join, donate, events, news) | Visual match plus behaviour from `.dc.html` |
| 7 | BE | Auth: email link, 2FA, SSO adapter, profile fields, roles and permissions | Tests pass; Swagger and Postman updated |
| 8 | BE | content-service: multilingual CMS (pages, sections, translations, language-specific media, versions) seeded with all design content | Pages render from the API in English; translation and fallback tests pass |
| 9 | BE | engagement-service (contact, volunteer, newsletter, RSVP, stories) | Tests pass |
| 10 | BE | membership-service (campaigns, pledges, installments, ledger, donations, WAZI adapter) | Every business-rule test passes |
| 11 | BE | governance-service (ballots, votes, quorum, decisions, amendments, results, signing, reviews) | Quorum and outcome tests pass |
| 12 | BE | Notifications, audit log, gateway wiring, seed data for every role | Full stack runs from seed |
| 13 | FE | Public site on the multilingual content API; language switcher; forms submit | No visual change; switching language works with fallback; no-hard-coded-content check passes |
| 14 | FE | Auth flows wired | Members land in the portal, admins in the admin console |
| 15 | FE | Member portal screens wired | Matches the snapshots; uses eligibility from the API |
| 16 | FE | Admin console and CMS studio (edit, reorder, media, translations, publish, versions) | An admin can change, translate and publish any public content without a deploy |
| 17 | both | Tests, visual QA, accessibility → `QA_REPORT.md` | All differences fixed |
| 18 | both | Production readiness → `DEPLOYMENT.md` | CI is green; staging is deployed |
