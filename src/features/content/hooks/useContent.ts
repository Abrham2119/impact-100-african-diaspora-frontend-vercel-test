import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CmsBanner, CmsCollectionQuery, CmsPageKey, CmsPageTree } from '@/domain/entities/content.types';
import { contentService } from '../api/contentService';
import { CONTENT_STALE_TIME, LOCALES_STALE_TIME, contentKeys } from '../lib/queryKeys';
import { readBanner } from '../lib/banner';
import type { UiNamespace } from '../fixtures/en/ui';

// Public content hooks. Locale is an explicit argument so the query key always carries it;
// `keepPreviousData` keeps the old language on screen until the new one arrives (§8.2).

export function useLocales() {
  return useQuery({
    queryKey: contentKeys.locales(),
    queryFn: contentService.locales,
    initialData: contentService.seed.locales,
    staleTime: LOCALES_STALE_TIME,
  });
}

export function usePublicChrome(locale: string) {
  return useQuery({
    queryKey: contentKeys.chrome(locale),
    queryFn: () => contentService.chrome(locale),
    initialData: () => contentService.seed.chrome(locale),
    placeholderData: keepPreviousData,
    staleTime: CONTENT_STALE_TIME,
  });
}

function pageQuery<T>(key: CmsPageKey | undefined, locale: string, select: (page: CmsPageTree | null) => T) {
  return {
    queryKey: contentKeys.page(key ?? 'home', locale),
    queryFn: () => contentService.page(key ?? 'home', locale),
    initialData: () => (key ? contentService.seed.page(key, locale) : undefined),
    enabled: key !== undefined,
    placeholderData: keepPreviousData,
    staleTime: CONTENT_STALE_TIME,
    select,
  };
}

const identity = (page: CmsPageTree | null) => page;

/** A CMS page tree (`null` = the page does not exist). */
export function useCmsPage(key: CmsPageKey, locale: string) {
  return useQuery(pageQuery(key, locale, identity));
}

/**
 * The breadcrumb banner of a CMS page, read from the same page query as <CmsPage> (one request).
 * Disabled for routes without a page key.
 */
export function usePageBanner(key: CmsPageKey | undefined, locale: string) {
  return useQuery(pageQuery<CmsBanner | null>(key, locale, readBanner));
}

/** A page of a CMS collection (`GET content/collections/:key/entries`). */
export function useCollection(query: CmsCollectionQuery, locale: string) {
  return useQuery({
    queryKey: contentKeys.collection(query, locale),
    queryFn: () => contentService.collection(query, locale),
    initialData: () => contentService.seed.collection(query, locale),
    placeholderData: keepPreviousData,
    staleTime: CONTENT_STALE_TIME,
  });
}

export function useUiStrings(namespace: UiNamespace, locale: string) {
  return useQuery({
    queryKey: contentKeys.ui(locale, namespace),
    queryFn: () => contentService.uiStrings(namespace, locale),
    initialData: () => contentService.seed.uiStrings(namespace, locale),
    placeholderData: keepPreviousData,
    staleTime: CONTENT_STALE_TIME,
  });
}
