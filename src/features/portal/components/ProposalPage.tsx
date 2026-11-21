import { useParams } from 'react-router-dom';
import { Badge, ButtonLink, EmptyState, Panel, StatRow, Table } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useProposal } from '@/features/governance/hooks/usePortalGovernance';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';
import { PortalState } from './PortalState';

// Proposal detail (portal_proposal.dc.html): header (hub badge, voting open), requested / committee
// score / reach, summary, budget, rubric bars, conflicts, "Ready to vote?". Sections without data
// (proposals the design shows only on the ballot) are left out.
export function ProposalPage() {
  const t = useT('portal');
  const tc = useT('common');
  const { locale } = useLocale();
  const { proposalId } = useParams();
  const catalog = useCatalog();
  const { data: profile } = useMyProfile();
  const query = useProposal(proposalId);
  const proposal = query.data;
  const detail = proposal?.detail;
  const money = (cents: number) => formatMoney(cents, locale);

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {!proposal ? (
        <EmptyState>{tc('states.empty')}</EmptyState>
      ) : (
        <>
          <Panel>
            <div className="d-flex flex-wrap justify-content-between ixd_gap12">
              <span className="ix_kicker">{`${catalog.country(proposal.countryKey)} · ${catalog.portfolio(proposal.portfolioKey)}`}</span>
              <div>
                {proposal.countryKey === profile?.africanHubKey && (
                  <>
                    <Badge kind="accent">{t('vote.yourHub')}</Badge>{' '}
                  </>
                )}
                <Badge kind="warn">{t('proposal.open')}</Badge>
              </div>
            </div>
            <h2 className="ixd_title_32 ixd_mt10">{proposal.title}</h2>
            {detail && <p className="ixd_mt8">{t('proposal.meta', { by: detail.submittedBy, date: formatDate(detail.publishedOn, locale) })}</p>}
            <StatRow
              className="mt_30"
              items={[
                { key: 'requested', label: t('proposal.requested'), value: money(proposal.budgetCents) },
                ...(detail
                  ? [
                      { key: 'score', label: t('proposal.score'), value: t('proposal.scoreValue', { score: detail.committeeScore }), note: t('proposal.scoreNote', { count: detail.reviewers }) },
                      { key: 'reach', label: t('proposal.reach'), value: detail.reach, note: detail.reachNote },
                    ]
                  : []),
              ]}
            />
          </Panel>
          <Panel title={t('proposal.summary')}>
            <p className="ixd_lh175">{detail?.description ?? proposal.summary}</p>
          </Panel>
          {detail && (
            <Panel title={t('proposal.budget')}>
              <Table
                rows={[...detail.budgetLines.map((line) => ({ ...line, total: false })), { item: t('proposal.total'), amountCents: proposal.budgetCents, total: true }]}
                rowKey={(row) => row.item}
                columns={[
                  { key: 'item', header: t('proposal.item'), cell: (row) => (row.total ? <b>{row.item}</b> : row.item) },
                  { key: 'amount', header: t('proposal.amount'), cell: (row) => (row.total ? <b>{money(row.amountCents)}</b> : money(row.amountCents)) },
                ]}
              />
            </Panel>
          )}
          {detail && (
            <Panel title={t('proposal.rubric')} lead={t('proposal.rubricLead')}>
              {detail.rubric.map((row) => (
                <div key={row.criterion} className="ix_bar_row">
                  <span>{row.criterion}</span>
                  <div className="ix_bar">
                    {/* width is the score out of 5, computed (as in the design) */}
                    <i className="ix_acc" style={{ width: `${((row.score / 5) * 100).toFixed(1)}%` }} />
                  </div>
                  <em>{t('proposal.rubricValue', { score: row.score.toFixed(1) })}</em>
                </div>
              ))}
            </Panel>
          )}
          <Panel title={t('proposal.conflicts')}>
            <p>{detail?.conflictsNote ?? proposal.conflicts}</p>
          </Panel>
          <Panel bodyClassName="d-flex flex-wrap justify-content-between align-items-center ixd_gap16">
            <div>
              <h5 className="ixd_h5_22">{t('proposal.readyTitle')}</h5>
              <p>{t('proposal.readyBody')}</p>
            </div>
            <ButtonLink to={PATHS.portal.vote}>{t('proposal.voteCta')}</ButtonLink>
          </Panel>
        </>
      )}
    </PortalState>
  );
}
