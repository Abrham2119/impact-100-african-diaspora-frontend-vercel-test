import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Modal, Panel, QueryState, ResultBox, StatRow } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { BallotProposal, VoteChoice } from '@/domain/entities/governance.types';
import { quorumNeeded } from '@/domain/rules/governance';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useBallot, useCastVote } from '@/features/governance/hooks/usePortalGovernance';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useMyMembership } from '@/features/membership/hooks/useMyMembership';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { formatDayMonth, formatMoney } from '@/lib/format';
import { Discussion } from './Discussion';

// Proposals & vote (portal_vote.dc.html): schedule, live turnout vs quorum, the ballot items (your
// hub first, accordion), the conflict-of-interest dialog before every ballot (no conflict → Yes /
// No; a conflict → abstain only), then "Ballot cast" with the receipt. Ballots are final.
type Coi = '' | 'no' | 'has';
const CHOICE_KEY: Record<VoteChoice, 'vote.yes' | 'vote.no' | 'vote.abstain'> = { YES: 'vote.yes', NO: 'vote.no', ABSTAIN: 'vote.abstain' };

export function VotePage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const ballotQuery = useBallot();
  const { data: membership } = useMyMembership();
  const { data: profile } = useMyProfile();
  const { data: settings } = usePublicSettings();
  const { data: active } = useCampaigns('active');
  const cast = useCastVote();
  const [open, setOpen] = useState<string | null | undefined>(undefined);
  const [modal, setModal] = useState<{ proposal: BallotProposal; choice: VoteChoice; coi: Coi } | null>(null);
  const view = ballotQuery.data;

  const proposals = useMemo(() => {
    const list = [...(view?.proposals ?? [])];
    return list.sort((a, b) => Number(b.countryKey === profile?.africanHubKey) - Number(a.countryKey === profile?.africanHubKey));
  }, [view, profile]);
  const openId = open === undefined ? (proposals[0]?.id ?? null) : open;
  const money = (cents: number) => formatMoney(cents, locale);
  const cycle = active?.[0]?.slug.replace('-', '–') ?? '';

  const choose = (proposal: BallotProposal, choice: VoteChoice) => setModal({ proposal, choice, coi: choice === 'ABSTAIN' ? 'has' : '' });
  const submit = () => {
    if (!modal || !modal.coi) return;
    cast.mutate({ proposalId: modal.proposal.id, choice: modal.choice }, { onSuccess: () => setModal(null) });
  };

  return (
    <QueryState isPending={ballotQuery.isPending} isError={ballotQuery.isError} onRetry={() => void ballotQuery.refetch()}>
      {view && (
        <>
          <Panel title={t('vote.schedule')} lead={t('vote.scheduleLead', { cycle })}>
            <StatRow
              items={[
                { key: 'opens', label: t('vote.opens'), value: formatDayMonth(view.ballot.opensOn, locale), note: t('vote.at', { year: view.ballot.opensOn.slice(0, 4), time: view.ballot.opensTime }) },
                { key: 'closes', label: t('vote.closes'), value: formatDayMonth(view.ballot.closesOn, locale), note: t('vote.at', { year: view.ballot.closesOn.slice(0, 4), time: view.ballot.closesTime }) },
                { key: 'eligible', label: t('vote.eligible'), value: String(view.ballot.eligibleCount), note: t('vote.eligibleNote') },
              ]}
            />
          </Panel>
          {(() => {
            const needed = quorumNeeded(view.ballot.eligibleCount, view.ballot.quorumPct);
            const met = view.yesNo >= needed;
            return (
              <Panel
                title={t('vote.turnout')}
                lead={
                  <>
                    {`${t('vote.quorumLead', { pct: view.ballot.quorumPct })} `}
                    <b>{t('vote.quorumVotes', { count: needed })}</b>.
                  </>
                }
                right={<Badge kind={met ? 'ok' : 'warn'}>{met ? t('vote.quorumMet') : t('vote.quorumNotMet')}</Badge>}
              >
                <div className="ix_progress" role="img" aria-label={t('vote.progress', { cast: view.yesNo, needed })}>
                  {/* positions are computed from the counts, so they stay inline (as in the design) */}
                  <div className="ix_fill" style={{ width: `${Math.min(100, (view.yesNo / view.ballot.eligibleCount) * 100)}%` }} />
                  <div className="ix_mark" style={{ left: `${view.ballot.quorumPct}%` }}>
                    <span>{t('vote.quorumMark', { needed })}</span>
                  </div>
                </div>
                <div className="ix_progress_legend">
                  <span>
                    <b>{view.yesNo}</b>
                    {` ${t('vote.cast', { eligible: view.ballot.eligibleCount })}`}
                  </span>
                  <span>
                    <b>{view.abstain}</b>
                    {` ${t('vote.abstentions')}`}
                  </span>
                </div>
              </Panel>
            );
          })()}
          <Panel title={t('vote.proposals')} lead={t('vote.proposalsLead')}>
            {proposals.map((proposal) => {
              const mine = view.mine[proposal.id];
              const isOpen = proposal.id === openId;
              const bodyId = `ballot-${proposal.id}`;
              return (
                <div key={proposal.id} className="ix_expand">
                  <button type="button" className="ix_expand_head" aria-expanded={isOpen} aria-controls={bodyId} onClick={() => setOpen(isOpen ? null : proposal.id)}>
                    <div>
                      <span className="ix_kicker">{`${catalog.country(proposal.countryKey)} · ${catalog.portfolio(proposal.portfolioKey)}`}</span>
                      <h4>{proposal.title}</h4>
                    </div>
                    <div className="d-flex ixd_head_badges">
                      {proposal.countryKey === profile?.africanHubKey && <Badge kind="accent">{t('vote.yourHub')}</Badge>}
                      <Badge kind={mine ? 'ok' : 'neutral'}>{mine ? t('vote.voted') : t('vote.notVoted')}</Badge>
                      <i className="far fa-chevron-down" aria-hidden="true" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="ix_expand_body" id={bodyId}>
                      <dl className="ix_kv">
                        <dt>{t('vote.summary')}</dt>
                        <dd>{proposal.summary}</dd>
                        <dt>{t('vote.budget')}</dt>
                        <dd>{t('vote.budgetValue', { amount: money(proposal.budgetCents) })}</dd>
                        <dt>{t('vote.conflicts')}</dt>
                        <dd>{proposal.conflicts}</dd>
                      </dl>
                      {!mine && membership?.votingEligible && (
                        <div className="ix_vote_btns mt_20">
                          {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => (
                            <button key={choice} type="button" className="ix_chip" onClick={() => choose(proposal, choice)}>
                              {t(CHOICE_KEY[choice])}
                            </button>
                          ))}
                        </div>
                      )}
                      {!mine && !membership?.votingEligible && (
                        <ResultBox kind="wait" title={t('vote.cantTitle')}>
                          {t('vote.cantBody', {
                            threshold: money(settings.votingThresholdCents),
                            received: money(membership?.receivedCents ?? 0),
                            more: money(Math.max(0, settings.votingThresholdCents + 100 - (membership?.receivedCents ?? 0))),
                          })}
                        </ResultBox>
                      )}
                      {mine && (
                        <ResultBox kind="ok" title={t('vote.castTitle')}>
                          {`${t('vote.receiptCode')} `}
                          <span className="ix_code">{mine.receipt}</span>
                          {' · '}
                          <Link className="ix_link" to={PATHS.portal.receipt(proposal.id)}>
                            {t('vote.viewReceipt')}
                          </Link>
                        </ResultBox>
                      )}
                      <Discussion
                        targetId={proposal.id}
                        extra={
                          <Link className="ix_link" to={PATHS.portal.proposal(proposal.id)}>
                            {t('vote.openProposal')}
                          </Link>
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </Panel>
          {modal && (
            <Modal labelledBy="coi_h" onClose={() => setModal(null)}>
              <div className="ix_card">
                <p className="ix_kicker">{t('vote.coiKicker')}</p>
                <h3 id="coi_h" className="ixd_mt6">
                  {t('vote.coiTitle')}
                </h3>
                <p>
                  {`${t('vote.coiBefore')} `}
                  <b>{t(CHOICE_KEY[modal.choice])}</b>
                  {` ${t('vote.coiOn')} `}
                  <b>{modal.proposal.title}</b>
                  {`. ${t('vote.coiAfter')}`}
                </p>
                <div className="ix_check">
                  <input
                    id="coi1"
                    type="radio"
                    name="coi"
                    checked={modal.coi === 'no'}
                    onChange={() => setModal({ ...modal, coi: 'no', choice: modal.choice === 'ABSTAIN' ? 'YES' : modal.choice })}
                  />
                  <label htmlFor="coi1">{t('vote.coiNone')}</label>
                </div>
                <div className="ix_check">
                  <input id="coi2" type="radio" name="coi" checked={modal.coi === 'has'} onChange={() => setModal({ ...modal, coi: 'has', choice: 'ABSTAIN' })} />
                  <label htmlFor="coi2">{t('vote.coiHas')}</label>
                </div>
                <div className="ix_btn_row">
                  <button type="button" className={cx('common_btn', !modal.coi && 'ix_disabled')} aria-disabled={!modal.coi || undefined} disabled={cast.isPending} onClick={submit}>
                    {modal.coi === 'has' ? t('vote.castAbstain') : t('vote.castChoice', { choice: t(CHOICE_KEY[modal.choice]) })}
                  </button>
                  <button type="button" className="common_btn ix_btn_ghost" onClick={() => setModal(null)}>
                    {t('vote.cancel')}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </QueryState>
  );
}
