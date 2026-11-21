import { Badge, Panel, QueryState, Table, type TableColumn } from '@/components/design';
import type { ReconciliationRun } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatStamp } from '@/lib/format';
import { useReconciliation, useRunReconciliation } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Reconciliation runs (admin_reconciliation.dc.html): the nightly check for missed payment
// notifications (each processed once); "run now" starts one (audited).
export function ReconciliationPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useReconciliation();
  const run = useRunReconciliation();
  const columns: Array<TableColumn<ReconciliationRun>> = [
    { key: 'when', header: t('recon.when'), cell: (r) => formatStamp(r.ranAt, locale), sortValue: (r) => r.ranAt },
    { key: 'checked', header: t('recon.checked'), cell: (r) => r.checked, sortValue: (r) => r.checked },
    { key: 'recovered', header: t('recon.recovered'), cell: (r) => r.recovered, sortValue: (r) => r.recovered },
    { key: 'duplicates', header: t('recon.duplicates'), cell: (r) => r.duplicates, sortValue: (r) => r.duplicates },
    { key: 'bad', header: t('recon.bad'), cell: (r) => r.badSignatures, sortValue: (r) => r.badSignatures },
    { key: 'status', header: t('recon.status'), cell: (r) => <Badge kind={r.status === 'OK' ? 'ok' : 'bad'}>{t(`recon.status.${r.status}`)}</Badge>, sortValue: (r) => r.status },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <Panel
      title={t('recon.title')}
      lead={t('recon.lead')}
      right={
        <Can require="payments:update">
          <div className="ix_toolbar">
            <button type="button" className="common_btn ix_btn_sm" disabled={run.isPending} onClick={() => run.mutate(undefined)}>
              {t('recon.run')}
            </button>
          </div>
        </Can>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<ReconciliationRun> rows={list.rows} rowKey={(r) => r.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
