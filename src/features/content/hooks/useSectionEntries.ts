import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { CmsCollectionQuery } from '@/domain/entities/content.types';
import { usePageParam } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import type { CollectionType, EntryDef, EntryOf } from '../schemas/defineSection';
import type { CollectionSource } from '../schemas/fields';
import { useCollection } from './useContent';

// The collection a section is bound to (its `source` setting), validated against the collection's
// declared schema (schemas/sectionTypes.ts). Invalid entries are skipped with one dev warning, the
// same rule CmsPage applies to sections. Paginated sources read `?page=` from the URL; a source
// that is neither paginated nor limited shows the whole collection (up to the API's max page size).

/** backend §0.3: `limit` default 10, max 100 */
const MAX_PAGE_SIZE = 100;

export function useSectionEntries<K extends string, D extends EntryDef>(type: CollectionType<K, D>, source: CollectionSource, q?: string) {
  const { locale } = useLocale();
  const urlPage = usePageParam();
  const page = source.paginate ? urlPage : 1;

  const query = useMemo<CmsCollectionQuery>(
    () => ({
      collection: source.collection,
      limit: source.limit ?? (source.paginate || source.keys ? undefined : MAX_PAGE_SIZE),
      keys: source.keys,
      filter: source.filter,
      page,
      ...(q ? { q } : {}),
    }),
    [source.collection, source.limit, source.keys, source.filter, page, q],
  );
  const result = useCollection(query, locale);

  const entries = useMemo<Array<EntryOf<D>>>(() => {
    const valid: Array<EntryOf<D>> = [];
    for (const entry of result.data?.entries ?? []) {
      const parsed = type.schema.safeParse(entry);
      if (parsed.success) valid.push(parsed.data);
      else if (import.meta.env.DEV) console.warn(`[cms] invalid ${type.key} entry "${entry.key}"`, parsed.error.issues);
    }
    return valid;
  }, [result.data, type]);

  return {
    entries,
    page: result.data?.page ?? page,
    totalPages: result.data?.totalPages ?? 1,
    isPending: result.isPending,
    isError: result.isError,
    refetch: result.refetch,
  };
}

/** Builds `?page=n` links for <Pagination>, keeping the other search params (page 1 = no param). */
export function usePageHref() {
  const { pathname, search } = useLocation();
  return useCallback(
    (page: number) => {
      const params = new URLSearchParams(search);
      if (page <= 1) params.delete('page');
      else params.set('page', String(page));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, search],
  );
}
