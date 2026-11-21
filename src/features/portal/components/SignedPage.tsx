import { Navigate } from 'react-router-dom';
import { ButtonLink, KeyValueList, Panel } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useSignature } from '@/features/governance/hooks/usePortalGovernance';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { PortalState } from './PortalState';

// Charter signed (portal_signed.dc.html): the signature record — typed name, date and time (ET),
// charter version and IP address. Members who haven't signed go to the signing screen.
const ET = 'America/New_York';

export function SignedPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const query = useSignature();
  const s = query.data?.signature;

  if (query.data && !s) return <Navigate to={PATHS.portal.sign} replace />;

  const at = s ? new Date(s.signedAt) : null;
  const date = at ? new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: ET }).format(at) : '';
  const time = at ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: ET }).format(at) : '';

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {s && (
        <Panel bodyClassName="ixd_confirm_body">
          <div className="ix_num ixd_num_xl">
            <i className="far fa-file-signature" aria-hidden="true" />
          </div>
          <h2 className="ixd_title_34 ixd_mt20b">{t('signed.title')}</h2>
          <p className="ixd_mt10">{t('signed.lead')}</p>
          <KeyValueList
            className="mt_30 ixd_kv_center_540"
            rows={[
              { key: 'as', label: t('signed.as'), value: <span className="ixd_signed_name">{s.typedName}</span> },
              { key: 'date', label: t('signed.date'), value: t('signed.dateValue', { date, time }) },
              { key: 'version', label: t('sign.charterVersion'), value: s.version },
              { key: 'ip', label: t('signed.ip'), value: s.ip },
            ]}
          />
          <p className="ix_note">{t('signed.note')}</p>
          <div className="ix_btn_row ixd_row_center">
            <ButtonLink to={PATHS.portal.dashboard}>{t('signed.back')}</ButtonLink>
            <ButtonLink variant="dark" to={PATHS.public.charter}>
              {t('sign.read')}
            </ButtonLink>
          </div>
        </Panel>
      )}
    </PortalState>
  );
}
