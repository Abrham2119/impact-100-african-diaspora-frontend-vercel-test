import { Badge, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import type { SettingsVersion, SettingsVersionStatus } from '@/domain/entities/admin.types';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';
import { useSettingsHistory } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { diffText } from './labels';

// Settings history (admin_settings_history.dc.html): every version stays on record (active,
// scheduled, superseded) with the rejected changes, so past results keep their settings.
const STATUS_BADGE: Record<SettingsVersionStatus, BadgeKind> = { ACTIVE: 'ok', SCHEDULED: 'info', SUPERSEDED: 'neutral', REJECTED: 'bad' };

export function SettingsHistoryPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useSettingsHistory();
  const money = (cents: number) => formatMoney(cents, locale);
  const none = t('people.none');
  const columns: Array<TableColumn<SettingsVersion>> = [
    { key: 'version', header: t('history.version'), cell: (v) => v.version ?? none, sortValue: (v) => v.version ?? '' },
    { key: 'change', header: t('history.change'), cell: (v) => v.change || diffText(t, money, v.diff ?? []) },
    { key: 'proposed', header: t('history.proposed'), cell: (v) => v.proposedByName, sortValue: (v) => v.proposedByName },
    { key: 'approved', header: t('history.approved'), cell: (v) => v.approvedByName ?? none },
    { key: 'from', header: t('history.activeFrom'), cell: (v) => (v.activeFrom ? formatDate(v.activeFrom, locale) : none), sortValue: (v) => v.activeFrom ?? '' },
    { key: 'status', header: t('history.status'), cell: (v) => <Badge kind={STATUS_BADGE[v.status]}>{t(`history.status.${v.status}`)}</Badge>, sortValue: (v) => v.status },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <Panel title={t('history.title')} lead={t('history.lead')}>
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<SettingsVersion> rows={list.rows} rowKey={(v) => v.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
