import { BlogCard } from '@/components/design';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { PATHS } from '@/app/routes/paths';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import type { SectionData } from '../../schemas/defineSection';
import { news, type newsList } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CollectionState, SectionHeadingRow, SectionPagination, toImage } from './shared';

// news_list — home "Latest News" (the latest entries of C:news, decision of Step 5) and the
// /news grid (Step 6). Cards link to /news/:slug.
export function NewsListSection({ section }: { section: SectionData<typeof newsList> }) {
  const { toPath } = useLocale();
  const t = useT('site');
  const { source, layout } = section.settings;
  // the /news list honours `?q=` (sidebar search, categories and tags of the news detail page)
  const [q] = useSearchParamState('q');
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(news, source, layout === 'page' ? (q ?? undefined) : undefined);
  const { kicker, title, lead } = section.fields;

  return (
    <section className={layout === 'page' ? 'blog_page mt_75' : 'blog mt_100'}>
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <div className="row mt_30">
            {entries.map((entry) => (
              <div key={entry.key} className="col-xl-4 col-md-6">
                <BlogCard
                  variant={layout}
                  to={toPath(PATHS.public.newsDetail(entry.slug ?? entry.key))}
                  image={toImage(entry.media.image)}
                  date={entry.fields.date_label}
                  meta={{ kind: 'category', label: entry.fields.category }}
                  title={entry.fields.title}
                  excerpt={entry.fields.excerpt}
                  readMore={t('readMore')}
                />
              </div>
            ))}
          </div>
          {source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
        </CollectionState>
      </div>
    </section>
  );
}
