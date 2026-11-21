import { useMemo } from 'react';
import { ErrorState, LoadingState } from '@/components/design';
import { NotFound } from '@/components/NotFound';
import { TwScope } from '@/components/TwScope';
import type { CmsPageKey } from '@/domain/entities/content.types';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { useCmsPage } from '../hooks/useContent';
import { renderSections } from './sectionRegistry';

// A public page rendered from its CMS page tree (ARCHITECTURE.md §7.3): SEO title/description
// (React 19 hoists them into <head>), then every section through the registry. Loading and error
// keep the design's look; a missing page is the app's 404. The banner section is drawn by
// PublicLayout from the same query.
export function CmsPage({ pageKey }: { pageKey: CmsPageKey }) {
  const { locale } = useLocale();
  const t = useT('common');
  const query = useCmsPage(pageKey, locale);
  const page = query.data;
  const sections = useMemo(() => (page ? renderSections(page.sections) : []), [page]);

  if (query.isPending) {
    return (
      <section className="mt_100">
        <div className="container">
          <LoadingState label={t('states.loading')} />
        </div>
      </section>
    );
  }
  if (query.isError) {
    return (
      <section className="mt_100">
        <div className="container">
          <ErrorState title={t('states.errorTitle')} retryLabel={t('states.retry')} onRetry={() => void query.refetch()}>
            {t('states.errorBody')}
          </ErrorState>
        </div>
      </section>
    );
  }
  if (!page) {
    return (
      <TwScope>
        <NotFound />
      </TwScope>
    );
  }
  return (
    <>
      {page.seo.title !== null && <title>{page.seo.title}</title>}
      {page.seo.description !== null && <meta name="description" content={page.seo.description} />}
      {sections}
    </>
  );
}
