import { Link } from 'react-router-dom';
import { Badge, Card, Panel, StatRow, Table, type BadgeKind } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { ReviewStatus } from '@/domain/entities/governance.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useReviews } from '@/features/governance/hooks/usePortalGovernance';
import type { ReviewsView } from '@/features/governance/api/governanceRepository';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatDayMonth } from '@/lib/format';
import { PortalState } from './PortalState';

// Committee reviews (portal_reviews.dc.html): assigned / submitted / due, the proposals assigned to
// me with their review status (Score or View), and the conflict-of-interest reminder.
export const REVIEW_BADGE: Record<ReviewStatus, BadgeKind> = { SUBMITTED: 'ok', IN_PROGRESS: 'warn', NOT_STARTED: 'neutral', RECUSED: 'bad' };
type Row = ReviewsView['assignments'][number];

export function ReviewsPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const query = useReviews();
  const rows = query.data?.assignments ?? [];
  const due = rows.map((r) => r.dueOn).sort()[0];

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <StatRow
        items={[
          { key: 'assigned', label: t('reviews.assigned'), value: String(rows.length) },
          { key: 'submitted', label: t('reviews.submitted'), value: String(rows.filter((r) => r.status === 'SUBMITTED').length) },
          ...(due ? [{ key: 'due', label: t('reviews.due'), value: formatDayMonth(due, locale), note: due.slice(0, 4) }] : []),
        ]}
      />
      <Panel title={t('reviews.title')} lead={t('reviews.lead')}>
        <Table<Row>
          rows={rows}
          rowKey={(row) => row.proposalId}
          empty={t('reviews.empty')}
          columns={[
            { key: 'proposal', header: t('reviews.proposal'), cell: (row) => row.proposal.title },
            { key: 'country', header: t('reviews.country'), cell: (row) => catalog.country(row.proposal.countryKey) },
            { key: 'due', header: t('reviews.due'), cell: (row) => formatDate(row.dueOn, locale) },
            { key: 'status', header: t('dash.status'), cell: (row) => <Badge kind={REVIEW_BADGE[row.status]}>{t(`reviews.status.${row.status}`)}</Badge> },
            {
              key: 'open',
              header: '',
              cell: (row) => (
                <Link to={PATHS.portal.score(row.proposalId)}>{row.status === 'SUBMITTED' || row.status === 'RECUSED' ? t('reviews.view') : t('reviews.score')}</Link>
              ),
            },
          ]}
        />
      </Panel>
      <Card tone="soft" className="mt_30 ixd_h_auto">
        <h4>{t('reviews.coiTitle')}</h4>
        <p>{t('reviews.coiBody')}</p>
      </Card>
    </PortalState>
  );
}
