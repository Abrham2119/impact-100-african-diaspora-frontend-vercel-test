import { useParams } from 'react-router-dom';
import { Badge, BarRows, EmptyState, Panel, QueryState, StatRow, Timeline, type TimelineItem } from '@/components/design';
import { outcomeOf, quorumNeeded } from '@/domain/rules/governance';
import { useResult } from '@/features/governance/hooks/usePortalGovernance';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import { OUTCOME_KIND } from './ResultsPage';

// Result detail (portal_result.dc.html): the locked published result, its counts and how the rules
// engine reached the outcome (quorum, then tie, then majority).
export function ResultPage() {
  const t = useT('portal');
  const tc = useT('common');
  const { locale } = useLocale();
  const { id } = useParams();
  const query = useResult(id);
  const { data: settings } = usePublicSettings();
  const r = query.data;

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {!r ? (
        <EmptyState>{tc('states.empty')}</EmptyState>
      ) : (
        (() => {
          const needed = quorumNeeded(r.eligible, settings.quorumPct);
          const yesNo = r.yes + r.no;
          const total = yesNo + r.abstain;
          const met = yesNo >= needed;
          const outcome = outcomeOf(r, settings.quorumPct);
          const share = (n: number) => (total > 0 ? (n / total) * 100 : 0);
          const steps: TimelineItem[] = [
            { id: 'quorum', title: t('result.step1'), text: met ? t('result.step1Met', { yesNo, needed }) : t('result.step1NotMet', { yesNo, needed }), done: true },
          ];
          if (met) steps.push({ id: 'tie', title: t('result.step2'), text: r.yes === r.no ? t('result.step2Tie', { yes: r.yes, no: r.no }) : t('result.step2No', { yes: r.yes, no: r.no }), done: true });
          if (met && r.yes !== r.no) steps.push({ id: 'majority', title: t('result.step3'), text: r.yes > r.no ? t('result.step3Pass') : t('result.step3Fail'), done: true });
          return (
            <>
              <Panel>
                <div className="d-flex flex-wrap justify-content-between ixd_gap12">
                  <span className="ix_kicker">{t('result.published', { date: formatDate(r.publishedOn, locale) })}</span>
                  <Badge kind={OUTCOME_KIND(outcome)}>{t(`outcome.${outcome}`)}</Badge>
                </div>
                <h2 className="ixd_title_30 ixd_mt10">{r.title}</h2>
                <StatRow
                  className="mt_30"
                  columns="col-md-3 col-6"
                  items={[
                    { key: 'eligible', label: t('result.eligible'), value: String(r.eligible) },
                    { key: 'quorum', label: t('result.quorum'), value: String(needed), note: t('result.quorumNote', { pct: settings.quorumPct }) },
                    { key: 'yesNo', label: t('result.yesNo'), value: String(yesNo), note: met ? t('result.quorumMet') : t('result.quorumNotMet') },
                    { key: 'abstain', label: t('result.abstentions'), value: String(r.abstain), note: t('result.recorded') },
                  ]}
                />
              </Panel>
              <Panel title={t('result.counts')}>
                <BarRows
                  rows={[
                    { key: 'yes', label: t('results.yes'), widthPct: share(r.yes), value: r.yes },
                    { key: 'no', label: t('results.no'), widthPct: share(r.no), value: r.no, accent: false },
                    { key: 'abstain', label: t('results.abstain'), widthPct: share(r.abstain), value: r.abstain, accent: false },
                  ]}
                />
              </Panel>
              <Panel title={t('result.how')} lead={t('result.howLead')}>
                <Timeline items={steps} />
                <p className="ix_note">{t('result.note', { version: r.settingsVersion })}</p>
              </Panel>
            </>
          );
        })()
      )}
    </QueryState>
  );
}
