// Wire shapes of the public content API (backend docs/ARCHITECTURE.md §4.5, §8.4).
// Fixtures under src/features/content/fixtures/<locale>/ are typed against these, so the
// fixture source and the real API are interchangeable inside contentService.
// snake_case on purpose: these are the JSON payloads, mapped to camelCase domain types in
// features/content/lib/mappers.ts.

/** A translatable value after the server applied the fallback chain (§8.2). */
export interface LocalizedValue<T = string> {
  value: T;
  resolved_locale: string;
  is_fallback: boolean;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// ---- rich text: the portable AST (never HTML) -------------------------------------------
export type RichInline =
  | { type: 'text'; text: string; marks?: Array<'strong' | 'em'> }
  | { type: 'link'; href: string; children: RichInline[] }
  | { type: 'break' };

export type RichBlock =
  | { type: 'paragraph'; children: RichInline[] }
  | { type: 'heading'; level: 3 | 4; children: RichInline[] }
  | { type: 'list'; ordered: boolean; items: RichInline[][] }
  | { type: 'table'; head: RichInline[][]; rows: RichInline[][][] }
  | { type: 'note'; children: RichInline[] };

export type RichText = RichBlock[];

/** A link field: label is translatable; href is an in-app route or an external URL. */
export interface LinkValueDto {
  label: string;
  href: string;
  external?: boolean;
  /** button style chosen by the editor (CONTENT_AND_I18N §1 "Buttons and links") */
  variant?: ButtonVariantDto;
}

export type ButtonVariantDto = 'default' | 'dark' | 'ghost' | 'ghost_light';

// ---- media --------------------------------------------------------------------------------
export interface MediaTrackDto {
  locale: string;
  kind: 'CAPTIONS' | 'SUBTITLES';
  url: string;
}

export interface MediaDto {
  id: string;
  kind: 'IMAGE' | 'VIDEO' | 'FILE';
  /** file URL (CDN / storage) — or, for an external video, its thumbnail */
  url: string;
  /** external video page (YouTube/Vimeo) when the media is not a stored file */
  external_url: string | null;
  width: number | null;
  height: number | null;
  focal: { x: number; y: number } | null;
  alt: LocalizedValue | null;
  poster: MediaDto | null;
  tracks: MediaTrackDto[];
  resolved_locale: string | null;
  is_fallback: boolean;
}

/** Translatable fields: text, rich text or link, each resolved for the requested locale. */
export type FieldValueDto =
  | LocalizedValue
  | LocalizedValue<RichText>
  | LocalizedValue<LinkValueDto>
  | LocalizedValue<LinkValueDto[]>;

export type FieldsDto = Record<string, FieldValueDto>;
export type MediaFieldsDto = Record<string, MediaDto | MediaDto[]>;
export type SettingsDto = Record<string, JsonValue>;

// ---- page tree ----------------------------------------------------------------------------
export interface SectionItemDto {
  id: string;
  /** item variant within the section type (SectionItem.type), e.g. 'level' */
  type: string | null;
  settings: SettingsDto;
  fields: FieldsDto;
  media: MediaFieldsDto;
  /** one nested level (e.g. columns → entries) */
  items: SectionItemDto[];
}

export interface SectionDto {
  id: string;
  /** stable anchor within the page, e.g. 'hero' */
  key: string | null;
  type: string;
  settings: SettingsDto;
  fields: FieldsDto;
  media: MediaFieldsDto;
  items: SectionItemDto[];
}

export interface PageSeoDto {
  title: LocalizedValue | null;
  description: LocalizedValue | null;
  image: MediaDto | null;
}

export interface PageTreeDto {
  page: {
    key: string;
    layout: 'PUBLIC' | 'AUTH' | 'GLOBAL';
    version_no: number;
    requested_locale: string;
    direction: 'ltr' | 'rtl';
    seo: PageSeoDto;
    alternates: Array<{ locale: string; path: string }>;
    sections: SectionDto[];
  };
  meta: { settings_version: string; fallback_fields: number };
}

// ---- collections --------------------------------------------------------------------------
export interface EntryCardDto {
  /** stable cross-service key, never localized */
  key: string;
  /** per-locale slug for routable collections, otherwise null */
  slug: string | null;
  fields: FieldsDto;
  media: MediaFieldsDto;
  /** non-translatable typed fields (dates, keys, amounts …) */
  data: Record<string, JsonValue>;
  /** structured children, e.g. the sections of a charter version */
  items?: SectionItemDto[];
}

/** `PaginatedResult<T>` of the backend envelope (backend ARCHITECTURE §0.3). */
export interface PaginatedDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ---- navigation ---------------------------------------------------------------------------
export interface NavItemDto {
  id: string;
  label: LocalizedValue;
  sublabel: LocalizedValue | null;
  link_type: 'ROUTE' | 'PAGE' | 'ENTRY' | 'EXTERNAL';
  href: string;
  /** icon, menu kind ('list' | 'mega' | 'mega_2'), variant, aria flags … */
  settings: SettingsDto;
  /** filled by the server from `settings.count_from` */
  count: number | null;
  children: NavItemDto[];
}

export interface NavTreeDto {
  key: string;
  items: NavItemDto[];
}

// ---- UI strings & locales ----------------------------------------------------------------
export type UiBundleDto = Record<string, LocalizedValue>;

export interface LocaleDto {
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_default: boolean;
  fallback_code: string | null;
}
