import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Panel, QueryState, Table, type TableColumn } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { AuditEntry } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadCsv } from '@/lib/download';
import { formatStamp } from '@/lib/format';
import { useAuditLog, useExportAudit } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Audit log (admin_audit.dc.html): append-only and hash-chained, newest first — every admin action
// of the console lands here. Search (actor, action or entity) and a date range in the URL; the
// export takes the filtered entries (and is itself audited). Vote choices are never logged.
export function AuditPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const searchId = useId();
  const fromId = useId();
  const toId = useId();
  const query = useAuditLog();
  const exporter = useExportAudit();
  const [from, setFrom] = useListFilter('from');
  const [to, setTo] = useListFilter('to');

  const columns: Array<TableColumn<AuditEntry>> = [
    { key: 'when', header: t('audit.when'), cell: (e) => formatStamp(e.at, locale), sortValue: (e) => e.at },
    { key: 'actor', header: t('audit.actor'), cell: (e) => e.actorName, sortValue: (e) => e.actorName },
    { key: 'action', header: t('audit.action'), cell: (e) => e.action, sortValue: (e) => e.action },
    { key: 'entity', header: t('audit.entity'), cell: (e) => e.entity, sortValue: (e) => e.entity },
    { key: 'view', header: '', cell: (e) => <Link to={PATHS.admin.auditEntry(e.id)}>{t('audit.view')}</Link> },
  ];
  const filters = {
    from: (e: AuditEntry, value: string) => e.at.slice(0, 10) >= value,
    to: (e: AuditEntry, value: string) => e.at.slice(0, 10) <= value,
  };
  const searchText = (e: AuditEntry) => `${e.actorName} ${e.action} ${e.entity}`;
  const list = useAdminList(query.data, { columns, searchText, filters });
  const exportShown = () => {
    // every entry that matches the filters, not only this page
    const needle = list.query.trim().toLowerCase();
    const ids = (query.data ?? [])
      .filter((e) => (!needle || searchText(e).toLowerCase().includes(needle)) && (!from || filters.from(e, from)) && (!to || filters.to(e, to)))
      .map((e) => e.id);
    void exporter.mutateAsync(ids).then((csv) => downloadCsv('audit-log.csv', csv));
  };

  return (
    <Panel
      title={t('audit.title')}
      lead={t('audit.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={searchId}>
            {t('audit.search')}
          </label>
          <input id={searchId} type="search" placeholder={t('audit.search')} value={list.query} onChange={(e) => list.onSearch(e.target.value)} />
          <label className="ix_sr" htmlFor={fromId}>
            {t('audit.from')}
          </label>
          <input id={fromId} type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          <label className="ix_sr" htmlFor={toId}>
            {t('audit.to')}
          </label>
          <input id={toId} type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          <Can require="audit:export">
            <button type="button" className="common_btn ix_btn_sm" disabled={exporter.isPending} onClick={exportShown}>
              {t('audit.export')}
            </button>
          </Can>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<AuditEntry> rows={list.rows} rowKey={(e) => e.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
