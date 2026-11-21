import { useParams } from 'react-router-dom';
import { Badge, EmptyState, Panel, Timeline } from '@/components/design';
import type { AmendmentStatus } from '@/domain/entities/governance.types';
import { useAmendment } from '@/features/governance/hooks/usePortalGovernance';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import { AMENDMENT_BADGE } from './DecisionsPage';
import { Discussion } from './Discussion';
import { PortalState } from './PortalState';

// Amendment detail (portal_amendment.dc.html): section + status, the change, who proposed it, the
// current / proposed charter text (when known), where it is in the process, and the discussion.
const STAGE: Record<AmendmentStatus, number> = { CIRCULATING: 1, ON_BALLOT: 2, ADOPTED: 3, REJECTED: 3 };

export function AmendmentPage() {
  const t = useT('portal');
  const tc = useT('common');
  const { locale } = useLocale();
  const { id } = useParams();
  const query = useAmendment(id);
  const a = query.data;
  const section = a?.section.match(/^(\d+)\.\s*(.*)$/);
  const stage = a ? STAGE[a.status] : 0;
  const circulated = a?.circulatedOn ? formatDate(a.circulatedOn, locale) : null;

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {!a ? (
        <EmptyState>{tc('states.empty')}</EmptyState>
      ) : (
        <>
          <Panel>
            <div className="d-flex flex-wrap justify-content-between ixd_gap12">
              <span className="ix_kicker">{section ? t('amendment.section', { n: section[1], name: section[2] }) : a.section}</span>
              <Badge kind={AMENDMENT_BADGE[a.status]}>{t(`amendment.${a.status}`)}</Badge>
            </div>
            <h2 className="ixd_title_30 ixd_mt10">{a.change.replace(/\.$/, '')}</h2>
            {a.authorName && circulated && <p className="ixd_mt8">{t('amendment.by', { name: a.authorName, level: a.authorLevel ?? '', date: circulated })}</p>}
            {a.currentText && a.proposedText && (
              <div className="ix_diff mt_30">
                <div className="ix_old">
                  <b>{t('amendment.current')}</b>
                  <p>{a.currentText}</p>
                </div>
                <div className="ix_new">
                  <b>{t('amendment.proposed')}</b>
                  <p>{a.proposedText}</p>
                </div>
              </div>
            )}
          </Panel>
          <Panel title={t('amendment.process')}>
            <Timeline
              items={[
                { id: 'circulating', title: t('amendment.step1'), text: circulated ? t('amendment.step1Body', { date: circulated }) : undefined, done: stage >= 1 },
                { id: 'ballot', title: t('amendment.step2'), text: t('amendment.step2Body'), done: stage >= 2 },
                { id: 'decided', title: t('amendment.step3'), text: t('amendment.step3Body'), done: stage >= 3 },
              ]}
            />
          </Panel>
          <Panel title={t('amendment.discussion')}>
            <Discussion targetId={a.id} heading={false} placeholder={false} />
          </Panel>
        </>
      )}
    </PortalState>
  );
}
