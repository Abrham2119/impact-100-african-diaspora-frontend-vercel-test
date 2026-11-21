import { Pagination } from '@/components/design';
import { usePageHref } from '@/features/content/hooks/useSectionEntries';
import { useT } from '@/i18n/useT';

// The pages of an admin list (10 rows each; nothing shows while a list fits one page, as in the design).
export function AdminPager({ page, totalPages }: { page: number; totalPages: number }) {
  const t = useT('admin');
  const hrefFor = usePageHref();
  return <Pagination className="mt_30" page={page} totalPages={totalPages} hrefFor={hrefFor} labels={{ nav: t('pager.nav'), previous: t('pager.previous'), next: t('pager.next') }} />;
}
