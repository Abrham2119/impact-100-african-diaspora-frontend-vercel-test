# Impact 100 African Diaspora: design reference

The approved UI for the whole product: the public website, the member portal and the admin console. It was exported from the design canvas on 20 Nov 2026.

**This folder is the source of truth for the UI.** Build the React app so that each screen looks and behaves exactly like these files. Do not redesign anything, restyle it, rewrite the copy or swap the images.

## What is in this folder

| Path | What it is | How to use it |
|---|---|---|
| `snapshots/*.html` | Static, fully rendered HTML for every screen. Scripts are removed and it works offline. | **Visual target.** Serve the folder (`python3 -m http.server 4000 -d design-reference`) and open http://localhost:4000/snapshots/index.html. Links between snapshots work. Compare your React page against these, using screenshots at 1440, 1024, 768 and 390 px. |
| `pages/*.dc.html` | The design source for each screen. It contains the markup with `{{ holes }}`, `<sc-for>` (loops) and `<sc-if>` (conditions), plus a `<script type="text/x-dc">` class whose `state` and `renderVals()` define the interactivity. | **Behaviour target.** Read it to understand the state, the derived values, validation, tabs, steps, filters and hash deep links. Turn each `renderVals()` value into React state, derived values or handlers. |
| `assets/css/impact100.css` | The main site theme: the original template plus Bootstrap utilities. | Import it globally and unchanged. Do not convert it to Tailwind. |
| `assets/css/icons.css` | The icon font (Font Awesome style, with fonts embedded). | Import it globally. Use the same `<i class="far fa-…">` markup. |
| `assets/css/impact100-ext.css` | The project extension layer, `ix_*` classes. It covers the header mega-menu, map, cards, badges, tables, forms, the portal cards and the dashboard app shell. | Import it after `impact100.css`. It is the single source for every `ix_*` component. |
| `assets/images/*` | Every image the design uses: photos, logos, icons and backgrounds. | Copy them to `src/assets/images/`. Never replace them with stock images. |
| `assets/blob-map.json` | Maps the canvas asset id to the local file. | For traceability only. |
| `ROUTES.md` | Every screen, its React route, its layout and its module. | Build the router from it. |
| `DESIGN_SYSTEM.md` | Tokens, typography, components and patterns. | Read it before building components. |
| `BUSINESS_RULES.md` | Membership, payment, voting, charter, campaign and donation rules. | Both frontend and backend must follow it. |
| `CONTENT_AND_I18N.md` | The CMS and multilingual content architecture. | Every public text, image, button, banner, gallery and video is admin-managed and translatable. Nothing public is hard-coded. |

## Four layouts

1. **PublicLayout:** the top info bar, the main header with mega-menus (About two-column, Opportunities, Grants, Events, News), the breadcrumb banner, the page content and the footer, including the newsletter sign-up. Used by the website pages.
2. **AuthLayout:** sign in, sign up, forgot password, check your email and two-step verification.
3. **PortalShell (member portal):** a navy top bar (logo, campaign pill, Donate, bell, avatar), then a left icon rail (Dashboard, Voting, Charter, Reviews, Account, Website). Next to the rail is a section sidebar that lists only the active rail group's pages, with no chevrons. The main area shows the breadcrumb, an `h1` title and the page content.
4. **AdminShell (admin console):** the same shell. The rail holds Dashboard, People, Rules, Payments, Governance, Engage, Content, System, Website and Portal. The section sidebar lists the active group's pages.

The header, footer, rail and sidebars must be **one shared component each**, driven by typed config arrays (`navConfig`, `portalMenu`, `adminMenu`). Copy the items and labels from the snapshots.

## How the `.dc.html` format maps to React

- `{{ name }}` is a value returned by `renderVals()`. In React it is state, derived data or a handler.
- `<sc-for list="{{items}}" as="x">…</sc-for>` becomes `items.map(x => …)`.
- `<sc-if value="{{cond}}">…</sc-if>` becomes `{cond && …}`.
- `class="{{xCls}}"` is computed class names. Keep the exact class strings, for example `'ix_chip' + (on ? ' ix_on' : '')`.
- `onClick="{{pick_x}}"` and `onChange="{{setX}}"` become event handlers.
- `location.hash` deep links (for example `#e=3`, `#topic=partner`, `#level=investor`, `#hub=…`, `#fund=…`, `#area=…`, `#c=…`) should become URL search params or route params with the same meaning.
- Sliders (hero, events, campaigns, testimonials) are implemented in the dc script with transforms. Reproduce the behaviour without adding a carousel library unless one is approved.

## Fixed decisions (do not change)

- **Colours and fonts:** primary orange `#F87022`, navy `#102A5E`, cream background `#FAF7F1`, green `#2A8A1C`. Headings use Nunito and body text uses Nunito Sans.
- **Africa map:** the inline SVG on `grants` (Natural Earth 1:50m). Every Sub-Saharan country is a selectable USAFI hub, including **Sudan** and **Somaliland** (Somaliland is its own country, separate from Somalia). The country list and the map stay in sync.
- **Campaigns:** each runs six months (Oct 1 to Mar 31). The goal is always $100,000. Only one campaign is active at a time, and ended campaigns move to history automatically. Every campaign uses the same card design.
- **Membership vs donation:** membership is bought or renewed per campaign. Donations are separate: the donor type is "Direct donor", and the donor picks one of the 4 USAFI portfolios as the area of interest plus any Sub-Saharan country. Donations never count toward membership.
- **Copy:** the text in the snapshots is the client's approved copy. Content marked as a sample (see the list below) must come from the CMS or API and must never be invented.

## Content source

All public content, not only the sample content below, is CMS-managed and multilingual. See `CONTENT_AND_I18N.md`. The snapshot copy is the English seed.

## Sample content that must come from the CMS or API

- News stories and events: real sample data for now, but it must be editable.
- Proposals, members, figures and ledger rows in the portal and admin.
- The demo contact details in the top bar and footer.
- Leadership photos: stock placeholders until real photos are supplied.
- The names of the 19 volunteer roles, the fifth US hub's name, and the charter versions (only "Discussion draft · Sept 2026" is real).
