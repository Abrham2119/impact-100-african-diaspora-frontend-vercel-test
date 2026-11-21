# Content management and multilingual support (required)

**Goal:** every public-facing piece of content is managed from the admin dashboard, in every language, without code changes. The UI and design stay exactly as they are in `design-reference/`. Only the *source* of the content changes.

## 1. What must be manageable (nothing public is hard-coded)

On every public page in `ROUTES.md` (Public layout), the following comes from the CMS:

- **Text:** headings, kickers (the small orange labels), paragraphs, lists, FAQs, table rows, legal text (privacy, charter).
- **Buttons and links:** label, URL or route, style variant, visibility.
- **Images:** banners, hero slides, breadcrumb backgrounds, card images, logos, partner logos, leadership photos, icons, alt text.
- **Galleries:** photo albums and video galleries, with ordered items.
- **Inline videos:** a video URL or uploaded file, poster image, captions per language.
- **Repeating collections:** news, events, campaigns (display), hubs, committees, leadership, partners, sponsors, testimonials, volunteer roles, portfolios, values, nonprofit steps and FAQs, grant rubric and roadmap, charter versions and sections.
- **Global content:** navigation and mega-menus, footer columns, top-bar contact details, social links, newsletter text, SEO title, description and Open Graph image per page.
- **UI strings:** form labels, validation messages, empty, error and success states, and button texts used by components. They are kept as translatable keys and also editable in admin.

**Not CMS-managed:** layout, CSS, class names and component structure. Business rules (levels, quorum and so on) live in admin *settings* with their own validation, not as free text.

## 2. Content architecture: one page, many languages

Keep a single page and section tree, and translate the field values. **Never duplicate pages per language.**

```
Locale        (code 'en', name, nativeName, isDefault, isEnabled, direction ltr|rtl, fallbackCode, sortOrder)
Page          (id, key e.g. 'home', routePath, layout, status, publishedVersionId, seoImageMediaId)
Section       (id, pageId, type, sortOrder, isVisible, settings JSON)  -- type = a design block, e.g. 'hero_slider', 'section_heading',
                                                                          'flow_steps', 'faq', 'card_grid', 'event_slider', 'map_hub_panel'
SectionItem   (id, sectionId, sortOrder, isVisible, settings JSON)     -- repeating children: slides, steps, cards, FAQ entries
FieldValue    (id, ownerType page|section|item|collectionEntry, ownerId, fieldKey, locale, valueText | valueRich | valueJson)
Media         (id, kind image|video|file, storageKey, mimeType, width, height, durationSec, posterMediaId, checksum)
MediaVariant  (mediaId, locale nullable, ...)  -- a language-specific image or video (e.g. a banner with Amharic text); null = all languages
FieldMedia    (ownerType, ownerId, fieldKey, locale nullable, mediaId, altText per locale via FieldValue)
Collection    (key e.g. 'events', 'news', 'leadership')  + CollectionEntry (id, collectionKey, slug per locale, sortOrder, status, publishAt, data)
NavMenu / NavItem (with per-locale label FieldValues, link, sortOrder, parentId)
UiString      (key, locale, value)      -- component microcopy
ContentVersion(id, ownerType, ownerId, snapshot JSON, createdBy, createdAt, note)   -- every publish = a version, restorable
```

- **Section types map 1:1 to design components.** Each type has a typed schema of fields (text, rich text, link, image, video, list) shared between backend validation (Joi) and the frontend (TypeScript + Zod). The component renders exactly the design markup and fills it from the fields.
- **Translations:** each translatable field stores one `FieldValue` per locale. Non-translatable fields (numbers, toggles, URLs that are the same in every language) use `locale = null`.
- **Language-specific media:** `FieldMedia.locale` is nullable. A null row is the default asset. A locale row overrides it for that language. Video captions or subtitles are stored per locale.
- **Slugs:** news, events and campaign details have a slug per locale, and old slugs redirect.

## 3. Language resolution and fallback

- **Request locale order:** URL prefix (`/am/...`, optional and configurable) or the `?lang=` param, then the saved user preference, then a cookie, then `Accept-Language`, then the default locale.
- **Field fallback:** requested locale, then that locale's `fallbackCode`, then the default locale. The API returns the resolved value plus `resolvedLocale` and `isFallback`, so admin can show "missing translation".
- **Public API:** `GET /api/v1/content/pages/:key?locale=xx` returns the published page tree with resolved fields and media URLs, cached by `(pageKey, locale, version)`. Publishing invalidates the cache.
- **Frontend:** the language switcher is the existing top-bar language select in the header (same markup and style). Switching re-queries content (the React Query key includes the locale), updates `<html lang dir>`, and keeps the user on the same page. `hreflang` links go in the head.
- **Enabled languages are configured in admin** (Locales screen). English is the default. Ask the client which other languages to launch with. The template's sample list (Japanese, Korean, Chinese, Urdu) is **not** a decision.

## 4. Admin dashboard capabilities (CMS studio, `admin_cms` + `admin_preview`)

- Browse pages, then sections, then items, in the same order as the live page.
- **Add, edit, duplicate, hide/show, delete** sections and items (only of the types allowed on that page). Reorder with drag handles and keyboard up/down. Use no new library unless approved.
- **Side-by-side translation editing:** default locale on the left, target locale on the right, with a missing or outdated indicator per field and a per-page translation progress bar. Includes "copy from default" for a field.
- **Media library:** upload, replace, crop focal point, alt text per locale, language-specific variant, video upload or URL with a poster, usage list ("used on …").
- **Workflow:** draft, then in review, then published. Includes scheduled publish, preview links per locale (`admin_preview`), version history with diff and restore, and an audit log entry per change.
- **Permissions:**
  - Editor edits drafts.
  - Chapter admin publishes.
  - Translator edits only translations, if the role is enabled.
- Collections (events, news and the rest) have list screens with filters, a status column and a locale coverage column.

## 5. Migration of current content

- Seed the CMS with **all** copy, images and videos currently in `design-reference/snapshots/*.html`, in English, so the rendered pages are identical before and after.
- A check script or test fails the build if a public page component contains user-facing literal text that should come from the CMS. Allowed exceptions are listed in one file.

## 6. Done criteria

- Every public route renders only from CMS data plus UiStrings, and is visually identical to its snapshot in the default locale.
- Switching language changes all content and microcopy. Missing translations fall back without broken layouts.
- An admin can change a heading, replace a banner, reorder slides, add a gallery video, translate a page and publish, all with no deploy.
