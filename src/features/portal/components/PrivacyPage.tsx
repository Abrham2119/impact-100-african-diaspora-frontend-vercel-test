import { Panel, QueryState, ResultBox, Table } from '@/components/design';
import type { Consent, DataRequest } from '@/domain/entities/profile.types';
import { useMyProfile, useRequestData } from '@/features/profile/hooks/useMyProfile';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';

// Privacy (portal_privacy.dc.html): request a data export or deletion (one open request of each
// type; the confirmation stays while it is open) and the consents I gave, with the wording shown.
export function PrivacyPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const query = useMyProfile();
  const request = useRequestData();
  const open = (type: DataRequest['type']) => query.data?.dataRequests.some((r) => r.type === type && r.status === 'OPEN') ?? false;

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <Panel title={t('privacy.export')} lead={t('privacy.exportLead')}>
        <div className="ix_btn_row ixd_mt0">
          <button type="button" className="common_btn" disabled={request.isPending || open('EXPORT')} onClick={() => request.mutate('EXPORT')}>
            {t('privacy.exportCta')}
          </button>
        </div>
        {open('EXPORT') && (
          <ResultBox kind="ok" title={t('privacy.exportTitle')}>
            {t('privacy.exportBody')}
          </ResultBox>
        )}
      </Panel>
      <Panel title={t('privacy.delete')} lead={t('privacy.deleteLead')}>
        <ul className="ix_list">
          <li>{t('privacy.keep1')}</li>
          <li>{t('privacy.keep2')}</li>
          <li>{t('privacy.keep3')}</li>
        </ul>
        <div className="ix_btn_row">
          <button type="button" className="common_btn ix_btn_dark" disabled={request.isPending || open('DELETE')} onClick={() => request.mutate('DELETE')}>
            {t('privacy.deleteCta')}
          </button>
        </div>
        {open('DELETE') && (
          <ResultBox kind="wait" title={t('privacy.deleteTitle')}>
            {t('privacy.deleteBody')}
          </ResultBox>
        )}
      </Panel>
      <Panel title={t('privacy.consents')} lead={t('privacy.consentsLead')}>
        <Table<Consent>
          rows={query.data?.consents ?? []}
          rowKey={(row) => `${row.purpose}-${row.grantedOn}`}
          empty={t('privacy.noConsents')}
          columns={[
            { key: 'purpose', header: t('privacy.purpose'), cell: (row) => row.purpose },
            { key: 'wording', header: t('privacy.wording'), cell: (row) => t('privacy.wordingValue', { wording: row.wording }) },
            { key: 'granted', header: t('privacy.granted'), cell: (row) => formatDate(row.grantedOn, locale) },
            { key: 'withdrawn', header: t('privacy.withdrawn'), cell: (row) => (row.withdrawnOn ? formatDate(row.withdrawnOn, locale) : t('history.none')) },
          ]}
        />
      </Panel>
    </QueryState>
  );
}
