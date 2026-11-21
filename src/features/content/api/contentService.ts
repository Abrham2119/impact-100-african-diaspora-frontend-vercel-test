import type { Locale } from '@/domain/entities/locale.types';
import type { PublicChrome } from '@/domain/entities/navigation.types';
import type { CmsCollectionPage, CmsCollectionQuery, CmsPageKey, CmsPageTree } from '@/domain/entities/content.types';
import type { EntryCardDto, PageTreeDto, PaginatedDto, UiBundleDto } from '@/types/content.dto';
import { chromeEn } from '../fixtures/chrome.en';
import { collectionsEn } from '../fixtures/en/collections';
import { pagesEn } from '../fixtures/en/pages';
import { uiStringsEn, type UiBundle, type UiNamespace } from '../fixtures/en/ui';
import { localesFixture } from '../fixtures/locales';
import { mapCollectionPage, mapPageTree, mapUiBundle } from '../lib/mappers';

// Public content reader (ARCHITECTURE.md §6, §7.3 point 6). Until the content API exists
// (backend Step 8, wired in frontend Step 13) every call resolves from the fixtures, which are
// in the exact API shape (`PageTree`, `Paginated<EntryCard>`, `{ key: LocalizedValue }`) and go
// through the same mappers the API responses will. Only this file changes when the source
// switches to `apiClient` + API_ENDPOINTS.content.* — hooks and components stay the same.
//
// Fallback mirrors the server (CONTENT_AND_I18N.md §3): a locale without its own seed gets the
// default locale's values.

const DEFAULT_LOCALE = localesFixture.find((l) => l.isDefault)?.code ?? 'en';
/** server default page size (backend §0.3) */
const DEFAULT_LIMIT = 10;

const pick = <T>(byLocale: Record<string, T>, locale: string): T => byLocale[locale] ?? (byLocale[DEFAULT_LOCALE] as T);

const CHROME: Record<string, PublicChrome> = { en: chromeEn };
const PAGES: Record<string, Record<string, PageTreeDto>> = { en: pagesEn };
const COLLECTIONS: Record<string, Record<string, EntryCardDto[]>> = { en: collectionsEn };
const UI: Record<string, Record<UiNamespace, UiBundleDto>> = { en: uiStringsEn };

/** `GET collections/:key/entries` over a fixture list: keys (in order) or filter, then paging. */
function queryEntries(entries: EntryCardDto[], query: CmsCollectionQuery): PaginatedDto<EntryCardDto> {
  let list = entries;
  if (query.keys) {
    const byKey = new Map(entries.map((entry) => [entry.key, entry]));
    list = query.keys.map((key) => byKey.get(key)).filter((entry): entry is EntryCardDto => entry !== undefined);
  }
  if (query.filter) {
    const filter = Object.entries(query.filter);
    list = list.filter((entry) => filter.every(([field, value]) => String(entry.data[field]) === value));
  }
  const limit = query.limit ?? (query.keys ? list.length || 1 : DEFAULT_LIMIT);
  const totalPages = Math.max(1, Math.ceil(list.length / limit));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  return {
    data: list.slice((page - 1) * limit, page * limit),
    total: list.length,
    page,
    limit,
    total_pages: totalPages,
  };
}

// Synchronous seeds, used as React Query `initialData` so content never flashes.
// They return undefined once the source is the API.
const seed = {
  locales: (): Locale[] => localesFixture,
  chrome: (locale: string): PublicChrome => pick(CHROME, locale),
  page: (key: CmsPageKey, locale: string): CmsPageTree | null => {
    const dto = pick(PAGES, locale)[key];
    return dto ? mapPageTree(dto) : null;
  },
  collection: (query: CmsCollectionQuery, locale: string): CmsCollectionPage =>
    mapCollectionPage(queryEntries(pick(COLLECTIONS, locale)[query.collection] ?? [], query)),
  uiStrings: (namespace: UiNamespace, locale: string): UiBundle => mapUiBundle(pick(UI, locale)[namespace]),
};

export const contentService = {
  defaultLocale: DEFAULT_LOCALE,
  seed,
  locales: async (): Promise<Locale[]> => seed.locales(),
  chrome: async (locale: string): Promise<PublicChrome> => seed.chrome(locale),
  /** `null` = no such page (the API's 404) */
  page: async (key: CmsPageKey, locale: string): Promise<CmsPageTree | null> => seed.page(key, locale),
  collection: async (query: CmsCollectionQuery, locale: string): Promise<CmsCollectionPage> => seed.collection(query, locale),
  uiStrings: async (namespace: UiNamespace, locale: string): Promise<UiBundle> => seed.uiStrings(namespace, locale),
};
