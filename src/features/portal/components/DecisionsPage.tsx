import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Badge, type BadgeKind, Chip, Field, Panel, QueryState, ResultBox, Select, Table, Textarea } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { Amendment, AmendmentStatus, VoteChoice } from '@/domain/entities/governance.types';
import { useAmendments, useCharterSections, useDecisions, useProposeAmendment, useVoteDecision } from '@/features/governance/hooks/usePortalGovernance';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useMyMembership } from '@/features/membership/hooks/useMyMembership';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';

// Decisions & amendments (portal_decisions.dc.html): open Chapter motions (voting members pick
// Yes / No / Abstain; others see how much more to pay), the propose-an-amendment form (≥ 10
// characters) and the amendments table — a new amendment appears straight away as Circulating.
// The design's "View as …" review toggle is not rendered (FQ1): eligibility comes from the data.
export const AMENDMENT_BADGE: Record<AmendmentStatus, BadgeKind> = { CIRCULATING: 'info', ON_BALLOT: 'warn', ADOPTED: 'ok', REJECTED: 'bad' };
const CHOICES: Array<[VoteChoice, 'vote.yes' | 'vote.no' | 'vote.abstain']> = [
  ['YES', 'vote.yes'],
  ['NO', 'vote.no'],
  ['ABSTAIN', 'vote.abstain'],
];
const MIN_AMENDMENT = 10;

export function DecisionsPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const decisions = useDecisions();
  const { data: amendments } = useAmendments();
  const { data: membership } = useMyMembership();
  const { data: settings } = usePublicSettings();
  const vote = useVoteDecision();
  const money = (cents: number) => formatMoney(cents, locale);
  const received = membership?.receivedCents ?? 0;

  return (
    <QueryState isPending={decisions.isPending} isError={decisions.isError} onRetry={() => void decisions.refetch()}>
      <Panel title={t('decisions.open')} lead={t('decisions.openLead')}>
        {(decisions.data ?? []).map((decision) => (
          <div key={decision.id} className="ix_expand ixd_expand_flat">
            <div className="ix_expand_head ixd_cursor_default">
              <div>
                <span className="ix_kicker">{t('decisions.closes', { date: formatDate(decision.closesOn, locale) })}</span>
                <h4>{decision.title}</h4>
                <p className="ixd_mt4">{decision.description}</p>
              </div>
            </div>
            <div className="ix_expand_body ixd_pt18">
              {membership?.votingEligible ? (
                <div className="ix_vote_btns" role="group" aria-label={decision.title}>
                  {CHOICES.map(([choice, key]) => (
                    <Chip key={choice} on={decision.myVote === choice} disabled={vote.isPending} onClick={() => vote.mutate({ decisionId: decision.id, choice })}>
                      {t(key)}
                    </Chip>
                  ))}
                </div>
              ) : (
                <ResultBox kind="wait" title={t('vote.cantTitle')} className="ixd_mt0">
                  {t('vote.cantBody', {
                    threshold: money(settings.votingThresholdCents),
                    received: money(received),
                    more: money(Math.max(0, settings.votingThresholdCents + 100 - received)),
                  })}
                </ResultBox>
              )}
            </div>
          </div>
        ))}
      </Panel>
      <ProposeAmendment />
      <Panel title={t('decisions.amendments')} lead={t('decisions.amendmentsLead')}>
        <Table<Amendment>
          rows={amendments ?? []}
          rowKey={(row) => row.id}
          columns={[
            { key: 'section', header: t('decisions.colSection'), cell: (row) => row.section },
            { key: 'change', header: t('decisions.colChange'), cell: (row) => row.change },
            { key: 'status', header: t('decisions.colStatus'), cell: (row) => <Badge kind={AMENDMENT_BADGE[row.status]}>{t(`amendment.${row.status}`)}</Badge> },
            { key: 'open', header: '', cell: (row) => <Link to={PATHS.portal.amendment(row.id)}>{t('decisions.open.link')}</Link> },
          ]}
        />
      </Panel>
    </QueryState>
  );
}

function ProposeAmendment() {
  const t = useT('portal');
  const { data: sections } = useCharterSections();
  const propose = useProposeAmendment();
  const schema = useMemo(
    () => z.object({ section: z.string(), text: z.string().refine((v) => v.trim().length >= MIN_AMENDMENT, t('decisions.tooShort')) }),
    [t],
  );
  const form = useDesignForm(schema, { section: '', text: '' });
  const error = form.formState.errors.text?.message;
  const submit = form.handleSubmit(({ section, text }) =>
    propose.mutateAsync({ section: section || (sections?.[0] ?? ''), text }).then(() => form.reset({ section, text: '' })),
  );

  return (
    <Panel title={t('decisions.propose')} lead={t('decisions.proposeLead')}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="row">
          <div className="col-md-5">
            <Field id="am_sec" label={t('decisions.section')}>
              <Select options={(sections ?? []).map((s) => ({ value: s, label: s }))} {...form.register('section')} />
            </Field>
          </div>
          <div className="col-md-7">
            <Field id="am_txt" label={t('decisions.text')} error={error}>
              <Textarea rows={3} {...form.register('text')} />
            </Field>
          </div>
        </div>
        <div className="ix_btn_row">
          <button type="submit" className="common_btn" disabled={propose.isPending}>
            {t('decisions.submit')}
          </button>
        </div>
      </form>
    </Panel>
  );
}
