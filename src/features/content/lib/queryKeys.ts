import type { CmsCollectionQuery, CmsPageKey } from '@/domain/entities/content.types';
import type { UiNamespace } from '../fixtures/en/ui';

// React Query keys for public content (ARCHITECTURE.md §6.4). Every key that returns
// public text includes the locale, so a language switch refetches automatically.
export const contentKeys = {
  all: ['content'] as const,
  locales: () => ['content', 'locales'] as const,
  chrome: (locale: string) => ['content', 'chrome', locale] as const,
  page: (key: CmsPageKey, locale: string) => ['content', 'page', key, locale] as const,
  collection: (query: CmsCollectionQuery, locale: string) => ['content', 'collection', query.collection, locale, query] as const,
  ui: (locale: string, namespace: UiNamespace) => ['content', 'ui', locale, namespace] as const,
};

/** CMS content and UI strings: 60 s, matching the server cache (§6.4). */
export const CONTENT_STALE_TIME = 60_000;
/** Locales change rarely: 5 min. */
export const LOCALES_STALE_TIME = 300_000;
