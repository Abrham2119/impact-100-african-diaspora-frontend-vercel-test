# Frontend architecture: Impact 100 African Diaspora Chapter

> **Status:** Draft for review. This is implementation-plan Step 2, written 21 Nov 2026. Nothing here is built yet.
> **Scope:** CSS strategy, folder plan, component inventory, routes, behaviour mapping, API client, CMS rendering,
> i18n and packages for the React app. It **extends** the existing starter (React 19, Vite 6, TypeScript strict,
> Tailwind 3, React Router 7, Axios, TanStack Query 5, Zustand, React Hook Form and Zod), which uses Clean
> Architecture and feature-sliced design. The backend contract is
> `../impact-100-african-diaspora-backend/docs/ARCHITECTURE.md` (referred to as **BE §n** below).

---

## 0. Context and decisions

### 0.1 Sources read

- `CLAUDE.md`, `README.md`, `IMPLEMENTATION_PLAN.md`, `package.json`, the Vite, Tailwind and TS configs, and every
  file under `src/` (about 5,500 lines).
- `design-reference/README.md`, `ROUTES.md`, `DESIGN_SYSTEM.md`, `BUSINESS_RULES.md` and `CONTENT_AND_I18N.md`.
- `design-reference.zip`, which holds `pages/*.dc.html` (91), `snapshots/*.html` (91), `assets/css/*` (3) and
  `assets/images/*` (119). I extracted it **outside the repo** for analysis.
  > **Step 0 gap:** the repo's `design-reference/` folder contains only the 5 `.md` files. Unzip
  > `design-reference.zip` into it before Step 3, because `/design`, the screenshot comparisons and the asset copy
  > all depend on `pages/`, `snapshots/` and `assets/`.
- The backend `docs/ARCHITECTURE.md` (decisions D1 to D4, the API contract and the content model).

### 0.2 Decisions confirmed by the product owner (21 Nov 2026)

| # | Topic | Decision |
|---|---|---|
| F1 | Starter screens | **Keep them, scoped.** `/app/*` (dashboard, users, roles, settings, notifications) and the legacy password pages keep working and stay unlinked from the design UI. Tailwind is scoped to a `.tw-root` wrapper (§1). They can be retired later. |
| F2 | Locale in the URL | **A prefix for non-default locales on public routes only.** English is `/about` and Amharic is `/am/about`. `?lang=xx` redirects to the prefixed URL. Auth, portal and admin have no prefix and follow the saved preference. |
| F3 | Currency select | **Hidden.** The top bar renders the language select only. This is the one intentional difference from the snapshot, and the designer is told about it. |
| F4 | Fonts | **Self-hosted.** The woff2 files go in `src/assets/fonts/` with `@font-face`. The families, axes and weights are the same as the design's Google Fonts link, and there is no third-party request. No npm package is needed. |
| (BE D1) | Sign-in | Email login link plus WAZI SSO. TOTP 2FA for Chapter admin, USAFI finance and Content Editor. |
| (BE D2) | Roles | 6 assignable roles. "Voting member" is computed from the ledger. Co-Ambassador and Committee member roles are scoped. |
| (BE D3) | Copy tokens | `{{charter.*}}` tokens are resolved **server-side**. The frontend renders the text it receives. |

### 0.3 Facts found that shape this plan

1. `impact100.css` **bundles Bootstrap 5.3.2**. Its utilities use `!important`, and many have the same names as
   Tailwind utilities but different values (§1.2).
2. **The auth screens render inside the public chrome** (top bar, header, breadcrumb and footer). They do not use a
   separate shell. "AuthLayout" is therefore the public chrome plus the `sign_up` card, with a public-only guard.
3. The same template blocks (`about_us`, `services`, `counter_section`, `become_volunteer`, `volunteer`, `faq`)
   appear on **both Home and About** with different copy. That supports the model of one section type per block,
   fed by CMS data.
4. Every page carries the same boilerplate state (`fix`, `prog`, `progOn`, `menu`, `langOpen`, `curOpen`, `lang`,
   `cur`). It becomes chrome hooks (§5.1) and is never repeated per page.
5. `npm run lint` is **broken today**: the script calls `eslint`, but ESLint is not a dependency and has no config.
   CLAUDE.md requires lint before "done" (§9).
6. `node_modules` is not installed in this checkout. Nothing in this document was run; the CSS evidence in §1 is
   static analysis of the actual files.

---

## 1. Design CSS loading and coexistence with Tailwind

### 1.1 Global load order

The three design stylesheets are copied **byte-for-byte** from `design-reference/assets/css/` into
`src/assets/css/`. The images go into `src/assets/images/`. Keeping that sibling layout means the CSS's own
`url(../images/…)` references resolve unchanged, and Vite fingerprints them. Nothing in these files is ever edited.

`src/main.tsx` imports, in this exact order (Vite preserves CSS import order):

```ts
import '@/styles/fonts.css';              // 1. self-hosted @font-face: Nunito, Nunito Sans, Caveat (F4)
import '@/assets/css/impact100.css';      // 2. template theme + Bootstrap 5.3.2 grid/utilities
import '@/assets/css/icons.css';          // 3. icon font (embedded, 2.7 MB)
import '@/assets/css/impact100-ext.css';  // 4. ix_* extension layer
import '@/styles/app.css';                // 5. design rules declared outside its stylesheets (see below)
import '@/styles/tw-scope.css';           // 6. starter scope: neutralise design CSS + scoped preflight
import '@/index.css';                     // 7. Tailwind (starter screens only)
import '@/styles/tw-compat.css';          // 8. starter scope: Bootstrap / !important compat
```

`tw-scope.css` must load **before** `index.css`, so the starter's own component classes still override the scoped
preflight, which is Tailwind's normal order. (Step 3 swapped 6 and 7 from the first draft of this document.)

- `app.css` holds only design rules that live outside the three stylesheets, copied verbatim:
  - the pages' `<helmet>` rules: `.bg_breadcrumb` and `.bg_footer` (default images), plus `.dc_track { display: flex }`
    and `.dc_track::before/::after { display: none }`, which the slider needs;
  - what the template's barfiller plugin set inline: `.barfiller .tipWrap { display: inline }` and the 1 s
    transitions.

  The block-specific helmet rules (`bg_banner_*`, `bg_counter` and the other `bg_*`, `dc_marquee`, `.banner`
  height, `.sticky_sidebar`, `.ix_hp_row`) are ported with their blocks in Steps 5–6, inside their original
  `@media` wrappers. The list is in `app.css`. `.sc-interp`, `.ph`, `.dc_map`, `.dc_video` and `.cmp_*` are
  design-tool artefacts.
- A CMS-provided breadcrumb image is applied as an inline `style={{ backgroundImage }}`. Computed geometry (slider
  offsets and widths, progress `width` and `left`) is inline too. Those are the only justified inline styles,
  because the values are data.
- The cream page background (`#FAF7F1`) comes from the theme. **No app wrapper may paint over it.** Today
  `RootLayout` has `bg-background`, and that class moves to the starter wrapper (§1.3).

### 1.2 Evidence: what collides

I compared the actual starter source with the actual design CSS and snapshots:

| Check | Result |
|---|---|
| Classes defined by the design CSS | 6,879 |
| Distinct classes used in the snapshots | 509 |
| Distinct class-like tokens in the starter `src/` | about 700 |
| **[A] Starter Tailwind tokens that are also design-CSS classes** | **54 real hits**, plus 6 false positives (`description`, `icon`, `in`, `list`, `toast`, `type`, which are plain words in strings). The real hits are all Bootstrap utilities with **`!important`**: `p-2…p-5`, `px-*`, `py-*`, `pt-0`, `pt-5`, `pb-1`, `mt-1/2/4/5`, `mb-3/4`, `mx-auto`, `gap-1…4`, `border`, `border-0/2`, `border-primary/white`, `rounded`, `shadow-sm/lg`, `bg-primary/secondary/white`, `text-primary/white/center`, `opacity-50`, `overflow-hidden/x-auto/y-auto`, `flex-row/wrap`, `align-middle`. Example: Bootstrap `.p-4 { padding: 1.5rem !important }` against Tailwind's `1rem`, and Bootstrap `.bg-primary` (Bootstrap blue, `!important`) against the starter's green. |
| **[B] Design classes that Tailwind would generate if it saw them** | `container` (Tailwind's widths of 640/768/1024/1280/1536 would overwrite Bootstrap's 540/720/960/1140/1320) and `collapse` (Tailwind's `visibility: collapse` would **hide the mobile navbar** `.collapse.show`) |
| **[C] Template element rules that hit everything** | `* { margin:0; padding:0 }`, `header { position: fixed; background:#0000003b; z-index:999 }` (this would pin the starter's `<header>`), `footer::before { content:""; background:url(…) }`, `input, textarea { width:100%; padding:12px 20px; border-radius:30px; border:1px solid #e4e7e9 }`, `button { border:none }`, `a { display:inline-block }`, `h1–h6 { font-family: Nunito; color: navy }`, `body { font-family: Nunito Sans; color }`, plus Bootstrap reboot (`ul { padding-left:2rem }`, heading sizes, `label`, `img { vertical-align }` …) |
| CSS custom-property clashes | **None.** The design uses `--colorPrimary`, `--ixLine` and `--bs-*`. The starter uses `--primary`, `--border`, `--radius` and similar. |
| Portals | The starter `Modal` renders inline (`fixed inset-0`) and does not use `createPortal`, so it stays inside the scope. `sonner` (Toaster) mounts at the root and styles itself with `[data-sonner-*]` attribute selectors, which outrank the template's element rules. |

**Conclusion:** turning preflight off is necessary but **not sufficient**. Without the measures below, loading the
design CSS globally would (a) re-pad and recolour about 54 starter utilities through Bootstrap's `!important`
rules, (b) pin the starter header, and (c) let Tailwind break the design's `container` and the mobile menu's `collapse`.

### 1.3 The coexistence strategy (implemented in Step 3)

| # | Measure | Effect |
|---|---|---|
| 1 | `tailwind.config.ts`: **`corePlugins: { preflight: false }`** | The Tailwind reset never touches design pages. |
| 2 | **`important: true`** | Every Tailwind utility is `!important` and loads after the design CSS, so it beats Bootstrap's same-named `!important` utilities ([A]). The first draft used `important: '.tw-root'` (selector scoping). That cannot win against Bootstrap shorthands such as `.border`, which forces width, style **and** colour, or against `hover:`/`dark:` variants, so it was replaced. |
| 3 | **`blocklist: ['container', 'collapse']`** | Tailwind never emits the two design classes in [B]. |
| 4 | `content`: `./src/**/*.{ts,tsx}` minus `!./src/components/design/**` and `!./src/pages/design/**` | Design code never feeds Tailwind. Because utilities are global (point 2), **no class Tailwind emits may appear in design markup**. Point 9 enforces that. |
| 5 | `src/components/TwScope.tsx` (`<div class="tw-root">`) wraps the starter route subtrees: `/app/*`, the starter `/auth/*` and `/` (until Step 4), and the 404. It wraps the route elements, so the guards' spinners are inside the scope too. | Defines where the starter world lives. |
| 6 | `index.css`: the starter's base rules move from `body` and `*` to `.tw-root` and `.tw-root *`, as plain CSS rather than `@apply` (`min-height: 100vh`, background, colour, font, `border-color`). `RootLayout` paints nothing. **Every `@apply` in the starter's `@layer components` ends in `!important`.** | The design's cream background shows outside the scope. Making the component classes important keeps the original cascade between components and the now-important utilities. For example, `.dark .dash-state-btn-active` (white) still beats `text-emerald-600`. |
| 7 | `src/styles/tw-scope.css`: `.tw-root *:where(:not(svg, svg *))` (and its `::before`/`::after`) `{ all: revert }`, then **Tailwind 3.4 preflight scoped** as `.tw-root :where(…)` | Every element rule from the template and Bootstrap reboot is undone inside the scope (`header{position:fixed}`, `input{border-radius:30px}`, `a{display:inline-block}`, `footer::before`, heading fonts …). SVG subtrees are skipped so lucide's `fill="none"` attributes survive. Specificity stays at (0,1,0), so the starter's component classes, loaded later, still win. |
| 8 | `src/styles/tw-compat.css`: `.tw-root { --bs-border-* }` points Bootstrap's `.border` shorthand at the starter's defaults. `:where(.tw-root) img` and `footer` restore the defaults that the theme forces with element-level `!important` (`img { width/height:100%; object-fit:cover }`, `footer { background-* }`), the only two such rules in the design CSS. | The remaining collisions that `important: true` cannot resolve alone |
| 9 | `npm run check:css` (`src/scripts/check-css-collisions.ts`, run directly by Node 26; no dependency). It asserts points 1–4, asks Tailwind with the real config which classes it emits (266 today), and fails if any is used by the snapshots or by design source (554 classes). The allowlist holds only identical-semantics classes (`flex-wrap`). | A negative test (a design file using `p-4`) fails as expected. Run it in CI. |

### 1.4 Verification (Step 3 results)

- **Starter, pixel diff.** 14 screens (`/app/{dashboard,users,roles,settings,profile,notifications}`, `/`, the starter
  `/auth/*` pages, 404) × light/dark × 1440/390 px = **56 screenshots, all pixel-identical** to a baseline built from
  the unchanged `HEAD`. Two regressions were found and fixed on the way: the template's `img { … !important }`
  (dashboard avatars) and component-versus-utility precedence under `important: true` (the dark-mode pill).
  Not covered by screenshots: hover and focus states, open modals and toasts. Check them by hand, or with the
  Playwright suite in §9 once it is approved.
- **Design boards.** `/design/main` against `snapshots/Main.html` at 1440 px: same height, 353 px differ (0.006 %,
  sub-pixel anti-aliasing on one line). `/design/components` against `snapshots/Components.html`: the intro and
  sections 2–4 are **0 px different** at 1440 and at 390. Sections 1 and 5 (header and footer) are Step 4
  placeholders.
- **How to compare at 390 px.** None of the 91 snapshots has a `<meta name="viewport">`, so mobile emulation shows
  them as scaled desktop pages. Compare at a **390 px window width without mobile scaling**, so the design's media
  queries apply to both.
- **Known board-only difference.** The Main board snapshot does not load `impact100-ext.css`, but every page and the
  app do. At ≤ 575 px the ext layer's `.section_heading h2 { font-size: 32px }` therefore applies in React (26 px on
  that one board). This is correct for real pages.

---

## 2. Folder plan (inside the existing Clean Architecture)

The four layers and their direction stay the same: Presentation → Application → Infrastructure → Domain. New
code goes into the existing folders. **New** folders are marked ★. Starter files are not modified except where §1.3
says so, plus the extensions listed in §6.

```
src/
├─ main.tsx                       CSS imports in the §1.1 order
├─ app/                           composition root
│  ├─ App.tsx
│  ├─ routes/
│  │  ├─ index.tsx                createBrowserRouter: Root → [public (+ /:lang prefix), auth, portal, admin, starter /app, legacy auth, 404]
│  │  ├─ paths.ts                 PATHS extended: public, auth, portal, admin builders (PATHS.public.newsDetail(slug))
│  │  ├─ public.routes.tsx        one children array, mounted at "/" and at "/:lang" (F2)
│  │  ├─ auth.routes.tsx          design auth screens (+ /auth/legacy/* starter pages)
│  │  ├─ portal.routes.tsx ★
│  │  ├─ admin.routes.tsx ★
│  │  └─ private.routes.tsx       starter /app/* (unchanged, now wrapped in TwScope via PrivateLayout)
│  ├─ layouts/
│  │  ├─ RootLayout.tsx           (changed) no Tailwind paint; mounts LocaleSync, SeoHead defaults, Toaster
│  │  ├─ PublicLayout.tsx         (rewritten to the design) PublicHeader + <Outlet/> + Footer + ScrollProgressButton
│  │  ├─ AuthLayout.tsx           (rewritten to the design) = PublicLayout (chrome + banner); the sign_up card is page content
│  │  ├─ PortalShell.tsx ★        <AppShell menu={portalMenu}/>
│  │  ├─ AdminShell.tsx ★         <AppShell menu={adminMenu}/>
│  │  ├─ PrivateLayout.tsx        starter, wrapped in <TwScope>
│  │  └─ StarterAuthLayout.tsx ★  the current AuthLayout, moved unchanged, wrapped in <TwScope>
│  └─ guards/
│     ├─ ProtectedRoute.tsx       (extended) redirects to PATHS.auth.signIn with ?next=
│     ├─ PublicOnlyRoute.tsx      (extended) role-based landing: admin roles → /admin, everyone else → /portal
│     ├─ PermissionRoute.tsx      (extended) optional `scope`, `fallback` (defaults to the user's landing, not /app)
│     ├─ TwoFactorRoute.tsx ★     admin routes: requires session.mfa, otherwise → /auth/two-step (or /setup)
│     └─ LocaleGate.tsx ★         validates :lang ∈ enabled non-default locales, otherwise the 404 page
├─ assets/ ★
│  ├─ css/                        impact100.css, icons.css, impact100-ext.css (byte-for-byte copies)
│  ├─ images/                     the 119 design images (byte-for-byte copies)
│  └─ fonts/                      self-hosted woff2 files (F4)
├─ styles/ ★                      fonts.css · app.css · tw-scope.css · tw-compat.css
├─ index.css                      Tailwind layers (scoped) + starter tokens (§1.3 #6)
├─ components/
│  ├─ ui/ · feedback/ · NotFound · PageHeader · ThemeToggle      starter (Tailwind), used only inside .tw-root
│  ├─ TwScope.tsx ★
│  └─ design/ ★                   THE shared design system: exact design class strings, no Tailwind, no data fetching
│     ├─ primitives/              Button, SectionHeading, Card, Badge, Chip, OptionCard, ResultBox, Field, Table …
│     ├─ chrome/                  PublicHeader, MegaMenu, LanguageSelect, Footer, BreadcrumbBanner, ScrollProgressButton
│     ├─ shell/                   AppShell, TopBar, IconRail, SectionSidebar, Crumbs, DashboardPanel, Toolbar
│     ├─ blocks/                  template blocks used by CMS sections (HeroSlider, EventCard, CampaignCard …)
│     ├─ states/                  LoadingState, EmptyState, ErrorState, QueryState (design-styled)
│     └─ index.ts                 public barrel
├─ config/ ★
│  └─ navigation/                 portalMenu.ts, adminMenu.ts (typed ShellMenu config: keys, icons, routes, permissions)
├─ domain/
│  ├─ entities/                   + content, locale, campaign, membership, payment, donation, engagement, governance, money
│  └─ enums/                      permission.enum (extended to the BE §6.2 list), role.enum (+ ChapterRole), level.enum ★
├─ infrastructure/
│  ├─ api/                        api.ts (extended §6.2) · config.ts · endpoints.ts (extended §6.1) · errors.ts ★
│  └─ storage/                    auth.storage.ts · locale.storage.ts ★ (the i18n_locale cookie)
├─ i18n/ ★                        LocaleProvider, useLocale, useT, localePath, resolveLocaleChain, format (Intl money/date)
├─ store/                         authStore (extended: roles, scoped permissions, mfa, landing)
├─ hooks/                         useAuthLogout + ★ useSearchParamState, useLegacyHashParams, useSticky, useScrollProgress,
│                                 useSlider, useInView, useCountUp, useFocusTrap
├─ lib/                           utils (cn …) + ★ classes.ts (exact design class builders, e.g. chipClass(on))
├─ features/                      one slice per domain; anatomy = create-feature (api/ hooks/ lib/ schemas/ components/ types/)
│  ├─ auth · users · roles · permissions · notifications · dashboard   (starter, extended where noted)
│  ├─ content ★     public CMS reader: services, hooks (useCmsPage/useCollection/useNav/useUiStrings), sectionRegistry,
│  │                CmsPage, RichText, CmsImage, fixtures/, schemas/content-schemas.json + generated types
│  ├─ events ★      events list/detail data, RSVP, availability, hubs (join a hub)
│  ├─ news ★        news list/detail, share-a-story form
│  ├─ grants ★      AfricaMap, HubPanel, public proposals, interest saving
│  ├─ membership ★  campaigns (public), join wizard, settings/public, me/membership, installments, contributions, renew
│  ├─ donations ★   donate form, cancel monthly gift, donation status
│  ├─ volunteer ★   roles browser (filters + tray), sign-up form, committee interest
│  ├─ contact ★     contact form, newsletter subscribe/unsubscribe, nonprofit eligibility check
│  ├─ portal ★      portal dashboard composition, profile & preferences, privacy & data, portal shell data (pill, bell)
│  ├─ governance ★  member side: ballots, proposal, vote + COI, receipt, decisions, amendments, comments, results,
│  │                nominations, charter signing, reviews/scoring
│  ├─ admin ★       admin console screens grouped by rail: overview/ people/ rules/ payments/ governance/ engagement/ system/
│  │                (UI only; it calls the hooks of the domain slices above, e.g. membership/hooks/useAdminPayments)
│  └─ cms ★         CMS studio: tree editor, field editors generated from the section schemas, translations side by side,
│                   media library, versions/diff/restore, preview links, locales, UI strings, nav editor
├─ pages/                         thin route screens (compose layout pieces + feature components; no logic)
│  ├─ public/ ★ (HomePage → <CmsPage pageKey="home"/> …) · auth/ (design) + auth/legacy/ (starter, moved unchanged)
│  ├─ portal/ ★ · admin/ ★ · private/ (starter) · design/ ★ (DesignPage for the /design route, Step 3)
├─ providers/                     AppProviders (+ LocaleProvider) · QueryProvider · ThemeProvider (starter only)
├─ scripts/                       create-feature.ts + ★ check-css-collisions.ts, check-hardcoded-copy.ts, gen-content-types.ts
└─ types/                         api.ts (ApiEnvelope, PaginatedData) + ★ LocalizedValue, Money, ApiErrorBody
```

**Rules:**

- `components/design` never fetches data and never imports features. It takes typed props and renders the exact
  design markup.
- `features/*/components` combine design components with hooks.
- `pages/*` only compose.
- Only `features/*/api` touches `apiClient`, which matches the existing CLAUDE.md rule.

---

## 3. Component inventory

Each repeated block in the snapshots becomes **one** component. "Pages" counts the snapshots (out of 88 routes)
that contain the block. Class strings are kept **exactly**. State modifiers (`ix_on`, `ix_active`, `show`,
`collapsed`, `menu_fix`, `active-progress`, `ix_done`, `ix_now`, `ix_disabled`, `ix_input_bad`) are computed by
`lib/classes.ts`.

### 3.1 Chrome and shells

| Component | Main props | Source classes | Pages |
|---|---|---|---|
| `PublicHeader` | `nav: NavTree` (from the CMS), `topbar: GlobalTopbar`, `locales`, `locale`, `onLocaleChange`, `session` | `header_info`, `header_right`, `language_currency`, `navbar navbar-expand-lg main_menu (menu_fix)`, `navbar-brand`, `navbar-toggler`, `collapse navbar-collapse (show)`, `navbar-nav nav-item nav-link sub_menu`, `menu_right user_icon user_link ix_hide_md` | 39 public + auth |
| ↳ `MegaMenu` | `columns: NavItem[][]`, `variant: 'single' \| 'two'` | `ix_mega`, `ix_mega_2`, `ix_mega_col`, `ix_mi`, `ix_count` (counts from `count_from`) | 39 |
| ↳ `LanguageSelect` | `options: Locale[]`, `value`, `onChange` | `nice-select select_js (open)`, `list`, `option (selected)` (the currency select is not rendered, F3) | 39 |
| `Footer` | `content: GlobalFooter`, `menus`, `newsletterSlot` | `bg_footer footer_overlay pt_80`, `footer_top footer_logo footer_link footer_contact footer_newsletter ix_nl_btn`, `footer_botton footer_botton_text` | 39 |
| `BreadcrumbBanner` | `title`, `trail: Crumb[]`, `backgroundUrl?` | `breadcrumb bg_breadcrumb breadcrumb_overlay breadcrumb_text` | 38 |
| `ScrollProgressButton` | n/a | `progress-wrap (active-progress)`, `progress-circle svg-content` | 88 |
| `AppShell` | `menu: ShellMenu`, `activeKey`, `user`, `pill?`, `crumbs`, `title`, `unread` | `ix_top ix_top_logo ix_top_pill ix_top_right ix_top_btn ix_top_icon ix_top_avatar`, `ix_app`, `ix_rail ix_rail_item (ix_on)`, `ix_side ix_side_user ix_side_title ix_side_item (ix_on)`, `ix_app_main ix_crumbs ix_sep ix_app_title` | 49 (16 portal, 33 admin) |
| `DashboardPanel` | `title`, `description`, `toolbar?`, `children` | `dashboard_contant`, `dashboard_contant_top`, `dashboard_heading`, `ix_dash_body` | 48 |
| `Toolbar` | `search?`, `filters?: SelectFilter[]`, `actions?` | `ix_toolbar`, `ix_sr` (visually hidden labels), `ix_select` | 18 |
| `AuthCard` | `image`, `children` | `sign_up sign_up_img sign_up_contant login_form sign_up_others_option` | 6 auth |

### 3.2 Primitives

| Component | Main props | Source classes |
|---|---|---|
| `Button` | `variant: 'default' \| 'dark' \| 'ghost' \| 'accent'`, `size: 'md' \| 'sm'`, `to?` (renders a `Link`), `icon?`, `disabled` | `common_btn`, `ix_btn_dark`, `ix_btn_ghost`, `ix_btn_acc`, `ix_btn_sm`, `ix_disabled` |
| `ButtonRow` | n/a | `ix_btn_row` |
| `SectionHeading` | `kicker`, `title`, `lead?`, `as?` | `section_heading` (`h5` kicker + `h2`), `ix_lead` |
| `Card` | `tone: 'default' \| 'dark' \| 'soft'`, `active?`, `kicker?`, `footer?` | `ix_card`, `ix_card_dark`, `ix_card_soft`, `ix_active`, `ix_card_foot`, `ix_kicker` |
| `CardGrid` | `children` | `row` + `col-*` + `ix_gap` |
| `Badge` | `kind: 'ok' \| 'warn' \| 'info' \| 'accent' \| 'bad' \| 'neutral'` | `ix_badge ix_b_ok\|warn\|info\|accent\|bad` |
| `ChipGroup` / `Chip` | `options`, `value`, `onChange` (`aria-pressed`) | `ix_chips`, `ix_chip (ix_on)` |
| `OptionGroup` / `OptionCard` | `options: { label, sub, badge? }[]`, `value`, `onChange` | `ix_options`, `ix_option (ix_on)` (join levels and plans, donate funds, suggest types) |
| `ResultBox` | `kind: 'ok' \| 'wait' \| 'bad'`, `title`, `children` | `ix_result ix_ok\|ix_wait\|ix_bad` |
| `Note`, `Help`, `TextLink`, `List`, `Kicker`, `SrOnly` | n/a | `ix_note`, `ix_help`, `ix_link`, `ix_list`, `ix_kicker`, `ix_sr` |
| `Field` | `id`, `label`, `error?`, `help?`, `children` (works with RHF `register`) | `contact_input`, `ix_err` (`role="alert"`), `ix_input_bad` |
| `Select` | `options` | `ix_select` |
| `Checkbox` | `label` | `form-check form-check-input form-check-label`, `ix_check` |
| `Switch` | `checked`, `locked?` | `ix_switch (ix_on, ix_locked)` |
| `ToggleRow` | `question`, `value: boolean \| null` | `ix_toggle_row` (eligibility yes/no) |
| `Table` | `columns`, `rows`, `state` (loading, empty, error) | `ix_table_wrap`, `ix_table` |
| `MatrixDot` | `granted` | `ix_dot`, `ix_none` |
| `Pagination` | `page`, `totalPages`, `onChange` | `pagination page-item page-link` ("01 02 03") |
| `Accordion` | `items: { q, a }[]`, `openIndex` | `faq_text accordion accordion-item accordion-header accordion-button (collapsed) accordion-collapse collapse (show) accordion-body` |
| `Expand` | `title`, `open`, `onToggle` | `ix_expand ix_expand_head ix_expand_body` |
| `Modal` | `open`, `labelledBy`, `onClose` (focus trap, Esc, focus returns to the opener) | `ix_modal` (`role="dialog" aria-modal`) |
| `Lightbox` | `items`, `index` | `venobox vbox-item` and the image-viewer dialog |
| `Stepper` | `steps`, `current` | `ix_steps`, `ix_done`, `ix_now` |
| `FlowSteps` | `steps`, `variant` | `ix_flow (ix_flow_2)`, `ix_num` |
| `Timeline` | `steps: { state, title, date }[]` | `ix_timeline`, `ix_done` |
| `Stat` | `value`, `label`, `sub?` | `ix_stat` |
| `StatusCards` | `cards: { tone, title, value, sub }[]` | `ix_scards`, `ix_scard ix_sc_orange\|ink\|green\|gold` |
| `BarRows` | `rows: { label, value, max }[]` | `ix_bar_row ix_bar ix_fill ix_acc` (bar charts with no chart library) |
| `Funnel` | `steps` | `ix_funnel` |
| `ProgressBar` | `pct`, `raised`, `goal` | `donate_progressbar barfiller tipWrap tip fill rising_goal` |
| `QuorumProgress` | `turnoutPct`, `quorumPct` | `ix_progress ix_progress_legend` |
| `KeyValueList` | `items` | `ix_kv` (`dl/dt/dd`) |
| `CodeBox` | `code` | `ix_code` (vote receipt, 2FA key) |
| `Diff` | `before`, `after` | `ix_diff ix_old ix_new` (amendments, CMS versions) |
| `ScorePicker` | `value`, `scale` | `ix_score` (1–5 buttons) |
| `VoteButtons` | `onPick` | `ix_vote_btns` |
| `CommentList` / `Comment` | `comments`, `composer` | `ix_comment ix_avatar` |
| `LockedState` | `title`, `children` | `ix_lock`, `ix_locked` |
| `Band` | `kicker`, `title`, `actions` | `ix_band` |
| `MembershipCard` | `member: MembershipSummary` | `ix_mcard` + `_top _logo _chip _no _tag _progress _fill _bottom _mark` |
| `PayCard` | `installment`, `state: idle \| redirecting` | `ix_pay_card ix_pc_head ix_pc_main` (fixed 290 px; the result overlays it) |
| `EditorField` | `value` (markdown-lite), `onChange` | `ix_editor ix_editor_bar` (B, I, H2, •, 🔗, 🖼 over a `textarea`) |
| `CountUp` | `value` | `counter` / `ix_count` (animated when in view) |

### 3.3 Template blocks (rendered by CMS sections, §7)

| Component | Section type | Source classes | Used on |
|---|---|---|---|
| `HeroSlider` | `hero_slider` | `banner banner_slider_item banner_overlay banner_text` | home |
| `CategoryCarousel` / `CategoryGrid` | `category_carousel` / `category_grid` | `caregoey category_item`, `category_page`, `category_1…4` | home, category |
| `AboutBlock` | `about_block` | `about_us about_us_img wsus_about_us_text about_description about_founder ix_partner_name` | home, about |
| `ServicesSlider` | `services_slider` | `services service_slider service_item read_btn` | home, about |
| `LogoStrip` | `logo_strip` | `brand single_brand` | home |
| `CampaignCard` (+ `CampaignSlider`, `CampaignList`, `RelatedCampaigns`) | `campaign_cards` | `campaign_card` + `ProgressBar`, `campaign`, `campaign_page`, `related_campaign` | home, campaigns, campaign detail |
| `CampaignDetails` | `campaign_detail` | `campaign_details product_slider_large_item product_slider_small_item`, `nav-link`, `tab-pane fade` | campaign detail |
| `CounterBand` | `counter_band` | `counter_section bg_counter counter_overlay counter_item counter`, `ix_on_dark` | home, about |
| `EventCard` (+ `EventSlider`, `EventGrid`) | `event_slider` / `event_grid` | `wssus__event_item ix_ev_link`, `event`, `event_page` | home, events |
| `EventDetails` | `event_detail` | `event_details` + the RSVP form | event detail |
| `TextMarquee` | `text_marquee` | `text_slider marquee_animi dc_marquee js-marquee` | home, about |
| `VolunteerCta` | `cta_volunteer` | `become_volunteer become_volunteer_bg bg_become become_volunteer_text` | home, about |
| `TestimonialSlider` / `TestimonialGrid` | `testimonials` | `testimonial testimonial_item rating description testimonial_footer`, `testimonial_page` | home, testimonials |
| `PeopleSlider` / `PeopleGrid` | `people` | `volunteer bg_volunteer volunteer_slider wsis__single_volunteer`, `volunteer_page` | home, about (leadership), volunteers |
| `FaqBlock` / `FaqPage` | `faq` | `faq faq_img` + `Accordion`, `faq_page` | home, about, faq |
| `BlogCard` (+ `BlogSection`, `BlogGrid`) | `news_list` | `single_blog`, `blog`, `blog_page` | home, news |
| `BlogDetails` | `news_detail` | `blog_details_area blog_details_thumb blog_details_header blog_details_text blog_single_comment` | news detail |
| `VideoDonateBlock` | `video_donate` | `video_and_donate video_donation_box video_donate_text play_btn input_box` | home |
| `DonorList` | `donor_list` | `donor_list donor_list_item pay` | donors |
| `PhotoGallery` / `VideoGallery` | `photo_gallery` / `video_gallery` | `photo_gallery gallery_item gallery_item_overlay venobox`, `video_gallery` | photos, videos |
| `ContactBlock` | `contact_info` | `contact contact_info` | contact |
| `IxCardGrid` | `card_grid` (generic `ix_card` grid fed by a collection or by items) | `ix_card…`, `ix_num`, `ix_kicker` | home (purpose, cycle, levels), our model, portfolios, committees, hubs … |
| `DecisionTable` | `decision_table` | `ix_table` + `Badge` | our model |
| `RoleBrowser` (+ `RoleCard`, `Tray`) | `form_block:volunteer` | `ix_role ix_role_top`, `ix_tray ix_tray_item ix_x` | volunteer |
| `AfricaMap` + `HubPanel` | `map_hub_panel` | `dc_map ix_map_wrap ix_map ix_country ix_hub ix_pin ix_pin_lbl ix_region_lbl ix_north ix_map_legend`, `ix_hub_panel ix_hp_block ix_hp_row` | grants |
| `CharterView` | `charter` | `sticky_sidebar ix_toc ix_charter_sec` | charter (privacy reuses `ix_charter_sec` through `legal_text`) |

---

## 4. Route table

**Guards:**

- **public**: anyone.
- **public-only**: a signed-in user is sent to their landing page.
- **auth**: `ProtectedRoute`.
- **perm:x**: `PermissionRoute`. `@hub` and `@committee` mean scoped.
- **2FA**: `TwoFactorRoute`. It applies when the user's role requires two-step (Chapter admin, USAFI finance,
  Content Editor or Super admin); otherwise it passes through.

Client guards are UX only, because the API authorizes every request (BE §4). Rule gates such as voting
eligibility, the signing lock or a closed ballot are **not** route guards. The page renders the design's locked or
"can't vote yet" state from the API response.

**Data sources:**

| Abbreviation | Source |
|---|---|
| `CMS:<key>` | content `pages/<key>` (see §7.4 for the sections) |
| `C:<collection>` | content collection entries |
| `M` | membership |
| `G` | governance |
| `E` | engagement |
| `U` | user |
| `P` | permission |
| `N` | notification |
| `A` | auth |

Every public route also exists as `/:lang/<route>` for the enabled non-default locales (F2). Both are mounted from
one children array, so there is one route definition per page. `LocaleGate` validates `:lang`. React Router ranks
static segments first, so `/faq` never matches `/:lang`.

| # | Route | Page component | Layout | Guard | Data source |
|---|---|---|---|---|---|
| 1 | `/` | `HomePage` | Public | public | CMS:home · C:events, testimonials, leadership · M `campaigns`, `settings/public` · E `events/availability` |
| 2 | `/about` | `AboutPage` | Public | public | CMS:about · C:portfolios, values, partners, leadership, committees, sponsors |
| 3 | `/about/committees` | `CommitteesPage` | Public | public | CMS:committees · C:committees · E `committee-interests` · `?c=` |
| 4 | `/charter` | `CharterPage` | Public | public | CMS:charter · C:charter_versions · `?v=` (version select) |
| 5 | `/about/volunteers` | `VolunteersPage` | Public | public | CMS:volunteers · C:volunteers (paged) |
| 6 | `/about/testimonials` | `TestimonialsPage` | Public | public | CMS:testimonials · C:testimonials (paged) |
| 7 | `/about/donors` | `DonorsPage` | Public | public | CMS:donors · C:donors (paged) |
| 8 | `/gallery/photos` | `PhotoGalleryPage` | Public | public | CMS:gallery_photos · C:photo_albums |
| 9 | `/gallery/videos` | `VideoGalleryPage` | Public | public | CMS:gallery_videos · C:video_galleries |
| 10 | `/faq` | `FaqPage` | Public | public | CMS:faq · C:faqs |
| 11 | `/contact` | `ContactPage` | Public | public | CMS:contact · C:contact_topics · E `contact` · `?topic=` |
| 12 | `/contact/thanks` | `ContactThanksPage` | Public | public | CMS:contact_thanks |
| 13 | `/privacy` | `PrivacyPage` | Public | public | CMS:privacy |
| 14 | `/newsletter/confirmed` | `NewsletterConfirmedPage` | Public | public | CMS:newsletter_confirmed |
| 15 | `/newsletter/unsubscribed` | `UnsubscribedPage` | Public | public | CMS:newsletter_unsubscribed · E `newsletter/unsubscribe`, `resubscribe` (`?token=`) |
| 16 | `/our-model` | `OurModelPage` | Public | public | CMS:our_model (tokens are resolved by the server) |
| 17 | `/join` | `JoinPage` | Public | public (OPTIONAL auth) | CMS:join · M `settings/public`, `join/quote`, `join`, `join/intents/:id` · `?level=&plan=` |
| 18 | `/donate` | `DonatePage` | Public | public | CMS:donate · C:portfolios, countries · M `donations` · `?fund=&country=&freq=` |
| 19 | `/donate/thanks` | `DonateThanksPage` | Public | public | CMS:donate_thanks · M intent status (`?intent=&t=`) |
| 20 | `/donate/cancel` | `CancelGiftPage` | Public | public | CMS:donate_cancel · M `donations/cancel?token=` |
| 21 | `/volunteer` | `VolunteerPage` | Public | public | CMS:volunteer · C:volunteer_roles · E `volunteer-signups` · `?area=` |
| 22 | `/volunteer/thanks` | `VolunteerThanksPage` | Public | public | CMS:volunteer_thanks (+ the teams from the submit response, kept in router state) |
| 23 | `/grants` | `GrantsPage` | Public | public | CMS:grants · C:countries, portfolios, roadmap, work_plan · G `proposals/public` · U `me/interests` (if signed in) · `?hub=&pf=` |
| 24 | `/campaigns` | `CampaignsPage` | Public | public | CMS:campaigns · M `campaigns?status=` · C:campaign_display |
| 25 | `/campaigns/:slug` | `CampaignDetailsPage` | Public | public | CMS:campaign_detail · C:campaign_display/:slug · M `campaigns/:slug`, `settings/public` |
| 26 | `/campaigns/category/:slug` | `CampaignCategoryPage` | Public | public | CMS:campaign_category · C:campaign_categories/:slug |
| 27 | `/nonprofits` | `NonprofitsPage` | Public | public | CMS:nonprofits · C:nonprofit_steps, eligibility_questions, nonprofit_faqs · E `eligibility-checks` |
| 28 | `/events` | `EventsPage` | Public | public | CMS:events · C:events, hubs · E `events/availability` |
| 29 | `/events/:slug` (design: `:id`; slugs are per locale, BE §3.1) | `EventDetailsPage` | Public | public (OPTIONAL auth) | CMS:event_detail · C:events/:slug · E `rsvps`, `my-rsvp`, `availability` · the legacy `#e=n` maps to a slug |
| 30 | `/hubs` | `HubsPage` | Public | public (OPTIONAL) | CMS:hubs · C:hubs · E `hub-memberships` · `?hub=` |
| 31 | `/news` | `NewsPage` | Public | public | CMS:news · C:news (paged, `?page=`) |
| 32 | `/news/:slug` | `NewsDetailsPage` | Public | public | CMS:news_detail · C:news/:slug |
| 33 | `/news/share-a-story` | `ShareStoryPage` | Public | public (OPTIONAL) | CMS:share_story · E `stories` |
| 34 | `/auth/sign-in` | `SignInPage` | Auth | public-only | CMS:auth_sign_in · A `login-link`, `sso/wazi/authorize`, `sso/exchange` (`?sso=`), `?next=` |
| 35 | `/auth/sign-up` | `SignUpPage` | Auth | public-only | CMS:auth_sign_up · A `sign-up` (see FQ5) |
| 36 | `/auth/forgot-password` | `ForgotPasswordPage` | Auth | public-only | CMS:auth_forgot · A `login-link` (see FQ5) |
| 37 | `/auth/check-email` | `CheckEmailPage` | Auth | public-only | CMS:auth_check_email · A `login-link` (resend) |
| 37b ★ | `/auth/sign-in/link?token=` | `ConsumeLinkPage` (renders the check_email expired or valid states) | Auth | public | A `login-link/consume`, then 2FA or landing |
| 38 | `/auth/two-step` | `TwoStepPage` | Auth | challenge token in session state | CMS:auth_two_step · A `2fa/login` |
| 39 | `/auth/two-step/setup` | `TwoStepEnrolPage` | Auth | auth | CMS:auth_two_step_setup · A `2fa/setup`, `2fa/verify` |
| 40 | `/portal` | `PortalDashboardPage` | Portal | auth | M `me/membership`, `me/installments`, `installments/:id/pay` · G `ballots/current`, `amendments?status=circulating`, `me/charter-signature` · U `me` |
| 41 | `/portal/history` | `ContributionHistoryPage` | Portal | auth | M `me/contributions` (+ export) |
| 42 | `/portal/vote` | `VotePage` | Portal | auth + perm:votes:read | G `ballots/current`, `ballot-items/:id/votes`, `threads/*` |
| 43 | `/portal/vote/:proposalId` | `ProposalPage` | Portal | auth + perm:votes:read | G `proposals/:id` |
| 44 | `/portal/vote/receipt/:participationId` | `VoteReceiptPage` | Portal | auth | G `me/participations/:id` · the receipt code comes from router state, **shown once** (BE §3.5) |
| 45 | `/portal/decisions` | `DecisionsPage` | Portal | auth + perm:decisions:read | G `decisions`, `amendments`, `charter/sections`, `ballot-items/:id/votes` |
| 46 | `/portal/decisions/:id` | `AmendmentPage` | Portal | auth + perm:decisions:read | G `amendments/:id`, `threads/*` |
| 47 | `/portal/results` | `ResultsPage` | Portal | auth + perm:results:read | G `results` |
| 48 | `/portal/results/:id` | `ResultPage` | Portal | auth + perm:results:read | G `results/:id` |
| 49 | `/portal/suggest` | `SuggestPage` | Portal | auth + perm:nominations:create | G `me/nominations`, `nominations` · C:countries |
| 50 | `/portal/charter/sign` | `SignCharterPage` | Portal | auth + perm:signatures:read | G `me/charter-signature` (shows the locked state from the API) |
| 51 | `/portal/charter/signed` | `CharterSignedPage` | Portal | auth | G `me/charter-signature` (+ pdf) |
| 52 | `/portal/reviews` | `MyReviewsPage` | Portal | auth + perm:scoring:read@committee | G `me/reviews` |
| 53 | `/portal/reviews/:proposalId` | `ScoreProposalPage` | Portal | auth + perm:scoring:update@committee | G `me/reviews/:id` (+ recuse) |
| 54 | `/portal/profile` | `ProfilePage` (portal) | Portal | auth | U `me`, `me/interests`, `me/email-preferences` · C:hubs, countries, portfolios · A `2fa/status` |
| 55 | `/portal/privacy` | `PrivacyDataPage` | Portal | auth | U `me/data-requests` · E `me/consents` |
| 56 | `/admin` | `AdminDashboardPage` | Admin | auth + 2FA + any of (campaigns:read, ballots:read, submissions:read, content:read) | M `admin/dashboard`, `admin/funnel`, `admin/settings/changes` · G `admin/dashboard` · E `admin/summary`, `admin/analytics/funnel` · content `admin/summary` |
| 57 | `/admin/finance` | `FinanceDashboardPage` | Admin | 2FA + perm:payments:read | M `admin/finance/summary` |
| 58 | `/admin/hubs` | `HubDashboardPage` | Admin | perm:hub_dashboard:read@hub (scope chosen on the server) | U `hubs/:hub/summary` · E `admin/hubs/:hub/*` · M `admin/hubs/:hub/summary` |
| 59 | `/admin/exports` | `ExportsPage` | Admin | 2FA + perm:users:list | M `admin/exports*` |
| 60 | `/admin/people` | `PeoplePage` | Admin | 2FA + perm:users:list | U `users?search&role&hub_key&level` · A `admin/users` |
| 61 | `/admin/people/:id` | `PersonPage` | Admin | 2FA + perm:users:read | U `users/:id` · P `users/:id/roles`, `audit?subject_user_id=` · C:hubs, committees |
| 62 | `/admin/roles` | `RolesPage` (admin) | Admin | 2FA + perm:roles:list | P `roles` |
| 63 | `/admin/permissions` | `PermissionMatrixPage` | Admin | 2FA + perm:permissions:read | P `matrix` |
| 64 | `/admin/campaigns` | `CampaignsAdminPage` | Admin | 2FA + perm:campaigns:read | M `admin/campaigns` |
| 65 | `/admin/settings` | `CharterSettingsPage` | Admin | 2FA + perm:charter_settings:read | M `admin/settings`, `admin/settings/changes` |
| 66 | `/admin/approvals` | `ApprovalQueuePage` | Admin | 2FA + perm:charter_settings:read | M `admin/settings/changes?status=pending`, approve/reject |
| 67 | `/admin/settings/history` | `SettingsHistoryPage` | Admin | 2FA + perm:charter_settings:read | M `admin/settings/history` |
| 68 | `/admin/ledger` | `LedgerPage` | Admin | 2FA + perm:payments:read | M `admin/payments` (`?type&q&page`) |
| 69 | `/admin/ledger/offline` | `OfflinePaymentPage` | Admin | 2FA + perm:payments:create | M `admin/payments/offline` · U `users?search=` |
| 70 | `/admin/finance-flags` | `FinanceFlagsPage` | Admin | 2FA + perm:payments:read | M `admin/finance-flags` |
| 71 | `/admin/reconciliation` | `ReconciliationPage` | Admin | 2FA + perm:payments:read | M `admin/reconciliation-runs` |
| 72 | `/admin/ballots` | `BallotsPage` | Admin | 2FA + perm:ballots:read | G `admin/ballots` |
| 73 | `/admin/proposals/new` | `ProposalFormPage` | Admin | 2FA + perm:ballots:create | G `admin/proposals` · C:countries, portfolios |
| 74 | `/admin/decisions` | `DecisionsAdminPage` | Admin | 2FA + perm:decisions:read | G `admin/decisions`, `admin/amendments` |
| 75 | `/admin/results/publish` | `PublishResultsPage` | Admin | 2FA + perm:results:read | G `admin/results` |
| 76 | `/admin/nominations` | `NominationsPage` | Admin | 2FA + perm:nominations:read | G `admin/nominations` |
| 77 | `/admin/signatures` | `SignaturesPage` | Admin | 2FA + perm:signatures:read | G `admin/signatures` |
| 78 | `/admin/rubric` | `RubricPage` | Admin | 2FA + perm:scoring:read | G `admin/rubric` |
| 79 | `/admin/review-board` | `ReviewBoardPage` | Admin | 2FA + perm:scoring:read | G `admin/review-board` |
| 80 | `/admin/volunteer-signups` | `SignupsPage` | Admin | perm:signups:read (co-Ambassadors are scoped on the server) | E `admin/volunteer-signups` |
| 81 | `/admin/submissions` | `SubmissionsPage` | Admin | 2FA + perm:submissions:read | E `admin/submissions` |
| 82 | `/admin/routing` | `RoutingRulesPage` | Admin | 2FA + perm:submissions:read | E `admin/routing-rules`, `admin/inboxes` · N `templates` |
| 83 | `/admin/cms` | `CmsStudioPage` | Admin | 2FA + perm:content:read | content `admin/*` |
| 84 | `/admin/cms/preview?token=` | `CmsPreviewPage` | Admin | 2FA + perm:content:read | content `preview/:token` → `<CmsPage source="preview">` |
| 85 | `/admin/emails` | `EmailTemplatesPage` | Admin | 2FA + perm:emails:read | N `templates*` |
| 86 | `/admin/emails/delivery` | `DeliveryLogPage` | Admin | 2FA + perm:emails:read | N `deliveries` |
| 87 | `/admin/audit` | `AuditLogPage` | Admin | 2FA + perm:audit:list | P `audit` |
| 88 | `/admin/audit/:id` | `AuditEntryPage` | Admin | 2FA + perm:audit:read | P `audit/:id` |
| ★ | `/design`, `/design/{main,components,primitives}` | `DesignPage` (Main + Components boards + all Step 3 primitives) | none | dev builds only (not registered or bundled in production) | static props |
| starter | `/app/*`, `/auth/legacy/{sign-in,sign-up,verify-otp,two-factor,forgot-password,reset-password}` | starter pages (moved unchanged) | PrivateLayout / StarterAuthLayout (in `TwScope`) | as today | starter APIs. The legacy password sign-in is shown only when `VITE_PASSWORD_LOGIN=true`. |
| — | `*` | design `NotFoundPage` | Public | public | CMS:not_found |

**Landing after sign-in.**

- If `?next=` is present, the user goes there.
- If not, `resolveLanding(session)` decides: any role in {CHAPTER_ADMIN, USAFI_FINANCE, CONTENT_EDITOR,
  HUB_CO_AMBASSADOR, SUPER_ADMIN} goes to `/admin`. Everyone else goes to `/portal`, which matches "members land
  in the portal, admins in the admin console" (Step 14).

**Shell menus.** The shell top bar's "Website" and "Portal" rail items link out of the shell. The `portalMenu` and
`adminMenu` configs hide entries the user can't open (`can()`), and they use the exact item order and labels from
the snapshots. The labels are UiString keys.

### 4.1 Step 4 implementation notes (layouts and router)

- **Route metadata.** Every design route carries a typed `handle` (`app/routes/routeHandle.ts`): `screen` (the
  snapshot file), `pageKey` (CMS page → breadcrumb banner), `nav` (the public menu item marked active) and `shell`
  (rail group, sidebar item, h1 key, crumb rule). Layouts read it with `useRouteHandle()`.
- **Active menu item is declared per route, not derived from the URL**, because the snapshots mark it per page:
  join/donate/volunteer (+ thanks/cancel) mark only "Opportunities"; contact-thanks and privacy only "About";
  share-a-story marks News › Share a Story; home, auth and newsletter pages mark nothing.
- **Breadcrumb banner lives in `PublicLayout`** (fed by `usePageBanner(pageKey, locale)`), so `CmsPage` (Step 5) does
  not render it. Seeds: `features/content/fixtures/pageBanners.en.ts`.
- **Chrome content** (one typed navConfig + top bar + footer) is the CMS seed `features/content/fixtures/chrome.en.ts`,
  read through `contentService` → `usePublicChrome(locale)` with fixture `initialData` (no flash). Step 13 swaps the
  service's source. Microcopy (aria-labels, shell labels) is the UiString seed `fixtures/uiStrings.en.ts` via `useT(ns)`.
- **Shells** are one `ShellLayout` fed by `config/navigation/{portalMenu,adminMenu}.ts`. Verified pixel-identical to
  the snapshots once API-only data is removed. Until Steps 15/16 these are **not rendered**: the top-bar pill, the
  sidebar status line ("Incubator · Voting member"), the sample avatar photo, the bell count and the sidebar
  `ix_count` badges (all supported by `AppShell` props). The person crumb shows `:id` until the page supplies the name.
- **Placeholders.** Every route renders the shared `pages/ScreenPlaceholder` (screen id + path only, no copy) inside
  its real layout and guard; Steps 5/6/15/16 replace the route `element`s.
- **Guards.** `ProtectedRoute` redirects to the design sign-in with `?next=` (starter `/app/*` keeps the legacy
  sign-in); `PublicOnlyRoute` honours a safe `?next=` then `resolveLanding()`; `PermissionRoute` takes a `fallback`
  (`/portal` in the design areas); `TwoFactorRoute` passes through until Step 14 adds `session.mfa` (the API enforces
  2FA meanwhile); `LocaleGate` guards `/:lang`.
- **Starter auth** moved to `/auth/legacy/*` (`PATHS.legacyAuth`, `pages/auth/legacy/`, `StarterAuthLayout`); the
  starter home page was removed (`/` is the design home). Starter screens verified pixel-identical before/after.
- **F3 side effect.** With the currency select gone the language select became the top bar's last `<li>`, which the
  template sizes at 65 px; `styles/app.css` keeps its own 85 px (`li:only-child`).
- **LocaleProvider** is mounted in `RootLayout` (inside the router, since the URL prefix is part of the locale) rather
  than `AppProviders`.

---

## 5. From `.dc.html` state and `renderVals()` to React

### 5.1 General rules

| `.dc.html` construct | React |
|---|---|
| `state` key that is **ephemeral UI** (an open accordion, the active tab, a slider position, a modal, the menu, the language dropdown) | `useState` in the owning component |
| `state` key that is a **shareable selection** (level, plan, area, fund, country, freq, topic, hub, c, version, admin filters, page) | **URL search params** via `useSearchParamState(key, codec, default)`. Changing a filter uses `replace`, and a wizard step uses `push`. |
| `state` keys for **form inputs** plus `tried`/validation (`name`, `email`, `txt`, `tried2` …) | **React Hook Form + Zod**. `tried` becomes `formState.isSubmitted`, and `*Err` and `*Cls` become `errors.x` → `Field error` → `ix_err` plus `ix_input_bad` |
| Hard-coded data arrays (`LV`, `FUNDS`, `R`, `H`, `HUB`, `SSC`, `P`, `D`, `EVX`, `C` …) | **React Query** hooks over the CMS or domain APIs (never constants). Levels come from `settings/public`, funds from `C:portfolios`, roles from `C:volunteer_roles`, and so on. |
| Values derived in `renderVals()` | Plain derivation in render (`useMemo` only when it is expensive, e.g. the map path list). **Business numbers** such as the installment plan, eligibility, quorum and weighted totals are **displayed from the API**. Client-side previews (`join/quote`) also come from the API, so the UI never re-implements a rule. |
| `class="{{xCls}}"` | `lib/classes.ts` helpers return the exact strings, for example `chipClass(on) → 'ix_chip' + (on ? ' ix_on' : '')` |
| `onClick="{{pick_x}}"`, `onChange="{{setX}}"` | Event handlers. `aria-pressed`, `aria-expanded` and `aria-current` are kept exactly as in the design. |
| `<sc-for>` / `<sc-if>` | `.map` with a stable `key` / conditional rendering |
| Boilerplate (`fix`, `prog`, `progOn`, `menu`, `langOpen`, `curOpen`, `lang`, `cur`) | `useSticky()` → `menu_fix` (in `PublicHeader`), `useScrollProgress()` → `ScrollProgressButton`, local `menu`/`langOpen` state, `lang` → `useLocale()` (§8), and `cur` is removed (F3) |
| `location.hash` deep links | `useLegacyHashParams()` runs once in `RootLayout`: when the URL has `#k=v&…`, it is rewritten to `?k=v&…` with `replace`, so old and shared links keep working. Pages read only search params. |
| Sliders (`dc_track`, `draggable`, `SPEED = 500`, autoplay `setInterval`, `asNavFor` pairs, responsive `relShow()`) | `useSlider({ count, visible: breakpoints, autoplayMs, speedMs: 500, loop })` reproduces the transform and clone logic. It pauses on hover or focus and respects `prefers-reduced-motion`. **No carousel library.** |
| Entrance animations (`wow`/`animate` classes), counters, `grown` (progress bars grow after 200 ms) | `useInView()` (IntersectionObserver) sets the same classes. `useCountUp(value)`. Progress fill width goes from 0 to `pct%` after mount. |

### 5.2 Per-screen mapping (interactive screens)

| Screen | Local UI state | URL params | React Query / mutations | Notes |
|---|---|---|---|---|
| join (17) | `step` 1–4 | `level` (initiator…investor), `plan` (1–6; `?plan=` opens step 3, as `#plan` does) | `useMembershipSettings()`, `useJoinQuote(level, plan)`, `useJoin()` → redirect to `checkout_url`, `useIntentStatus(id, token)` polls every 2 s until terminal | Step 2 form uses RHF+Zod (name, email, city **or** hub, newsletter). "Due today" and the schedule come from the quote, so there is no client maths. |
| donate (18) | n/a | `fund` (accepts the legacy `area`, FQ3), `country`, `freq` | `useCollection('portfolios')`, `useCollection('countries')`, `useDonate()` → checkout | Amount preset or custom: RHF. The summary text is a UiString with variables. |
| cancel_gift (20) | `done` → mutation success | `token` | `useCancelInfo(token)`, `useCancelGift()` | |
| volunteer (21) | `tray: role_key[]` (`useState`, persisted to `sessionStorage` while on the page) | `area` (`chapter`, `us`, `usafi`, `africa`) | `useCollection('volunteer_roles', { filter: { area } })`, `useVolunteerSignup()` | The tray requires at least 1 role. Submitting navigates to the thanks page with `teams` in router state. |
| grants (23) | hovered country | `hub` (country key, e.g. `kenya`), `pf` (portfolio) | `useCollection('countries')`, `usePublicProposals({ country, portfolio })`, `useSaveInterests()` when signed in | The SVG map is markup only. `ix_country` gets `ix_on` from `hub`. The country select and the map stay in sync through the same param. |
| hubs (30) | `done` | `hub` | `useCollection('hubs')`, `useJoinHub()` | The design's `#hub=` uses display names, which are mapped to keys (FQ6). |
| committees (3) | `sent[]` → per-card mutation success | `c` (card index → committee key) | `useCollection('committees')`, `useCommitteeInterest()` | |
| contact (11) | n/a | `topic` | `useCollection('contact_topics')`, `useContact()` → `/contact/thanks` | |
| nonprofits (27) | `ans[4]`, `faq` | n/a | `useCollection('eligibility_questions')`, `useEligibilityCheck()` | The result box is the API's `passed` (`ix_result ix_ok/ix_bad`). |
| charter (4) | `sec` (scroll spy → `ix_toc` `ix_on`) | `v` (version key) | `useEntry('charter_versions', v)` | "Earlier version" notice when `!data.is_current` |
| campaign_details (25) | slider positions, `tab`, `faq` | `amount` (chip, prefilled from `?level=`) | `useCampaign(slug)` + `useEntry('campaign_display', slug)` | Join and renew links go to `/join?level=`. |
| event_details (29) | `rsvpDone` → mutation success | (`:slug` route) | `useEntry('events', slug)`, `useEventAvailability`, `useRsvp()`, `useMyRsvp()` | Signed in means one-click RSVP (the name and email inputs are hidden, as the design's placeholder suggests). |
| share_story (33) | `done` → mutation | n/a | `useShareStory()` (multipart) | |
| photo_gallery (8) | lightbox `index` | n/a | `useCollection('photo_albums')` | The `Lightbox` dialog has a focus trap. |
| sign_in (34) | n/a | `next`, `sso` | `useRequestLoginLink()` → `/auth/check-email`, `useSsoExchange(code)` | |
| portal (40) | `paying` → `usePayInstallment()` pending state | n/a | `useMyMembership()`, `useMyInstallments()`, `useCurrentBallot()`, `useCirculatingAmendments()`, `useCharterSignature()` | `PayCard` overlays "Opening WAZIImpact.org…" without resizing (fixed 290 px), then `window.location.assign(checkout_url)`. The summary updates from the API, never from the return page. |
| portal_vote (42) | `open` (expanded proposal), `modal` (item id), `choice`, `coi` (`'no' \| 'has'`) | n/a | `useCurrentBallot()` (staleTime 15 s, refetches on focus for live turnout), `useCastVote()`, `useComments(subject)`, `usePostComment()` | **COI logic exactly as the design:** `pickHas` forces `Abstain`, the cast button is disabled until a COI option is picked, and the label is "abstain" or "cast my X vote". On success the page navigates to the receipt with the `receipt_code` in router state (shown once). |
| portal_decisions (45) | `dv` (per-decision pick) | n/a | `useOpenDecisions()`, `useAmendments()`, `useCharterSections()`, `useProposeAmendment()` (RHF: ≥10 trimmed characters) | The "View as voting member / View as $250 member" chips are a design-review switch, so they are **not** rendered. The view comes from `me.eligible` (FQ1). |
| portal_suggest (49) | `type` | n/a | `useMyNominations()` (`remaining`), `useCreateNomination()` | RHF: title required, description 20 to 3,000, country unless Priority, contact only for Nominee |
| portal_sign (50) | n/a | n/a | `useCharterSignature()`, `useSignCharter()` | The "Your status / Preview when unlocked" chips are a design-review switch and are not rendered (FQ1). The typed-name match is **validated server-side** (`NAME_MISMATCH` → `ix_err`), with a client pre-check only for UX. |
| portal_score (53) | `sc[5]` (draft scores), `rec` | n/a | `useMyReview(id)`, `useSaveReview()` (draft or submit), `useRecuse()` | The weighted total shown after submit comes from the API response. |
| portal_profile (54) | `prefs` → `useEmailPreferences()` with optimistic toggle | n/a | `useMe()`, `useUpdateMe()`, `useUpdateInterests()` | "Receipts" is a locked switch (`ix_locked`). |
| portal_privacy (55) | `exp`, `del` → mutation success | n/a | `useDataRequests()`, `useCreateDataRequest()`, `useConsents()` | |
| admin lists (56–88) | modal or inline edit state | **all filters, search, page and sort** (`?q&status&type&role&page`) | one `useAdmin…` query per screen and one mutation per action, invalidating the list's key | The design admin pages are static, so the behaviour comes from the BE §4 contract. Approve and reject buttons show their state, and the 409/422 codes map to `ix_err`. |

---

## 6. API client plan

### 6.1 Endpoints registry additions (`src/infrastructure/api/endpoints.ts`)

These paths are relative to `API_CONFIG.baseURL`, as today, and mirror BE §4 one-to-one. Existing keys stay
unchanged.

```ts
auth:        { …existing, loginLink: 'auth/login-link', consumeLink: 'auth/login-link/consume', signUp: 'auth/sign-up',
               ssoAuthorize: 'auth/sso/wazi/authorize', ssoExchange: 'auth/sso/exchange',
               adminResetTwoFactor: (id) => `auth/admin/users/${id}/2fa/reset` },
users:       { …existing, interests: 'users/me/interests', emailPreferences: 'users/me/email-preferences',
               dataRequests: 'users/me/data-requests', hubSummary: (hub) => `users/hubs/${hub}/summary` },
permissions: { …existing, matrix: 'permissions/matrix', mine: 'permissions/me/permissions',
               audit: 'permissions/audit', auditById: (id) => `permissions/audit/${id}`, auditExport: 'permissions/audit/export' },
notifications:{ …existing, templates: 'notifications/templates', template: (k) => `notifications/templates/${k}`,
               templateLocale: (k, l) => `notifications/templates/${k}/${l}`, templateTest: (k) => `notifications/templates/${k}/test`,
               deliveries: 'notifications/deliveries' },
content:     { locales: 'content/locales', page: (k) => `content/pages/${k}`, nav: (m) => `content/nav/${m}`,
               uiStrings: 'content/ui-strings', entries: (c) => `content/collections/${c}/entries`,
               entry: (c, s) => `content/collections/${c}/entries/${s}`, resolve: 'content/resolve',
               preview: (t) => `content/preview/${t}`, schemas: 'content/schemas',
               admin: { entries, page(id), sections(id), section(id), sectionOrder(id), items(id), item(id), fields,
                        copyFromDefault, translationProgress, submitReview(t, id), publish(t, id), versions, version(id),
                        versionDiff(id), versionRestore(id), previewLinks, media, mediaById(id), fieldMedia, nav(m),
                        uiStrings, uiString(k, l), locales, summary } },
engagement:  { contact, volunteerSignups, hubMemberships, rsvps(ev), availability, myRsvp(ev), committeeInterests, stories,
               eligibilityChecks, newsletterSubscribe, newsletterUnsubscribe, newsletterResubscribe, pageview, myConsents,
               admin: { signups, signupRole(id, role), signupsExport, submissions, submission(id), approveStory(id),
                        routingRules, routingRule(id), inboxes, hubSummary(h), hubSignups(h), hubEvents(h), summary, funnel } },
membership:  { settingsPublic, campaigns, campaign(slug), joinQuote, join, intent(id), donations, cancelInfo, cancel,
               me: { membership, installments, payInstallment(id), renew, contributions, contributionsExport, donations, cancelDonation(id) },
               admin: { dashboard, funnel, finance, hubSummary(h), campaigns, campaign(id), settings, settingsChanges,
                        approve(id), reject(id), settingsHistory, payments, payment(id), offline, refunds(id), flags,
                        resolveFlag(id), reconciliation, donations, donationsExport, exports, exportDownload(id) } },
governance:  { publicProposals, currentBallot, ballots, proposal(id), vote(itemId), participation(id), verifyReceipt(id),
               comments(t, id), decisions, amendments, amendment(id), charterSections, results, result(id),
               myNominations, nominations, mySignature, mySignaturePdf, myReviews, myReview(id), recuse(id),
               admin: { dashboard, ballots, ballot(id), openBallot(id), proposals, proposal(id), publishProposal(id),
                        dueDiligence(id), decisions, decision(id), amendments, placeOnBallot(id), results, publishResult(id),
                        notices(id), nominations, nominationAction(id, a), convert(id), signatures, signaturesExport,
                        signaturePdf(id), rubric, reviewBoard, reviewers(id), moveToBallot(id), hideComment(id) } },
```

### 6.2 `apiClient` extensions (`src/infrastructure/api/api.ts`)

All changes are additive.

- **Request interceptor:** adds `Accept-Language: <current locale>` (from `i18n/locale.store`), so backend system
  messages follow the UI language (BE §8.1). The bearer token is attached as today.
- **401 handling:** before clearing the session, a **single-flight refresh** runs. It calls `POST auth/refresh`
  with the stored refresh token, retries the original request once, and only then clears. Access tokens last 15
  minutes, so without this members would be logged out mid-vote.
- **403 `TWO_FACTOR_REQUIRED`:** the user is redirected to `/auth/two-step?next=` instead of seeing a generic error.
- **Errors:** a new `infrastructure/api/errors.ts` exports `ApiError { status, code?, message, fieldErrors? }`,
  built from `{ success:false, code, message }`. `toApiError(e)` is used by the hooks. The existing
  `extractApiError` is kept and now delegates to it.

### 6.3 Types

- `src/types/api.ts` (extended): `ApiEnvelope<T>` and `PaginatedData<T>` (existing), plus
  `LocalizedValue { value: string; resolved_locale: string; is_fallback: boolean }`,
  `Money { amount_cents: number; currency: 'USD' }` and `ApiErrorBody`.
- `src/domain/entities/*.types.ts` hold framework-free **domain types**: `CmsPageTree`, `CmsSection`, `CmsMedia`,
  `Locale`, `Campaign`, `MembershipSummary`, `Installment`, `Contribution`, `Donation`, `Ballot`, `BallotItem`,
  `Proposal`, `Amendment`, `ResultPublication`, `Nomination`, `CharterSignature`, `ReviewAssignment`, `VolunteerRole`,
  `Submission` and others.
- Each slice's `types/` holds the **DTOs**. Its `api/*.service.ts` maps DTO to domain type, exactly like today's
  `userService`, so components never see raw responses. Money stays in integer cents until formatting.
- `domain/enums/permission.enum.ts` gets the BE §6.2 permission list, and `constant/permissions.ts` is updated to
  match. `authStore.can(permission, scope?)` gains an optional scope, filled from `GET permissions/me/permissions`
  after login. The session also stores `roles` and `mfa`.

### 6.4 React Query keys and caching

Each slice has `lib/queryKeys.ts`, following the existing `KEYS` pattern in `useUsers`. The convention is
`[slice, resource, ...params]`, and **every query that returns public text includes the locale**:

```ts
contentKeys.page(pageKey, locale)                 // ['content','page','home','am']
contentKeys.collection(key, locale, params)       // ['content','collection','events','en',{page:1,filter:{hub_key:'atlanta'}}]
contentKeys.entry(key, slug, locale)              // ['content','entry','news','why-i-joined','en']
contentKeys.nav(menu, locale) · contentKeys.ui(locale, ns) · contentKeys.locales()
membershipKeys.settings() · membershipKeys.campaigns(status, locale) · membershipKeys.me.membership()
membershipKeys.admin.payments(filters)            // filters = the URL search params object
governanceKeys.currentBallot(locale) · governanceKeys.proposal(id, locale) · governanceKeys.comments(type, id)
```

| Data | `staleTime` | Notes |
|---|---|---|
| CMS pages, collections, nav, UI strings | 60 s | Matches the server cache (BE §8.5). `placeholderData: keepPreviousData` on a locale switch, so the layout doesn't flash. |
| `settings/public`, locales | 5 min | |
| Member and admin data | 30 s | The existing default |
| `ballots/current` | 15 s | Plus `refetchOnWindowFocus` (live turnout) |
| Payment intent status | n/a | `refetchInterval: 2000` until a terminal status, for at most 2 minutes, then "still waiting" (`ix_wait`) |
| Mutations | n/a | Invalidate their own slice. Cross-slice effects are listed in one `lib/invalidation.ts` map (for example, casting a vote invalidates `currentBallot`, and signing invalidates `portal` status cards). |

### 6.5 Loading, empty and error states (design style)

- `components/design/states/` provides:
  - `LoadingState`: keeps the block's height. In-place skeletons are built from the block's own markup with
    empty text, and tables render the `ix_table` header plus placeholder rows.
  - `EmptyState`: `ix_note` or an `ix_card` with UiString copy (`states.empty.<context>`).
  - `ErrorState`: `ix_result ix_bad` with a retry `Button`.
  - `QueryState`: a `<QueryState query isEmpty={…}>{data => …}</QueryState>` wrapper used by every list and detail.
- **Business-rule codes** (BE §0.3) map to UiStrings `errors.<CODE>` and to design states. For example:
  - `NOT_VOTING_ELIGIBLE` → "You can't vote on this yet" (`h4` in the decisions design)
  - `SIGNING_LOCKED` → the locked charter state
  - `ALREADY_VOTED` → "Ballot cast"
  - `BALLOT_NOT_OPEN`, `NAME_MISMATCH`, `INCOMPLETE_SCORES`, `MIN_HOLDERS`, `MEDIA_IN_USE`
- **Forms:** `422` field errors go to RHF `setError` and render as `ix_err` plus `ix_input_bad`. Submit buttons show
  pending state (`ix_disabled`).
- **Toasts:** design screens give **inline** feedback, as the design does. New slices set
  `meta: { suppressErrorToast: true }` through a small `inlineFeedback` helper, so the existing global toast
  behaviour remains for the starter screens only.

---

## 7. Content-driven rendering

> **As built in Step 5.** These notes refine §7.1–§7.5. The contract and its behaviour are unchanged; only the
> mechanics differ.
> - **Schemas are declared once, in TypeScript:** `features/content/schemas/sectionTypes.ts`, using the small field
>   DSL in `schemas/fields.ts` (`f.text()`, `f.rich()`, `f.link(s)()`, `m.image()`, `s.enumOf()`, `s.source()` …).
>   From that one declaration we get the TS types (by inference, so there is no `gen:content` step and no generated
>   file to keep in sync), the Zod validators, and the JSON Schema. `npm run export:content-schemas` writes the JSON
>   Schema to `schemas/content-schemas.json`, which the backend's Joi registry is tested against.
> - **Registry:** `features/content/components/sectionRegistry.tsx`. It maps each type to `entry(schema, Component)`,
>   and `SectionData<typeof x>` types each section component. `breadcrumb_banner` is a section of every page tree;
>   `PublicLayout` renders it and `CmsPage` skips it.
> - **Fixtures:** `features/content/fixtures/en/{pages,collections}/*.ts` plus `ui.ts` (UiStrings). They are built
>   in the exact API shape by `fixtures/builders.ts` and resolved by `contentService` (the only file that changes in
>   Step 13). The home campaign cards come from a minimal `features/membership` slice (`GET /campaigns` fixture),
>   composed with `C:campaign_display`.
> - **Pages:** the routes of the 14 Step 5 pages render `pages/public/CmsRoutePage`, which reads the route handle's
>   `pageKey` and renders `<CmsPage>`. The other public routes keep the placeholder until Step 6.
> - **Section components** (`features/content/components/sections/`) render design markup only. They are therefore
>   excluded from Tailwind's content scan and included in `check:css`, the same as `components/design`.
> - **`check:copy`** scans `components/design/{blocks,chrome}`, `features/content/components` and `pages/public`. The
>   starter screens (`pages/auth/legacy`, `features/auth|dashboard`) are out of scope until Steps 14–15 replace them.
>   No allowlist file is needed: glyph-only text (`$`, `×`, `·`) has no letters and passes.

> **As built in Step 6 (public pages B).**
> - **Public APIs, mocked:** typed services per slice: `features/engagement/api/engagementService.ts`,
>   `features/membership/api/{settings,campaign,join,donation}Service.ts` and `features/governance/api/proposalService.ts`.
>   They return the documented backend shapes (`src/types/*.dto.ts`) through `infrastructure/api/mock.ts`. Endpoint
>   strings are already in `API_ENDPOINTS.{engagement,membership,governance}`, so in Step 13 only the service bodies
>   change.
> - **Rules:** `domain/rules/membership.ts` holds the installment plan, level from amount and voting threshold, read
>   from the charter settings (`GET /settings/public`, `usePublicSettings`).
> - **Forms:** `useDesignForm` (react-hook-form + the local `zodResolver`; errors show after the first submit, as in
>   the design). Error copy lives in the UiStrings `forms` namespace: the design's wording where the design has it,
>   otherwise flagged placeholders. Errors render through `<Field error>`.
> - **`form_block`** sections render `FORM_REGISTRY[form_key]` (`features/content/components/formRegistry.tsx`).
>   `status_card` can show the form's last submission (`infrastructure/storage/submission.storage.ts`, sessionStorage)
>   on the thanks pages.
> - The engagement / membership / governance `components/` folders render design markup only. They are therefore
>   excluded from Tailwind's content scan, and covered by `check:css` and `check:copy`.

> **As built in FE-7 (auth on mock auth).**
> - **Contract:** `features/auth/api/authRepository.ts` covers login link, consume, WAZI SSO, sign-up and TOTP
>   (login, setup, verify). `api/index.ts` picks the mock or HTTP implementation from `VITE_DATA_SOURCE`
>   (`infrastructure/api/dataSource.ts`). The HTTP one is a placeholder until INT-3.
> - **Mock auth:** `mockAuthRepository.ts` plus `fixtures/demoUsers.ts`. The demo people are the design's sample
>   members (Amara Mensah, Kofi Boateng, Wanjiru Kamau, David Otieno, Aisha Diallo, Grace Mwale), with three
>   "(demo)" accounts for Editor, Hub co-Ambassador and Super admin.
>   - State (links, enrolment, challenges) lives in localStorage and resets from the demo switcher.
>   - Two-step accepts any 6 digits except `000000`.
>   - The emailed link appears in a **demo inbox** on check_email. WAZI SSO signs in Amara Mensah.
> - **Session:** `authStore.setDesignSession` stores the chapter roles and `mfa`, with permissions from
>   `constant/roleMatrix.ts` (backend §6.3). Super admin bypasses checks. The starter session is unchanged.
> - **Rules:** `domain/rules/access.ts` holds `requiresTwoFactor`, `isAdminAudience` and `menuAudiencesFor`;
>   `features/auth/lib/resolveLanding.ts` holds `landingFor`. `TwoFactorRoute` sends two-step roles without `mfa` to
>   enrol.
> - **Header:** account links carry `audience` (signedOut, signedIn, nonMember, admin) in the nav data, and
>   PublicLayout filters them by role.
> - **Screens:** the six screens are CMS `form_block`s (`features/auth/components/AuthScreens.tsx` on the `AuthCard`
>   block). `/auth/sign-in/link?token=` consumes the link and shows check_email's "Link expired?" card on failure.
> - **Demo role switcher:** `DemoRoleSwitcher` in RootLayout, shown while the data is mock. `?demo=off` hides it.

### 7.1 Shared, typed field schemas

- **The contract is JSON Schema** for every section type and collection schema, as served by
  `GET /content/schemas` (BE §3.1).
- The frontend keeps a committed copy at `src/features/content/schemas/content-schemas.json`.
  `npm run gen:content` (`src/scripts/gen-content-types.ts`, using the existing `ts-node`; no new dependency)
  generates `section-types.gen.ts` from it:
  - TS types such as `SectionFields<'hero_slider'>` and `ItemFields<'hero_slider'>`
  - Zod schemas
  - the `SectionType` union
- The generator supports only the subset the registry uses: `text`, `rich_text`, `link`, `media`, `media_list`,
  `number`, `boolean`, `enum`, `list<object>` and `collection_ref`. Translatable fields arrive as `LocalizedValue`.
- **Order of work.** Frontend Step 5 runs before backend Step 8. So in Step 5 the frontend **authors**
  `content-schemas.json` from the snapshots, together with fixtures. Backend Step 8 then implements its Joi
  registry so that `GET /content/schemas` returns the identical JSON. Both repos run a contract test on every
  build: the backend checks that its export equals the committed file, and the frontend checks that the generated
  types are up to date.

### 7.2 Section registry

```ts
// src/features/content/lib/sectionRegistry.ts
type SectionComponent<T extends SectionType> = (p: { section: CmsSection<T>; page: CmsPageMeta }) => ReactNode;
export const sectionRegistry: { [T in SectionType]: { component: SectionComponent<T>; schema: ZodType<SectionFields<T>> } } = {
  hero_slider:     { component: HeroSliderSection,     schema: heroSliderSchema },
  section_heading: { component: SectionHeadingSection, schema: sectionHeadingSchema },
  card_grid:       { component: IxCardGridSection,     schema: cardGridSchema },     // items, or settings.source = { collection, filter, limit }
  event_slider:    { component: EventSliderSection,    schema: eventSliderSchema },  // fetches C:events + availability
  campaign_cards:  { component: CampaignCardsSection,  schema: campaignCardsSchema },// merges C:campaign_display + M campaigns
  form_block:      { component: FormBlockSection,      schema: formBlockSchema },    // settings.form_key → formRegistry
  // … one entry per section type in §3.3 (about_block, services_slider, logo_strip, counter_band, text_marquee,
  //   cta_volunteer, testimonials, people, faq, news_list, news_detail, video_donate, donor_list, photo_gallery,
  //   video_gallery, contact_info, decision_table, flow_steps, map_hub_panel, roadmap, charter, legal_text, band, rich_text …)
};
```

- The mapped type means a section component **can't** receive the wrong fields. A missing registry entry is a
  compile error.
- `*Section` components live in `features/content/components/sections/`. Each one adapts the section's fields to
  the design component in `components/design/blocks`.
- **Data-bound sections** fetch their collection themselves through `useCollection(settings.source)`, so the page
  makes no extra calls for sections the CMS has hidden.
- `formRegistry` maps `form_key` to an interactive feature component, such as `join → JoinWizard`, `donate →
  DonateForm`, `volunteer → RoleBrowser`, `contact → ContactForm`, `rsvp → RsvpForm` or `newsletter →
  NewsletterForm`. Those forms take their labels and messages from UiStrings and section fields, never from literals.

### 7.3 `<CmsPage>`

```tsx
<CmsPage pageKey="about" />                                      // most public pages are exactly this
<CmsPage pageKey="event_detail" entry={{ collection: 'events', slug }} />  // template pages for collection details
<CmsPage source={{ previewToken }} />                            // admin_preview (84)
```

1. It calls `useCmsPage(pageKey, locale)` (or `usePreview(token)`), which returns
   `{ page, sections, alternates, seo }`.
2. It renders `<SeoHead seo alternates/>` (§8.5). The page's `breadcrumb_banner` fields (title, trail and the
   optional CMS background) are rendered by `PublicLayout` from the same page query (Step 4, §4.1), not by `CmsPage`.
3. It renders `sections.filter(s => s.is_visible)` in order. Each section is validated with
   `registry[type].schema.safeParse(fields)`:
   - If validation fails, the section is skipped and a warning is logged in dev. In preview it shows a visible
     "invalid section" `ix_result ix_bad`.
   - An unknown `type` is treated the same way.
4. States: the first load shows `LoadingState` at the height of a page section. An error shows `ErrorState`, and a
   404 shows the design's NotFound page.
5. Rich text goes through `<RichText ast/>`, which renders the portable AST into the design's markup (`p`, `h2`,
   `h3`, `ul.ix_list`, `a.ix_link`, `strong`, `em`, `img.img-fluid`). There is **no `dangerouslySetInnerHTML`**.
   Images use `<CmsImage media/>`: `img-fluid`, `alt` from the media, `width` and `height`, `loading="lazy"`, and the
   focal point as `object-position` (a justified inline style, because the value is data).
6. **Fixtures.** `VITE_CONTENT_SOURCE=fixtures|api` selects `contentService`'s source. Fixtures in
   `features/content/fixtures/<pageKey>.en.json` match the API shape exactly (BE §8.4). Steps 5 and 6 use
   fixtures, and Step 13 switches the source to `api` with no component changes.

### 7.4 Composition of every public page

Each page component is `<CmsPage pageKey=…/>`. Interactive parts are `form_block` sections or data-bound sections.
Every page starts with its breadcrumb banner unless noted.

| Page | Sections in order (type → design component) |
|---|---|
| home | `hero_slider` · `category_carousel` · `about_block` · `card_grid` (purpose, dark variant) · `flow_steps` (campaign cycle) · `card_grid` (membership levels; amounts via `{{charter.*}}` tokens, links to `/join?level=`) · `band` (WAZI "Give, track and vote") · `video_donate` · `services_slider` (where we sit) · `logo_strip` · `campaign_cards` · `counter_band` · `event_slider` · `text_marquee` · `cta_volunteer` · `testimonials` · `people` (leadership) · `faq` · `news_list` (no breadcrumb) |
| about | `about_block` · `services_slider` · `counter_band` (portfolios) · `text_marquee` · `cta_volunteer` (sponsors) · `people` (leadership) · `faq` (committees variant) |
| committees · hubs | `card_grid` (source `C:committees` / `C:hubs`, expandable cards plus inline `form_block:committee_interest` / `form_block:hub_join`) |
| charter · privacy | `charter` (TOC + sections + version select) · `legal_text` |
| volunteers · testimonials · donors · gallery photos/videos · faq | `people` / `testimonials` / `donor_list` / `photo_gallery` / `video_gallery` / `faq` (paged collections) |
| contact | `contact_info` · `form_block:contact` |
| thanks pages (contact, donate, volunteer, newsletter confirmed/unsubscribed) | `rich_text` / `band` / `card_grid` (+ `form_block:newsletter_status` on unsubscribed) |
| our model | `flow_steps` · `card_grid` (levels) · `decision_table` · `card_grid` (facts) · `band` |
| join · donate · cancel gift · volunteer · share a story | `form_block:join` / `donate` / `cancel_gift` / `volunteer` / `share_story` plus their `card` and `note` side content |
| grants | `map_hub_panel` · `card_grid` (how grants are selected) · `flow_steps` (roadmap) · `card_grid` (portfolios) · `flow_steps` (process + rubric) · `card_grid` (proposals under review, source G `proposals/public`) · `roadmap` |
| campaigns · campaign detail · category | `campaign_cards` (active + history) · `campaign_detail` + `campaign_cards` (related) · `category_grid` |
| nonprofits | `flow_steps` · `form_block:eligibility` + `faq` |
| events · event detail | `event_grid` · `card_grid` (US hubs launch plan) · `event_detail` (+ `form_block:rsvp`) |
| news · news detail | `news_list` + `band` (share a story) · `news_detail` |
| auth screens (34–39) | `auth_card` with `form_block:sign_in` / `sign_up` / `forgot` / `check_email` / `two_step` / `two_step_setup` (copy from the CMS and UiStrings, image from the CMS) |

The **portal and admin** screens are not CMS pages. Their microcopy comes from UiStrings (namespaces `portal`,
`admin` and `cms`), and their data from the domain APIs.

### 7.5 The "no hard-coded content" check

`src/scripts/check-hardcoded-copy.ts` uses the TypeScript compiler API (already a dev dependency) and runs as
`npm run check:copy`. It fails when a file under `components/design/blocks`, `features/*/components`,
`pages/public` or `pages/auth` contains any of the following:

- JSX text with letters
- string literals in `alt`, `title`, `placeholder`, `aria-label` or `label`
- `<img src>` pointing outside `src/assets` or CMS media

Exceptions are listed in `src/scripts/copy-allowlist.json` (for example the `×` close glyph and the `•` editor
button). This is the CONTENT_AND_I18N §5 build gate.

---

## 8. i18n plan

### 8.1 Locale state

`i18n/LocaleProvider` (mounted in `AppProviders`) resolves the locale in the CONTENT_AND_I18N §3 order:

1. The URL prefix `/:lang` (public routes). `?lang=xx` is accepted on any route: public routes redirect to the
   prefixed URL, and other routes store it as the preference.
2. The signed-in user's saved preference (`users/me/settings.language`).
3. The `i18n_locale` cookie (`infrastructure/storage/locale.storage.ts`; 1 year, `SameSite=Lax`).
4. `navigator.languages`.
5. The default locale (`is_default` from `GET content/locales`, with a fixture fallback of `en`).

The result is checked against the **enabled** locales, and an unknown value falls back to the default.
`useLocale()` returns `{ locale, direction, locales, setLocale }`.

### 8.2 The switcher

The existing top-bar `LanguageSelect` (`language_currency > .nice-select.select_js`, same markup and styles) is the
only switcher. Its options are the enabled locales (FQ7 covers the label).

`setLocale(code)` does the following:

1. Navigates to **the same page** in the new locale with `localePath()`. That prefixes or un-prefixes the path, and
   for collection detail pages it uses the API's `alternates[]` so the slug is translated too.
2. Writes the cookie.
3. If the user is signed in, it PATCHes `users/me/settings { language }`.
4. Updates the `Accept-Language` header source.

Because every public-text query key includes the locale, React Query refetches automatically, and
`keepPreviousData` keeps the old text on screen until the new text arrives.

### 8.3 `<html lang dir>`

An effect in `LocaleProvider` sets `document.documentElement.lang` and `.dir` from `Locale.direction`. It runs on
every change, including the initial resolution, before the first content paint.

### 8.4 UiString lookup with fallback

`useT(namespace)` returns `t(key, vars?)`.

- Namespaces are `common`, `forms`, `states`, `errors`, `portal`, `admin` and `cms`. Each loads once per locale
  through `GET content/ui-strings?locale&namespace`, with `staleTime` 60 s.
- The server already applies the fallback chain and returns a `LocalizedValue` per key. As a client safety net, a
  key missing from the locale bundle is looked up in the default-locale bundle. If it is still missing, the key
  itself renders and a dev warning is logged once.
- Interpolation uses `{name}`. Plurals use `key.one`/`key.other` selected with `Intl.PluralRules`.
- Formatting: `formatMoney(cents)` (`Intl.NumberFormat(locale, { style:'currency', currency:'USD' })`),
  `formatDate` and `formatNumber`. These are **never** hand-concatenated.
- In preview and the CMS studio, fallback values can be highlighted with a `data-fallback` attribute, so editors
  see missing translations. The public site never shows the marker.

### 8.5 `hreflang` and SEO

`<SeoHead>` uses React 19's built-in hoisting of `<title>`, `<meta>` and `<link>` (no helmet library). It renders:

- the title, description and Open Graph tags from page SEO fields
- `<link rel="alternate" hreflang="xx" href>` for every enabled locale's URL, plus `x-default`
- `<link rel="canonical">`

### 8.6 RTL readiness

- `dir` is set from the locale.
- Design components use no inline `left`/`right` and no hard-coded direction. Direction-sensitive icons (the
  `common_btn` arrow, breadcrumb chevrons) get a `[dir="rtl"]` flip rule in `app.css`.
- **The design CSS (Bootstrap 5 LTR plus the theme) is LTR-only.** Shipping an RTL locale needs an RTL build of
  the design CSS, either Bootstrap's `rtl` variant or an `rtlcss` transform at build time (a dependency, §9). We do
  that **only when an RTL locale is enabled** (backend Q1).
- **Font coverage.** Nunito and Nunito Sans have no glyphs for the **Ethiopic** script, which Amharic uses, and
  cover none of Arabic, CJK or similar. A non-Latin locale therefore needs a script-specific fallback font in the
  `--headingFont`/`--paraFont` stacks (FQ2).

---

## 9. Packages

**Nothing is required for the product features.** Sliders, the map, modals, the lightbox, count-ups, metadata
(React 19), the editor toolbar, bar charts and the funnel are all built from the design CSS plus small hooks. No
package is installed by this document.

| Package | Kind | Why | Recommendation |
|---|---|---|---|
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y` | dev | `npm run lint` is **broken today** (there is no ESLint dependency and no config), yet CLAUDE.md requires lint before "done". `jsx-a11y` enforces the accessibility rules (labels, alt text, roles). | **Needed.** Please approve. |
| `@playwright/test` (+ `@axe-core/playwright`) | dev | Automates the CLAUDE.md workflow: screenshots compared with `snapshots/*.html` at 1440, 1024, 768 and 390 px, the §1.4 "starter doesn't change" diff, and accessibility checks for Step 17. | **Strongly recommended.** Without it these checks are manual. |
| `vitest`, `@testing-library/react`, `jsdom` | dev | Unit tests for locale resolution and `localePath`, the section registry and schema validation, `classes.ts`, and the COI and vote dialog logic. | Recommended from Step 5 (optional) |
| `@tanstack/react-query-devtools` | dev | Inspecting cache keys and locale keys | Optional |
| `rtlcss` / `postcss-rtlcss` | dev | An RTL build of the design CSS | **Only if** an RTL locale is chosen |
| Font files | n/a | Self-hosted woff2 (F4), no npm package | Download once into `src/assets/fonts` |

**Deliberately not added:**

- **react-helmet:** React 19 metadata covers it.
- **swiper, slick, embla:** the design's slider logic is reproduced in about 100 lines.
- **i18next / react-intl:** UiStrings with API-side fallback plus `Intl` are enough, and a second fallback engine
  would drift.
- **tiptap, quill:** the design's editor is a toolbar over a `textarea` (markdown-lite converted to the AST on save).
- **Chart libraries:** the `ix_bar` rows and the funnel are CSS.
- **Map libraries:** the map is the inline SVG.
- **A Bootstrap JS bundle:** the collapse, accordion and tab behaviours are React state.

---

## 10. Open questions and build order

### 10.1 Design questions still open (each has a working default)

| # | Question | Default |
|---|---|---|
| FQ1 | **Design-review toggles.** portal_decisions has "View as voting member / View as $250 member", and portal_sign has "Your status / Preview when unlocked". They let reviewers see both states. Should they be removed in the product? | Not rendered. The state comes from the API. |
| FQ2 | **Fonts for non-Latin locales.** Nunito has no Ethiopic (Amharic) glyphs. Which fallback (for example Noto Sans Ethiopic) is allowed under "no new fonts"? | Decide when backend Q1 (launch languages) is answered |
| FQ3 | **Donate deep link.** ROUTES says `?fund=`, but the `.dc` page reads `#area=`. | `?fund=` is canonical, and `area` is accepted as an alias |
| FQ4 | **Event detail route.** `/events/:id` (ROUTES) versus per-locale slugs (CONTENT_AND_I18N). | `/events/:slug`, with the legacy `#e=n` resolved to a slug |
| FQ5 | **Sign-up and forgot-password** screens show password fields, but sign-in is passwordless (backend D1/Q18). | **Decided in FE-7:** same layout, no password fields and no Google button. Sign-up = name and email, then a login link; forgot password = email, then a login link. |
| FQ6 | **Hub links** use display names (`#hub=Southeast`), and the hub lists differ between the hubs and events pages (backend Q13). | Keys from `C:hubs`, with names mapped to keys for legacy links |
| FQ7 | **Language select labels:** English names ("English", "Amharic") as in the design, or native names ("አማርኛ")? | Native name, which is identical for English |
| FQ8 | **Template sample copy** in the snapshots: lorem ipsum (event and news detail, testimonials, FAQ), "Our Customer Reviews", "Traveler", the "29M supporters / $60000+" footer counters and the category names. | Seeded verbatim as English CMS content (the design rule) and flagged to the client for real copy |
| FQ9 | **Receipt route.** ROUTES uses `/portal/vote/receipt/:ballotId`, but a receipt belongs to one ballot *item* participation, and the code can only be shown once. | `/portal/vote/receipt/:participationId`, with the code passed in router state |

### 10.2 Build order (IMPLEMENTATION_PLAN steps)

| Step | What, from this document |
|---|---|
| 0 | Unzip `design-reference.zip` into `design-reference/`. Approve the dev packages in §9. |
| **3** | §1 in full (assets copy, fonts, CSS order, the Tailwind scope, `tw-scope`, `tw-compat`, `check:css`, the before/after starter screenshots). `components/design/primitives`, `states`, `lib/classes.ts`, the `/design` route matching the Components and Main snapshots. |
| **4** | `PublicHeader`, `MegaMenu`, `LanguageSelect`, `Footer`, `BreadcrumbBanner`, `ScrollProgressButton`, `AppShell` with `portalMenu`/`adminMenu`, the layouts and guards, `LocaleProvider` (URL prefix, cookie, `html lang/dir`), every route in §4 stubbed, and `useLegacyHashParams`. |
| **5** | `content-schemas.json` authored, `gen:content`, `sectionRegistry`, `CmsPage`, `RichText`, `CmsImage`, `SeoHead`, the fixtures for every public page (English), the static blocks of §3.3, and `check:copy`. |
| **6** | The interactive blocks and forms (map, join, donate, volunteer, contact, events/RSVP, news, hubs, committees, nonprofits), `useSlider`, `useSearchParamState`, the per-screen mapping in §5.2. |
| 13 | `VITE_CONTENT_SOURCE=api`, the language switcher live, real form submissions, and the §8 fallback checks. |
| 14 | Login link, SSO, 2FA enrol and challenge, refresh single-flight, `resolveLanding`. |
| 15 | Portal screens 40–55 on the real APIs (eligibility from the API only). |
| 16 | Admin console 56–88 and the CMS studio (field editors generated from the same schemas, translations side by side, media, versions and diff, preview, locales, UI strings, nav). |

