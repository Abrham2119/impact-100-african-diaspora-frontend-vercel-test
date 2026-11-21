# Project Directory Locations

- Backend: `/home/victos/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-backend`
- Frontend: `/home/victos/Desktop/Navigate/impact-100-african-diaspora/impact-100-african-diaspora-frontend`

# Project: Impact 100 African Diaspora Chapter (web app)

Public website + member portal + admin console (with CMS) for the Impact 100 African Diaspora Chapter, hosted by USAFI Impact.

Read these first, every session:
- `design-reference/README.md` — what the design files are, layouts, how `.dc.html` maps to React, fixed decisions.
- `design-reference/ROUTES.md` — every screen → route → layout → module.
- `design-reference/DESIGN_SYSTEM.md` — CSS load order, tokens, component classes.
- `design-reference/BUSINESS_RULES.md` — membership, donations, campaigns, voting, charter rules.
- `design-reference/CONTENT_AND_I18N.md` — CMS + multilingual content architecture (applies to every public page).
- `IMPLEMENTATION_PLAN.md` — the phase you are working on.
- `ARCHITECTURE.md` (created in Phase 1) — agreed structure, data model and API contracts.

## The design is fixed
- `design-reference/snapshots/*.html` is the visual target; `design-reference/pages/*.dc.html` is the behaviour target.
- Never redesign, restyle, re-word copy or swap images. Port `design-reference/assets/css/*` unchanged and globally
  (impact100.css → icons.css → impact100-ext.css). Reuse the exact class names in JSX.
- Images come only from `src/assets/images` (copied from `design-reference/assets/images`) or the CMS.
- Shared parts are ONE component each, fed by typed config: PublicHeader (+ mega menus), Footer, PortalShell, AdminShell
  (top bar, icon rail, section sidebar, breadcrumb, title).
- Pages that share a layout are one component fed by data (e.g. EventDetailsPage by id, BlogDetailsPage by slug,
  CampaignDetailsPage by slug). Never copy-paste a page per item.
- Content marked sample in the README comes from the API/CMS — never hard-code or invent it.
- If a design detail is unclear, ask — don't invent.

## Content & languages (very important)
- Every public-facing heading, description, image, button, banner, gallery and inline video is CMS-managed and
  translatable — follow `design-reference/CONTENT_AND_I18N.md`. Do not leave public content hard-coded.
- One page/section tree for all languages (translations per field, language-specific media optional, fallback to the
  default locale). Never duplicate pages or components per language.
- Admins must be able to add, edit, replace, reorder, translate and publish without code changes.

## Engineering rules
- Use the existing stack and Clean Architecture/feature-sliced structure (see README.md). Check package.json before adding a
  dependency, explain why, and wait for approval.
- TypeScript strict, typed API client, no `any`. UI never calls axios directly — go through `src/infrastructure/api` +
  feature `api/` + React Query hooks.
- Every page: loading, empty and error states in the existing visual style.
- Accessible: semantic HTML, labels, focus states, alt text. Responsive at 390 / 768 / 1024 / 1440.

## Workflow
- Plan before coding (use plan mode), one phase/feature at a time, small commits.
- Run `npm run lint`, `npm run typecheck` and `npm run build` before saying done.
- After UI work, screenshot the page and compare with `design-reference/snapshots/<page>.html` at 1440 and 390 px; list any differences and fix them.

# Engineering Guidelines

Act as a Senior Software Engineer. Do NOT break the existing project structure under any circumstances.

## Architecture & Structure
- Keep the current project architecture unchanged; extend the existing structure instead of replacing it.
- Do not refactor unrelated code. Do not remove existing features or business logic.
- Maintain clear separation of concerns (UI, business logic, services, hooks, utilities, API).

## Reusability
- ALWAYS reuse existing components, hooks, utilities, services, and helpers before creating new ones.
- Extend similar existing functionality instead of duplicating code. Keep code modular and maintainable.

## Styling & Design System
- IMPORTANT: Never hardcode colors, spacing, font sizes, or design tokens in components.
- Always import them from the project's global CSS, theme, or design token files.
- No inline styles unless absolutely necessary.
- Preserve the existing design system: font family, primary/secondary theme colors, typography, spacing, border radius, shadows, and component styling patterns.
- Keep responsive behavior consistent with the existing implementation.

## Code Standards
- Maintain TypeScript type safety and interface consistency.
- Respect existing naming conventions, coding style, and folder organization.
- Single responsibility per function/component. Avoid unnecessary complexity.

## Dependencies
- Do NOT introduce new libraries or packages without explicit permission.
- Prefer existing project dependencies and utilities.

## Performance
- Avoid unnecessary re-renders. Reuse memoized logic. No performance regressions.

## Backward Compatibility
- Ensure existing functionality keeps working. Preserve API contracts and component interfaces unless explicitly asked to change them.

## Priorities
Reusability, scalability, maintainability, consistency, readability, performance, backward compatibility. Always understand the existing implementation and integrate with it rather than building parallel solutions.
