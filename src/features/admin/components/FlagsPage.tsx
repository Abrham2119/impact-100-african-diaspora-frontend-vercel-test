import { Badge, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import type { FinanceFlag, FlagType } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatDayMonth, formatMoney } from '@/lib/format';
import { useFinanceFlags, useResolveFlag } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Finance flags (admin_flags.dc.html): overpayments, refunds and late installments raised for USAFI
// finance; "resolve" closes one (with your name, audited).
const TYPE_BADGE: Record<FlagType, BadgeKind> = { OVERPAYMENT: 'warn', REFUND: 'bad', LATE_INSTALLMENT: 'info' };

export function FlagsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useFinanceFlags();
  const resolve = useResolveFlag();
  const money = (cents: string | undefined) => (cents ? formatMoney(Number(cents), locale) : '');
  const detail = (f: FinanceFlag) =>
    t(`flags.detail.${f.type}`, { amount: money(f.values.amount), pledge: money(f.values.pledge), minimum: money(f.values.minimum), date: f.values.date ? formatDate(f.values.date, locale).replace(/, \d{4}$/, '') : '' });
  const columns: Array<TableColumn<FinanceFlag>> = [
    { key: 'raised', header: t('flags.raised'), cell: (f) => formatDayMonth(f.raisedOn, locale), sortValue: (f) => f.raisedOn },
    { key: 'type', header: t('flags.type'), cell: (f) => <Badge kind={TYPE_BADGE[f.type]}>{t(`flags.type.${f.type}`)}</Badge>, sortValue: (f) => f.type },
    { key: 'person', header: t('flags.person'), cell: (f) => f.personName, sortValue: (f) => f.personName },
    { key: 'detail', header: t('flags.detail'), cell: detail },
    { key: 'status', header: t('flags.status'), cell: (f) => <Badge kind={f.status === 'RESOLVED' ? 'ok' : 'neutral'}>{t(`flags.status.${f.status}`)}</Badge>, sortValue: (f) => f.status },
    {
      key: 'act',
      header: '',
      cell: (f) =>
        f.status === 'OPEN' ? (
          <Can require="payments:update" fallback={t('people.none')}>
            <button type="button" className="common_btn ix_btn_sm" disabled={resolve.isPending} onClick={() => resolve.mutate(f.id)}>
              {t('flags.resolve')}
            </button>
          </Can>
        ) : (
          t('people.none')
        ),
    },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <Panel title={t('flags.title')} lead={t('flags.lead')}>
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<FinanceFlag> rows={list.rows} rowKey={(f) => f.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
