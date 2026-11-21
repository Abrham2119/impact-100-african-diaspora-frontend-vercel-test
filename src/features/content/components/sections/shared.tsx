import { useCallback, type ReactNode } from 'react';
import { EmptyState, ErrorState, HeadingRow, LoadingState, Pagination, type CardImage, type HeadingRowProps } from '@/components/design';
import type { CmsMedia } from '@/domain/entities/content.types';
import { useT } from '@/i18n/useT';
import { usePageHref } from '../../hooks/useSectionEntries';

// Helpers shared by the CMS section components (one component per section type, sectionRegistry).
// Section components translate validated CMS data into design blocks; all copy comes from the
// section's fields, its collection, or UiStrings (`site` / `common` namespaces).

/** CMS media → the `{ src, alt }` the design blocks take. */
export const toImage = (media: CmsMedia): CardImage => ({ src: media.url, alt: media.alt });

/** The optional section heading (kicker + title + lead); renders nothing without a title. */
export function SectionHeadingRow({ kicker, title, lead, ...rest }: Omit<HeadingRowProps, 'title'> & { title?: string }) {
  if (title === undefined) return null;
  return <HeadingRow kicker={kicker} title={title} lead={lead} {...rest} />;
}

/**
 * Loading / error / empty states of a collection-bound section, in the design's style
 * (ARCHITECTURE.md §6.5). Children render once entries are there.
 */
export function CollectionState({
  isPending,
  isError,
  isEmpty,
  onRetry,
  children,
}: {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
}) {
  const t = useT('common');
  if (isPending) return <LoadingState label={t('states.loading')} />;
  if (isError) {
    return (
      <ErrorState title={t('states.errorTitle')} retryLabel={t('states.retry')} onRetry={onRetry}>
        {t('states.errorBody')}
      </ErrorState>
    );
  }
  if (isEmpty) return <EmptyState>{t('states.empty')}</EmptyState>;
  return <>{children}</>;
}

/** "01 02 03" pagination under a paged grid; `?page=` links. */
export function SectionPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const t = useT('site');
  const hrefFor = usePageHref();
  return (
    <Pagination
      className="mt_50"
      page={page}
      totalPages={totalPages}
      hrefFor={hrefFor}
      labels={{ nav: t('pagination.nav'), previous: t('pagination.previous'), next: t('pagination.next') }}
    />
  );
}

/** Slider dot labels ("1 of 3") from UiStrings. */
export function useDotLabel() {
  const t = useT('site');
  return useCallback((page: number, pages: number) => t('slider.dot', { page, pages }), [t]);
}
