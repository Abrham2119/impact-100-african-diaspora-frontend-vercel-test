import { useId } from 'react';
import { Badge, ButtonLink, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { LedgerEntry, LedgerStatus } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatAmount, formatDate } from '@/lib/format';
import { useLedger } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { shortName } from './labels';

// Payments ledger (admin_ledger.dc.html): every pledge payment and direct donation (WAZI and
// offline), newest first; search, type filter, sortable columns and pages in the URL.
const STATUS_BADGE: Record<LedgerStatus, BadgeKind> = { CONFIRMED: 'ok', OVERPAID: 'warn', REFUNDED: 'bad' };

export function LedgerPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const searchId = useId();
  const typeId = useId();
  const query = useLedger();
  const [type, setType] = useListFilter('type');

  const forText = (e: LedgerEntry) =>
    e.kind === 'PLEDGE' ? t('ledger.pledge') : e.countryKey ? t('ledger.donation', { country: catalog.country(e.countryKey) }) : t('ledger.donationNoCountry');
  const reference = (e: LedgerEntry) => e.reference ?? (e.recordedBy ? t('ledger.recordedBy', { name: shortName(e.recordedBy) }) : t('people.none'));
  const columns: Array<TableColumn<LedgerEntry>> = [
    { key: 'date', header: t('ledger.received'), cell: (e) => formatDate(e.date, locale), sortValue: (e) => e.date },
    { key: 'person', header: t('ledger.person'), cell: (e) => e.personName, sortValue: (e) => e.personName },
    { key: 'for', header: t('ledger.for'), cell: forText, sortValue: forText },
    { key: 'amount', header: t('ledger.amount'), cell: (e) => formatAmount(e.amountCents, locale), sortValue: (e) => e.amountCents },
    { key: 'source', header: t('ledger.source'), cell: (e) => t(`ledger.source.${e.source}`), sortValue: (e) => e.source },
    { key: 'reference', header: t('ledger.reference'), cell: reference },
    { key: 'status', header: t('ledger.status'), cell: (e) => <Badge kind={STATUS_BADGE[e.status]}>{t(`ledger.status.${e.status}`)}</Badge>, sortValue: (e) => e.status },
  ];
  const list = useAdminList(query.data, {
    columns,
    searchText: (e) => `${e.personName} ${e.reference ?? ''} ${e.recordedBy ?? ''} ${forText(e)}`,
    filters: { type: (e, value) => e.kind === value },
  });

  return (
    <Panel
      title={t('ledger.title')}
      lead={t('ledger.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={searchId}>
            {t('ledger.search')}
          </label>
          <input id={searchId} type="search" placeholder={t('ledger.search')} value={list.query} onChange={(e) => list.onSearch(e.target.value)} />
          <label className="ix_sr" htmlFor={typeId}>
            {t('ledger.type')}
          </label>
          <select id={typeId} className="ix_select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{t('ledger.all')}</option>
            <option value="PLEDGE">{t('ledger.pledges')}</option>
            <option value="DONATION">{t('ledger.donations')}</option>
          </select>
          <Can require="payments:export">
            <ButtonLink size="sm" to={`${PATHS.admin.exports}?dataset=PAYMENTS`}>
              {t('ledger.export')}
            </ButtonLink>
          </Can>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<LedgerEntry> rows={list.rows} rowKey={(e) => e.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
