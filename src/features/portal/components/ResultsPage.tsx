import { Link } from 'react-router-dom';
import { Badge, Panel, StatRow, Table, type BadgeKind } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { ClosedVote, VoteOutcome } from '@/domain/entities/governance.types';
import { outcomeOf } from '@/domain/rules/governance';
import { useResults } from '@/features/governance/hooks/usePortalGovernance';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import { PortalState } from './PortalState';

// Results (portal_results.dc.html): last cycle's financial summary and the closed votes; the
// outcome of each is worked out by the rules engine (quorum → tie → majority), never stored.
export const OUTCOME_KIND = (outcome: VoteOutcome): BadgeKind => (outcome === 'PASSED' ? 'ok' : 'bad');

export function ResultsPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const query = useResults();
  const { data: settings } = usePublicSettings();
  const money = (cents: number) => formatMoney(cents, locale);
  const f = query.data?.financials;

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {f && (
        <Panel title={t('results.summary')} lead={t('results.summaryLead', { cycle: f.cycle })}>
          <StatRow
            columns="col-md-3 col-6"
            items={[
              { key: 'pledged', label: t('results.pledged'), value: money(f.pledgedCents) },
              { key: 'received', label: t('results.received'), value: money(f.receivedCents) },
              { key: 'donations', label: t('results.donations'), value: money(f.donationsCents), note: f.donationsNote },
              { key: 'granted', label: t('results.granted'), value: money(f.grantedCents), note: t('results.partners', { count: f.partners }) },
            ]}
          />
        </Panel>
      )}
      <Panel title={t('results.closed')} lead={t('results.closedLead')}>
        <Table<ClosedVote>
          rows={query.data?.votes ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: 'vote', header: t('results.vote'), cell: (row) => row.title },
            { key: 'eligible', header: t('results.eligible'), cell: (row) => row.eligible },
            {
              key: 'turnout',
              header: t('results.turnout'),
              cell: (row) => {
                const count = row.yes + row.no + row.abstain;
                return t('results.turnoutValue', { count, pct: Math.round((count / row.eligible) * 100) });
              },
            },
            { key: 'yes', header: t('results.yes'), cell: (row) => row.yes },
            { key: 'no', header: t('results.no'), cell: (row) => row.no },
            { key: 'abstain', header: t('results.abstain'), cell: (row) => row.abstain },
            {
              key: 'outcome',
              header: t('results.outcome'),
              cell: (row) => {
                const outcome = outcomeOf(row, settings.quorumPct);
                return <Badge kind={OUTCOME_KIND(outcome)}>{t(`outcome.${outcome}`)}</Badge>;
              },
            },
            { key: 'details', header: '', cell: (row) => <Link to={PATHS.portal.result(row.id)}>{t('results.details')}</Link> },
          ]}
        />
      </Panel>
    </PortalState>
  );
}
