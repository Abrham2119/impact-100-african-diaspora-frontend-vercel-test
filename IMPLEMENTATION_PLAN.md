# Implementation plan: Impact 100 African Diaspora

The prompts for each step are in `PROMPTS.md`. The content and language requirements are in `design-reference/CONTENT_AND_I18N.md`; they apply to every step.

**Order:** finish Part A (the entire frontend on dummy data) before Part B (backend and integration).
**Dummy data:** the design's existing sample data is the default data everywhere. It is never removed or replaced during frontend work, and the backend seeds the same data.

## Part A: Frontend only (no backend calls)

| Step | Phase | Done when |
|---|---|---|
| FE-0 | Setup: unzip the design, branch, install, run dev, serve snapshots on :4000 | The app and the snapshots both open |
| FE-1 | Plan → `ARCHITECTURE.md`: CSS strategy, components, routes, mock data layer, CMS + i18n model, mock auth | Reviewed and approved |
| FE-2 | Design system: global CSS, assets, shared components, `/design` route | Matches the Components and Main snapshots |
| FE-3 | Dummy-data fixtures (all design sample data), repositories, React Query hooks, i18n, mock auth | Every dataset is in a fixture; reset demo data works |
| FE-4 | Layouts and router: Public, Auth, PortalShell, AdminShell; every route registered | Header, footer and shells match the snapshots |
| FE-5 | Public pages A (content pages) from CMS sections | Visual match at 1440 and 390 px |
| FE-6 | Public pages B (map, events, news, campaigns, forms, join, donate) | Visual match plus behaviour; forms save to the mock store |
| FE-7 | Auth screens on mock auth | Role-based redirects and guards work |
| FE-8 | Member portal, all screens | Visual match; actions update the mock store |
| FE-9 | Admin part 1: Overview, People, Charter rules, Payments | Visual match; permissions and audit log |
| FE-10 | Admin part 2: Governance, Engagement, System | Visual match; shows data from the public forms |
| FE-11 | CMS studio plus multilingual content (mock-backed) | Edit, reorder, replace media, translate, publish; public pages update |
| FE-12 | QA, no-hard-coded-content check, accessibility → `QA_REPORT.md`, `FRONTEND_HANDOFF.md` | All green; the contract is documented |

**Gate:** Part B starts only after FE-12 is complete and you have checked every screen yourself.

## Part B: Backend and integration

| Step | Repo | Phase | Done when |
|---|---|---|---|
| BE-0 | BE | Setup: env, docker, dev servers | Gateway runs |
| BE-1 | BE | Plan → `docs/ARCHITECTURE.md` from `FRONTEND_HANDOFF.md` | Every repository method has an endpoint |
| BE-2 | BE | Auth, roles, permissions, demo users | Tests pass |
| BE-3 | BE | content-service: multilingual CMS, seeded from the frontend fixtures | Fallback and publish tests pass |
| BE-4 | BE | engagement-service | Tests pass |
| BE-5 | BE | membership-service (campaigns, installments, ledger, donations, WAZI adapter) | Business-rule tests pass |
| BE-6 | BE | governance-service (ballots, quorum, decisions, signing, reviews) | Quorum and outcome tests pass |
| BE-7 | BE | Notifications, audit log, gateway, full seed | Full stack runs from seed |
| INT-1 | FE | HTTP repositories behind the same interfaces (`VITE_DATA_SOURCE=mock|api`) | No visual change |
| INT-2 | both | Public site, CMS and forms on the API | Identical to mock mode |
| INT-3 | both | Auth and member portal on the API | Eligibility comes from the API |
| INT-4 | both | Admin console and CMS studio on the API | Permissions verified per role |
| INT-5 | both | End-to-end QA | `QA_REPORT.md` is clean |
| INT-6 | both | Production readiness → `DEPLOYMENT.md` | CI is green; staging is deployed |
