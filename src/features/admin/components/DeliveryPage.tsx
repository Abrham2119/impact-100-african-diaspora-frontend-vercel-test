import { useId } from 'react';
import { Badge, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import type { Delivery, DeliveryStatus } from '@/domain/entities/admin.types';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatStamp } from '@/lib/format';
import { useDeliveries, useEmailTemplates } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Delivery log (admin_delivery.dc.html): every queued send, newest first — template, recipient (a
// record number: no personal data is logged), status and attempts (failures retry with back-off).
// Status filter in the URL.
const STATUS_BADGE: Record<DeliveryStatus, BadgeKind> = { DELIVERED: 'ok', RETRYING: 'warn', BOUNCED: 'bad', SUPPRESSED: 'neutral' };
const STATUSES: DeliveryStatus[] = ['DELIVERED', 'RETRYING', 'BOUNCED', 'SUPPRESSED'];

export function DeliveryPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const statusId = useId();
  const query = useDeliveries();
  const templates = useEmailTemplates();
  const [status, setStatus] = useListFilter('status');

  const templateName = (d: Delivery) => templates.data?.find((x) => x.id === d.templateId)?.name ?? d.templateId;
  const recipient = (d: Delivery) =>
    d.recipient.type === 'TEST' ? t('delivery.test') : t(d.recipient.type === 'MEMBER' ? 'delivery.member' : 'delivery.visitor', { ref: d.recipient.ref });
  const columns: Array<TableColumn<Delivery>> = [
    { key: 'sent', header: t('delivery.sent'), cell: (d) => formatStamp(d.sentAt, locale), sortValue: (d) => d.sentAt },
    { key: 'template', header: t('delivery.template'), cell: templateName, sortValue: templateName },
    { key: 'recipient', header: t('delivery.recipient'), cell: recipient, sortValue: recipient },
    { key: 'status', header: t('delivery.status'), cell: (d) => <Badge kind={STATUS_BADGE[d.status]}>{t(`delivery.status.${d.status}`)}</Badge>, sortValue: (d) => d.status },
    { key: 'attempts', header: t('delivery.attempts'), cell: (d) => d.attempts, sortValue: (d) => d.attempts },
  ];
  const list = useAdminList(query.data, { columns, filters: { status: (d, value) => d.status === value } });

  return (
    <Panel
      title={t('delivery.title')}
      lead={t('delivery.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={statusId}>
            {t('delivery.statusFilter')}
          </label>
          <select id={statusId} className="ix_select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('delivery.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`delivery.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<Delivery> rows={list.rows} rowKey={(d) => d.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
