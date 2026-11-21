# Design system: Impact 100 African Diaspora

Port this **1:1**. Do not add new colours, fonts, radii or shadows. If you need a value, take it from the CSS variables below or from an existing class.

## Load order (global CSS)

1. Google Fonts: Nunito, Nunito Sans and Caveat. Copy the exact `<link>` from `pages/index.dc.html`.
2. `assets/css/impact100.css`: the template theme plus Bootstrap 5 grid and utilities (`container`, `row`, `col-*`, `d-flex`, `mt_*` spacing helpers…).
3. `assets/css/icons.css`: the icon font (`far fa-*` / `fas fa-*`).
4. `assets/css/impact100-ext.css`: the `ix_*` extension layer. It must load last.

> Tailwind is already in the starter. Its **preflight reset changes the template's base styles**, so the public site, portal and admin must render with these CSS files exactly as in the snapshots. Recommended: set `corePlugins.preflight = false` and use Tailwind only for starter screens that are not part of the design. Confirm this in ARCHITECTURE.md.

## Tokens (CSS variables, already defined in the CSS)

| Token | Value | Use |
|---|---|---|
| `--colorPrimary` | `#F87022` | Orange: primary accent, kickers, active states, CTA "Become a member" |
| `--colorBlack` | `#102A5E` | Navy: headings, dark buttons (`.common_btn` default), top bar, app shell |
| `--colorWhite` | `#ffffff` | Cards |
| page background | `#FAF7F1` | Cream |
| `--brandGreen` / `--ixGreen` | `#2A8A1C` | Success, voting eligible, event card overlay |
| `--brandGold` | `#F8B654` | Accent |
| `--brandBlue` | `#0A4AA0` | Accent |
| `--ixLine` | `#ECE6DA` | Borders and dividers |
| `--ixSoft` | `#F3EEE4` | Soft panels, active menu background |
| `--ixMuted` | `#6b7280` | Muted text |
| `--ixRed` | `#B81A1A` | Errors |
| `--headingFont` | Nunito | Headings |
| `--paraFont` | Nunito Sans | Body |
| `--cursiveFont` | Caveat | Decorative only |
| breakpoints | 576 / 768 / 992 / 1200 / 1400 | Bootstrap |

## Core components (class names to reuse in JSX)

- **Buttons:** `.common_btn` (navy pill with an arrow icon), plus modifiers `.ix_btn_sm`, `.ix_btn_dark`, `.ix_btn_ghost` and `.ix_btn_acc`.
- **Section heading:** `.section_heading > h5` (orange kicker with bars) and `h2`, with `.ix_lead` for the intro paragraph.
- **Cards:** `.ix_card` (white, rounded, `ix_card_foot`), `.ix_card_dark`, `.ix_kicker`, `.ix_note`.
- **Badges and chips:** `.ix_badge` with `ix_b_ok`, `ix_b_warn`, `ix_b_info`, `ix_b_accent` and `ix_b_bad`. Chips are `.ix_chips > .ix_chip(.ix_on)`.
- **Result and feedback boxes:** `.ix_result` with `ix_ok`, `ix_wait` and `ix_bad`. Field errors use `.ix_err` with `role="alert"`.
- **Forms:** `.contact_input` (label plus input/select/textarea), `.ix_select`, `.ix_toggle_row`.
- **Flows and timelines:** `.ix_flow` (numbered step cards, with `.ix_num`), `.ix_flow_2`, `.ix_timeline`.
- **Tables:** `.ix_table`, with compact pill actions in admin tables.
- **Template blocks:** `.wssus__event_item` (photo event card with a green brush overlay), `.single_blog`, campaign cards, `.service_item`, the accordion (`.faq_text .accordion`) and the breadcrumb banner.
- **Map:** `.ix_map`, `.ix_country` (hub colour `#9aa9c6`, hover navy, selected orange), `.ix_hub_panel`, `.ix_hp_row` (proposal and volunteer rows).
- **Portal cards:** `.ix_mcard` (membership "credit card"), `.ix_pay_card` (fixed height 290 px; the result overlays without resizing), `.ix_scards` (4 gradient status cards).
- **App shell:** `.ix_top*`, `.ix_app`, `.ix_rail*`, `.ix_side*`, `.ix_app_main`, `.ix_crumbs` and `.ix_app_title` (weight 500).
- **Charter:** `.ix_toc` (sticky section menu) and `.ix_charter_sec`.
- **Mega menu:** `.ix_mega` and `.ix_mega_2` (two columns with `.ix_mi` icons). Only the hovered item and the active item are orange.

## Rules

- Keep the exact class strings from the design. Map them to small React components (`<Button variant>`, `<SectionHeading>`, `<Card>`, `<Badge kind>`, `<Chip on>`, `<ResultBox kind>`), but **the rendered HTML and classes must match the snapshot**.
- Every list page gets loading, empty and error states, built only from these components.
- Accessibility: keep the `aria-*` attributes from the design (`aria-pressed`, `aria-current`, `aria-expanded`, `role="alert"`). Add labels and alt text.
- Responsive: check at 390, 768, 1024 and 1440 px against the snapshots.
