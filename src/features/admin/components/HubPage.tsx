import { Badge, EmptyState, Panel, QueryState, ResultBox, StatRow, Table, type BadgeKind } from '@/components/design';
import type { HubDashboard } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadCsv, toCsv } from '@/lib/download';
import { formatCount, formatDate, formatDayMonth, formatMoney } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';
import { useHubDashboard } from '../hooks/useAdmin';

// Hub dashboard (admin_hub.dc.html): a co-Ambassador sees their own hub only (the scope comes with
// the session and is enforced on the server): members, sign-ups, RSVPs, progress, recent sign-ups
// (csv export) and upcoming events.
type Signup = HubDashboard['recentSignups'][number];
const STATUS_BADGE: Record<Signup['status'], BadgeKind> = { NEW: 'info', CONTACTED: 'warn', WELCOMED: 'ok' };
/** the hub of the signed-in co-Ambassador; other admins see the first hub with a dashboard */
const DEFAULT_HUB = 'atlanta';

export function HubPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const hubKey = useAuthStore((s) => s.session?.roles.find((r) => r.role === 'HUB_CO_AMBASSADOR')?.scopeId ?? DEFAULT_HUB);
  const query = useHubDashboard(hubKey);
  const h = query.data;
  const money = (cents: number) => formatMoney(cents, locale);
  const typeOf = (s: Signup) => (s.role ? `${t(`hub.type.${s.type}`)} · ${s.role}` : t(`hub.type.${s.type}`));
  const names = h ? (h.ambassadors.length > 1 ? `${h.ambassadors.slice(0, -1).join(', ')} ${t('hub.and')} ${h.ambassadors[h.ambassadors.length - 1]}` : (h.ambassadors[0] ?? '')) : '';

  const exportCsv = () => {
    if (!h) return;
    const header = [t('hub.name'), t('hub.type'), t('hub.date'), t('hub.status')];
    downloadCsv(`${h.hubKey}-signups.csv`, toCsv([header, ...h.recentSignups.map((s) => [s.name, typeOf(s), s.date, t(`hub.status.${s.status}`)])]));
  };

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {!h ? (
        <EmptyState>{t('hub.none')}</EmptyState>
      ) : (
        <>
          <ResultBox kind="wait" title={t('hub.scopeTitle', { hub: catalog.hub(h.hubKey) })} className="ixd_mt0">
            {t('hub.scopeBody', { names })}
          </ResultBox>
          <StatRow
            className="mt_30"
            columns="col-xl-3 col-sm-6"
            items={[
              { key: 'members', label: t('hub.members'), value: formatCount(h.members, locale) },
              { key: 'signups', label: t('hub.signups'), value: h.signups, note: t('hub.signupsNote') },
              { key: 'rsvps', label: t('hub.rsvps'), value: h.rsvps, note: t('hub.rsvpsNote') },
              { key: 'progress', label: t('hub.progress'), value: money(h.receivedCents), note: t('hub.progressNote', { pledged: money(h.pledgedCents) }) },
            ]}
          />
          <Panel
            title={t('hub.recent')}
            right={
              <Can require="hub_dashboard:export">
                <div className="ix_toolbar">
                  <button type="button" className="common_btn ix_btn_sm" onClick={exportCsv}>
                    {t('hub.exportCsv')}
                  </button>
                </div>
              </Can>
            }
          >
            <Table<Signup>
              rows={h.recentSignups}
              rowKey={(row) => row.id}
              columns={[
                { key: 'name', header: t('hub.name'), cell: (row) => row.name },
                { key: 'type', header: t('hub.type'), cell: typeOf },
                { key: 'date', header: t('hub.date'), cell: (row) => formatDayMonth(row.date, locale) },
                { key: 'status', header: t('hub.status'), cell: (row) => <Badge kind={STATUS_BADGE[row.status]}>{t(`hub.status.${row.status}`)}</Badge> },
              ]}
            />
          </Panel>
          <Panel title={t('hub.events')}>
            <Table
              rows={h.events}
              rowKey={(row) => row.id}
              columns={[
                { key: 'event', header: t('hub.event'), cell: (row) => row.title },
                { key: 'date', header: t('hub.date'), cell: (row) => formatDate(row.date, locale) },
                { key: 'rsvps', header: t('hub.rsvps'), cell: (row) => row.rsvps },
                { key: 'capacity', header: t('hub.capacity'), cell: (row) => row.capacity },
              ]}
            />
          </Panel>
        </>
      )}
    </QueryState>
  );
}
