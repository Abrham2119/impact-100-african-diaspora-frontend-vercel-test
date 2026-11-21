import { useParams } from 'react-router-dom';
import { ButtonLink, EmptyState, KeyValueList, Panel, ResultBox } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useParticipation } from '@/features/governance/hooks/usePortalGovernance';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import { PortalState } from './PortalState';

// Vote receipt (portal_receipt.dc.html): the receipt code of my ballot on one proposal, what it
// covers, and that the choice is secret. The route id is the proposal (FQ9: no code in the URL).
export function ReceiptPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const { participationId } = useParams();
  const query = useParticipation(participationId);
  const { data: active } = useCampaigns('active');
  const p = query.data;
  const cycle = active?.[0]?.slug.replace('-', '–') ?? '';

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {!p ? (
        <EmptyState>{t('receipt.notFound')}</EmptyState>
      ) : (
        <Panel bodyClassName="ixd_confirm_body">
          <div className="ix_num ixd_num_xl">
            <i className="far fa-check" aria-hidden="true" />
          </div>
          <h2 className="ixd_title_34 ixd_mt20b">{t('receipt.title')}</h2>
          <p className="ixd_mt10">{t('receipt.lead')}</p>
          <p className="ixd_mt20b">
            <span className="ix_code ixd_code_lg">{p.receipt}</span>
          </p>
          <KeyValueList
            className="mt_30 ixd_kv_center"
            rows={[
              { key: 'ballot', label: t('receipt.ballot'), value: t('receipt.ballotValue', { cycle }) },
              { key: 'proposal', label: t('receipt.proposal'), value: p.proposal.title },
              { key: 'cast', label: t('receipt.cast'), value: formatDate(p.castOn, locale) },
              { key: 'changeable', label: t('receipt.changeable'), value: t('receipt.changeableValue') },
            ]}
          />
          <ResultBox kind="wait" title={t('receipt.secretTitle')} className="ixd_result_center">
            {t('receipt.secretBody')}
          </ResultBox>
          <div className="ix_btn_row ixd_row_center">
            <ButtonLink to={PATHS.portal.vote}>{t('receipt.back')}</ButtonLink>
            <ButtonLink variant="dark" to={PATHS.portal.results}>
              {t('receipt.results')}
            </ButtonLink>
          </div>
        </Panel>
      )}
    </PortalState>
  );
}
