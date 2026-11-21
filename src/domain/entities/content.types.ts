// Framework-free domain types of CMS content (ARCHITECTURE.md §6.3), produced from the API
// DTOs (src/types/content.dto.ts) by features/content/lib/mappers.ts. Translatable values
// arrive resolved to plain strings; which ones fell back to another locale is kept in
// `fallbackFields` so preview/studio can highlight them.
import type { RichText } from '@/types/content.dto';

export type { RichText, RichBlock, RichInline } from '@/types/content.dto';

export interface CmsMedia {
  id: string;
  kind: 'IMAGE' | 'VIDEO' | 'FILE';
  url: string;
  externalUrl: string | null;
  width: number | null;
  height: number | null;
  focal: { x: number; y: number } | null;
  alt: string;
  posterUrl: string | null;
}

export type CmsButtonVariant = 'default' | 'dark' | 'ghost' | 'ghost_light';

export interface CmsLink {
  label: string;
  href: string;
  external: boolean;
  variant: CmsButtonVariant;
}

export type CmsFieldValue = string | RichText | CmsLink | CmsLink[];
export type CmsSettingValue = string | number | boolean | null | CmsSettingValue[] | { [key: string]: CmsSettingValue };

/** Untyped node of the page tree; sections are validated into typed shapes by the registry. */
export interface CmsNode {
  id: string;
  type: string | null;
  settings: Record<string, CmsSettingValue>;
  fields: Record<string, CmsFieldValue>;
  media: Record<string, CmsMedia | CmsMedia[]>;
  items: CmsNode[];
  fallbackFields: string[];
}

export interface CmsSectionNode extends CmsNode {
  type: string;
  key: string | null;
}

export interface CmsSeo {
  title: string | null;
  description: string | null;
  image: CmsMedia | null;
}

export interface CmsPageTree {
  key: string;
  direction: 'ltr' | 'rtl';
  seo: CmsSeo;
  alternates: Array<{ locale: string; path: string }>;
  sections: CmsSectionNode[];
}

/** A collection entry (news, events, committees …). */
export interface CmsEntry {
  key: string;
  slug: string | null;
  fields: Record<string, CmsFieldValue>;
  media: Record<string, CmsMedia | CmsMedia[]>;
  data: Record<string, CmsSettingValue>;
  items: CmsNode[];
}

export interface CmsCollectionPage {
  entries: CmsEntry[];
  page: number;
  totalPages: number;
  total: number;
}

/** CMS page keys of the public site and the auth screens (ARCHITECTURE.md §4, backend §4.5). */
export type CmsPageKey =
  | 'home'
  | 'about'
  | 'committees'
  | 'charter'
  | 'volunteers'
  | 'testimonials'
  | 'donors'
  | 'gallery_photos'
  | 'gallery_videos'
  | 'faq'
  | 'contact'
  | 'contact_thanks'
  | 'privacy'
  | 'newsletter_confirmed'
  | 'newsletter_unsubscribed'
  | 'our_model'
  | 'join'
  | 'donate'
  | 'donate_thanks'
  | 'donate_cancel'
  | 'volunteer'
  | 'volunteer_thanks'
  | 'grants'
  | 'campaigns'
  | 'campaign_detail'
  | 'campaign_category'
  | 'nonprofits'
  | 'events'
  | 'event_detail'
  | 'hubs'
  | 'news'
  | 'news_detail'
  | 'share_story'
  | 'auth_sign_in'
  | 'auth_sign_up'
  | 'auth_forgot'
  | 'auth_check_email'
  | 'auth_two_step'
  | 'auth_two_step_setup';

/** Query of a collection read (`GET content/collections/:key/entries`). */
export interface CmsCollectionQuery {
  collection: string;
  page?: number;
  limit?: number;
  /** explicit entries, in this order */
  keys?: string[];
  /** equality filter on `data` fields */
  filter?: Record<string, string>;
  /** full-text search (`q`) over the entry's text fields */
  q?: string;
}

/** The page banner, read from the page's `breadcrumb_banner` section. */
export interface CmsBanner {
  title: string;
  trail: CmsLink[];
  background: CmsMedia | null;
}
