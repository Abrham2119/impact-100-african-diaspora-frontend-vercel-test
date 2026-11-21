import { Link } from 'react-router-dom';
import { Badge, ButtonLink, Card, Panel, ResultBox, Table, type BadgeKind } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { Installment, InstallmentStatus } from '@/domain/entities/membership.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useAmendments, useBallot, useSignature } from '@/features/governance/hooks/usePortalGovernance';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useMyMembership, usePayInstallment } from '@/features/membership/hooks/useMyMembership';
import { levelName } from '@/features/membership/lib/levelName';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatLongDate, formatMonthDay, formatMoney } from '@/lib/format';
import logoLight from '@/assets/images/logo_impact100_light.webp';
import { PortalState } from './PortalState';

// Portal dashboard (portal.dc.html): campaign header, membership card, pay-next-installment card
// (the payment shows "Opening WAZIImpact.org…" until the mock WAZI confirms it), four status cards,
// the installments table and the voting / amendments cards. Everything from the repositories.
const INSTALLMENT_BADGE: Record<InstallmentStatus, BadgeKind> = { PAID: 'ok', DUE: 'warn', SCHEDULED: 'neutral', PROCESSING: 'info' };
const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);
const trimPct = (value: number) => `${Number(value.toFixed(1))}%`;

export function DashboardPage() {
  const t = useT('portal');
  const ts = useT('site');
  const { locale } = useLocale();
  const money = (cents: number) => formatMoney(cents, locale);
  const { data: settings } = usePublicSettings();
  const membership = useMyMembership();
  const { data: profile } = useMyProfile();
  const { data: active } = useCampaigns('active');
  const { data: ballot } = useBallot();
  const { data: amendments } = useAmendments();
  const { data: signature } = useSignature();
  const pay = usePayInstallment();
  const catalog = useCatalog();

  const campaign = active?.[0];
  const m = membership.data;
  const firstName = (profile?.fullName ?? '').split(' ')[0] ?? '';
  const threshold = money(settings.votingThresholdCents);
  const line = money(settings.votingThresholdCents + 100);
  const toVote = ballot ? ballot.proposals.filter((p) => !ballot.mine[p.id]).length : 0;
  const turnout = ballot ? Math.round((ballot.yesNo / ballot.ballot.eligibleCount) * 100) : 0;
  const circulating = (amendments ?? []).filter((a) => a.status === 'CIRCULATING').length;

  return (
    <>
      <div className="ix_pc_head">
        <div>
          {campaign && (
            <p className="ix_kicker">
              {t('dash.kicker', { campaign: campaign.name, start: formatDate(campaign.startsOn, locale), end: formatDate(campaign.endsOn, locale) })}
            </p>
          )}
          <h2 className="ixd_title_32 ixd_mt6">{t('dash.welcome', { name: firstName })}</h2>
          {profile?.africanHubKey && profile.portfolioKey && (
            <p className="ixd_mt6">
              {`${t('dash.hub')} `}
              <b>{catalog.country(profile.africanHubKey)}</b>
              {` · ${t('dash.portfolio')} `}
              <b>{catalog.portfolio(profile.portfolioKey)}</b>
              {' · '}
              <Link className="ix_link" to={PATHS.public.grants}>
                {t('dash.changeInterests')}
              </Link>
            </p>
          )}
          <p className="ixd_mt4">{t('dash.renewNote')}</p>
        </div>
      </div>
      <PortalState isPending={membership.isPending} isError={membership.isError} onRetry={() => void membership.refetch()}>
        {m ? (
          <>
            <div className="ix_pc_main">
              <div className="ix_mcard" role="group" aria-label={t('dash.card')}>
                <div className="ix_mcard_top">
                  <img src={logoLight} alt={t('dash.cardLogoAlt')} className="ix_mcard_logo" />
                  <span className="ix_mcard_tag">{t('dash.cardTag', { year: campaign?.slug.replace('-', '–') ?? '' })}</span>
                </div>
                <div className="ix_mcard_chip" aria-hidden="true" />
                <p className="ix_mcard_no">{m.record.memberNo}</p>
                <div
                  className="ix_mcard_progress"
                  role="img"
                  aria-label={t('dash.cardProgress', { received: money(m.receivedCents), pledge: money(m.record.pledgeCents), line })}
                >
                  {/* positions are computed from the amounts, so they stay inline (as in the design) */}
                  <div className="ix_mcard_fill" style={{ width: trimPct(pct(m.receivedCents, m.record.pledgeCents)) }} />
                  <div className="ix_mcard_mark" style={{ left: trimPct(pct(settings.votingThresholdCents + 100, m.record.pledgeCents)) }}>
                    <span>{t('dash.votingLine', { line })}</span>
                  </div>
                </div>
                <div className="ix_mcard_bottom">
                  <div>
                    <small>{t('dash.cardMember')}</small>
                    <b>{profile?.fullName}</b>
                  </div>
                  <div>
                    <small>{t('dash.cardReceived')}</small>
                    <b>
                      {`${money(m.receivedCents)} `}
                      <em>{`/ ${money(m.record.pledgeCents)}`}</em>
                    </b>
                  </div>
                  <div>
                    <small>{t('dash.cardValid')}</small>
                    <b>{m.record.validThru}</b>
                  </div>
                </div>
              </div>
              {payCard()}
            </div>
            <div className="ix_scards">
              <div className="ix_scard ix_sc_orange">
                <i className="far fa-layer-group" aria-hidden="true" />
                <small>{t('dash.level')}</small>
                <b>{m.levelKey ? levelName(ts, m.levelKey) : t('dash.levelNone')}</b>
                <span>{t('dash.levelNote')}</span>
              </div>
              <div className="ix_scard ix_sc_green">
                <i className="far fa-vote-yea" aria-hidden="true" />
                <small>{t('dash.voting')}</small>
                <b>{m.votingEligible ? t('dash.eligible') : t('dash.notEligible')}</b>
                <span>{m.votingEligible ? t('dash.eligibleNote', { threshold }) : t('dash.notEligibleNote', { threshold })}</span>
              </div>
              <div className="ix_scard ix_sc_ink">
                <i className="far fa-lock" aria-hidden="true" />
                <small>{t('dash.charter')}</small>
                <b>{signature?.signature ? t('dash.signed') : m.charterUnlocked ? t('dash.unlocked') : t('dash.locked')}</b>
                <span>
                  {signature?.signature ? t('dash.signedNote', { version: signature.version }) : m.charterUnlocked ? t('dash.unlockedNote') : t('dash.lockedNote')}
                </span>
              </div>
              <div className="ix_scard ix_sc_gold">
                <i className="far fa-globe-africa" aria-hidden="true" />
                <small>{t('dash.interestsLabel')}</small>
                <b>{catalog.country(profile?.africanHubKey) || '—'}</b>
                <span>{catalog.portfolio(profile?.portfolioKey) || '—'}</span>
              </div>
            </div>
            <Panel
              title={t('dash.installments')}
              lead={t('dash.installmentsLead', {
                level: levelName(ts, m.record.pledgeLevelKey),
                pledge: money(m.record.pledgeCents),
                count: m.record.installments.length,
                rounding: money(settings.installmentRoundingCents),
                end: formatMonthDay(settings.cycle.ends, locale),
              })}
            >
              <Table<Installment>
                rows={m.record.installments}
                rowKey={(row) => row.id}
                columns={[
                  { key: 'due', header: t('dash.due'), cell: (row) => formatDate(row.dueOn, locale) },
                  { key: 'amount', header: t('dash.amount'), cell: (row) => money(row.amountCents) },
                  { key: 'status', header: t('dash.status'), cell: (row) => <Badge kind={INSTALLMENT_BADGE[row.status]}>{t(`installment.${row.status}`)}</Badge> },
                ]}
              />
            </Panel>
          </>
        ) : (
          <Card>
            <h4>{t('dash.noMembershipTitle')}</h4>
            <p>{t('dash.noMembershipBody')}</p>
            <div className="ix_card_foot">
              <ButtonLink size="sm" to={PATHS.public.join}>
                {t('dash.join')}
              </ButtonLink>
            </div>
          </Card>
        )}
        <div className="row ix_gap mt_30">
          {ballot && (
            <div className="col-md-6">
              <Card
                footer={
                  <ButtonLink size="sm" to={PATHS.portal.vote}>
                    {t('dash.goVote')}
                  </ButtonLink>
                }
              >
                <Badge kind="warn">{t('dash.openNow')}</Badge>
                <h4 className="ixd_mt12">{t('dash.toVote', { count: toVote })}</h4>
                <p>{t('dash.toVoteBody', { date: formatLongDate(ballot.ballot.closesOn, locale), turnout, quorum: ballot.ballot.quorumPct })}</p>
              </Card>
            </div>
          )}
          <div className="col-md-6">
            <Card
              footer={
                <ButtonLink size="sm" variant="dark" to={PATHS.portal.decisions}>
                  {t('dash.readAmendments')}
                </ButtonLink>
              }
            >
              <Badge kind="info">{t('dash.circulating')}</Badge>
              <h4 className="ixd_mt12">{t('dash.amendments', { count: circulating })}</h4>
              <p>{t('dash.amendmentsBody')}</p>
            </Card>
          </div>
        </div>
      </PortalState>
    </>
  );

  function payCard() {
    if (!m) return null;
    const next: Installment | null = m.processing ?? m.nextInstallment;
    // "Opening WAZIImpact.org…" from the click until the mock WAZI confirms (then the summary moves on)
    const paying = m.processing ?? (pay.isPending ? next : null);
    return (
      <div className="ix_pay_card">
        <p className="ix_kicker">{t('dash.pledgeKicker', { level: levelName(ts, m.record.pledgeLevelKey) })}</p>
        <h3>
          {`${money(m.toGoCents)} `}
          <span>{t('dash.toGo')}</span>
        </h3>
        {next ? (
          <p>
            {`${t('dash.nextPrefix')} `}
            <b>{money(next.amountCents)}</b>
            {` ${t('dash.nextSuffix', { date: formatDate(next.dueOn, locale) })}`}
          </p>
        ) : (
          <p>{t('dash.paidInFull')}</p>
        )}
        {paying ? (
          <ResultBox kind="wait" title={t('dash.payingTitle', { amount: money(paying.amountCents) })}>
            {t('dash.payingBody')}
          </ResultBox>
        ) : (
          next && (
            <button type="button" className="common_btn" disabled={pay.isPending} onClick={() => pay.mutate()}>
              {t('dash.pay', { amount: money(next.amountCents) })}
            </button>
          )
        )}
      </div>
    );
  }
}
