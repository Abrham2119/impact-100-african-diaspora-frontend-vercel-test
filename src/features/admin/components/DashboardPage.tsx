import { useId } from 'react';
import { Link } from 'react-router-dom';
import { BarRows, EmptyState, Funnel, Panel, QueryState, StatRow, Table } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { levelName } from '@/features/membership/lib/levelName';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatCount, formatMoney } from '@/lib/format';
import { useAdminCampaigns, useChapterDashboard } from '../hooks/useAdmin';
import { cycleOf } from './cycle';

// Chapter dashboard (admin.dc.html): members, voting-eligible, received of pledged, live turnout;
// membership by level for the cycle, the conversion funnel and what needs attention — all live.
export function DashboardPage() {
  const t = useT('admin');
  const ts = useT('site');
  const { locale } = useLocale();
  const selectId = useId();
  const query = useChapterDashboard();
  const { data: campaigns } = useAdminCampaigns();
  const { data: settings } = usePublicSettings();
  const [cycleParam, setCycle] = useSearchParamState('cycle');
  const d = query.data;
  const money = (cents: number) => formatMoney(cents, locale);
  const cycles = (campaigns ?? []).filter((c) => c.status !== 'PLANNED');
  const current = cycles.find((c) => c.status === 'ACTIVE');
  const cycle = cycleParam ?? current?.slug ?? '';

  const attention = d
    ? [
        { key: 'approvals', item: t('dash.approvals', { count: d.attention.approvals }), where: t('dash.whereRules'), to: PATHS.admin.approvals, action: t('dash.review') },
        { key: 'flags', item: t('dash.flags', { count: d.attention.flags }), where: t('dash.wherePayments'), to: PATHS.admin.financeFlags, action: t('dash.open') },
        { key: 'nominations', item: t('dash.nominations', { count: d.attention.nominations }), where: t('dash.whereGovernance'), to: PATHS.admin.nominations, action: t('dash.open') },
        { key: 'stories', item: t('dash.stories', { count: d.attention.stories }), where: t('dash.whereContent'), to: PATHS.admin.submissions, action: t('dash.open') },
      ]
    : [];

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {d && (
        <>
          <StatRow
            columns="col-xl-3 col-sm-6"
            items={[
              { key: 'members', label: t('dash.members'), value: formatCount(d.members, locale), note: t('dash.membersNote', { minimum: money(settings.membershipMinimumCents) }) },
              { key: 'voting', label: t('dash.voting'), value: formatCount(d.votingEligible, locale), note: t('dash.votingNote', { threshold: money(settings.votingThresholdCents) }) },
              { key: 'received', label: t('dash.received'), value: money(d.receivedCents), note: t('dash.receivedNote', { pledged: money(d.pledgedCents) }) },
              { key: 'turnout', label: t('dash.turnout'), value: `${d.turnoutPct}%`, note: t('dash.turnoutNote', { quorum: d.quorumPct }) },
            ]}
          />
          <Panel
            title={t('dash.byLevel')}
            lead={t('dash.byLevelLead', { cycle: cycleOf(cycle) })}
            right={
              <div className="ix_toolbar">
                <label className="ix_sr" htmlFor={selectId}>
                  {t('dash.cycle')}
                </label>
                <select id={selectId} className="ix_select" value={cycle} onChange={(e) => setCycle(e.target.value === current?.slug ? null : e.target.value)}>
                  {cycles.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.status === 'ACTIVE' ? t('dash.cycleCurrent', { cycle: cycleOf(c.slug) }) : cycleOf(c.slug)}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {cycle === current?.slug ? (
              <>
                <BarRows rows={d.byLevel.map((l) => ({ key: l.levelKey, label: levelName(ts, l.levelKey), widthPct: (l.count / d.levelScale) * 100, value: l.count }))} />
                <p className="ix_note">{t('dash.notMembers', { count: d.pledgedNotMembers, minimum: money(settings.membershipMinimumCents) })}</p>
              </>
            ) : (
              <EmptyState>{t('dash.noCycleData')}</EmptyState>
            )}
          </Panel>
          <Panel title={t('dash.funnel')} lead={t('dash.funnelLead')}>
            <Funnel steps={d.funnel.map((f) => ({ key: f.key, label: t(`funnel.${f.key}` as 'funnel.visits'), widthPct: f.widthPct, value: formatCount(f.value, locale) }))} />
          </Panel>
          <Panel title={t('dash.attention')}>
            <Table
              rows={attention}
              rowKey={(row) => row.key}
              columns={[
                { key: 'item', header: t('dash.item'), cell: (row) => row.item },
                { key: 'where', header: t('dash.where'), cell: (row) => row.where },
                { key: 'go', header: '', cell: (row) => <Link to={row.to}>{row.action}</Link> },
              ]}
            />
          </Panel>
        </>
      )}
    </QueryState>
  );
}
