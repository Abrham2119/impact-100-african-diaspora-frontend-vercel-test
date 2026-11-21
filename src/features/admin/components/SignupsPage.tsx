import { useId } from 'react';
import { Badge, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import type { PlacementStatus, VolunteerSignup } from '@/domain/entities/engagement.types';
import { Can } from '@/features/auth/components/Can';
import { useEngagementCatalog } from '@/features/content/hooks/useEngagementCatalog';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadCsv } from '@/lib/download';
import { formatDayMonth } from '@/lib/format';
import { useExportSignups, useVolunteerSignups } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Volunteer sign-ups (admin_signups.dc.html): every sign-up from /volunteer, its roles and the
// teams they go to (one sign-up with several roles goes to each role's team), newest first. Area
// filter (Chapter / US hubs / USAFI portfolios / African hubs) in the URL; CSV export. A Hub
// co-Ambassador sees their hub's sign-ups only (the server scopes the list).
const STATUS_BADGE: Record<PlacementStatus, BadgeKind> = { NEW: 'info', CONTACTED: 'warn', PLACED: 'ok' };
const AREAS = ['chapter', 'us', 'usafi', 'africa'] as const;
const unique = (list: string[]) => [...new Set(list)];

export function SignupsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const roles = useEngagementCatalog();
  const areaId = useId();
  const query = useVolunteerSignups();
  const exporter = useExportSignups();
  const [area, setArea] = useListFilter('area');

  const roleText = (s: VolunteerSignup) => s.roleKeys.map(roles.roleTitle).join(' · ');
  const teamText = (s: VolunteerSignup) => unique(s.roleKeys.map(roles.team)).join(' · ');
  const columns: Array<TableColumn<VolunteerSignup>> = [
    { key: 'name', header: t('signups.name'), cell: (s) => s.name, sortValue: (s) => s.name },
    { key: 'roles', header: t('signups.roles'), cell: roleText, sortValue: roleText },
    { key: 'location', header: t('signups.location'), cell: (s) => s.location, sortValue: (s) => s.location },
    { key: 'team', header: t('signups.team'), cell: teamText, sortValue: teamText },
    { key: 'received', header: t('signups.received'), cell: (s) => formatDayMonth(s.receivedOn, locale), sortValue: (s) => s.receivedOn },
    { key: 'placement', header: t('signups.placement'), cell: (s) => <Badge kind={STATUS_BADGE[s.status]}>{t(`signups.status.${s.status}`)}</Badge>, sortValue: (s) => s.status },
  ];
  const list = useAdminList(query.data, {
    columns,
    searchText: (s) => `${s.name} ${roleText(s)} ${s.location}`,
    filters: { area: (s, value) => s.roleKeys.some((k) => roles.role(k)?.area === value) },
  });

  return (
    <Panel
      title={t('signups.title')}
      lead={t('signups.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={areaId}>
            {t('signups.area')}
          </label>
          <select id={areaId} className="ix_select" value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">{t('signups.allAreas')}</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {t(`signups.area.${a}`)}
              </option>
            ))}
          </select>
          <Can require="signups:export">
            <button type="button" className="common_btn ix_btn_sm" disabled={exporter.isPending} onClick={() => void exporter.mutateAsync(undefined).then((csv) => downloadCsv('volunteer-signups.csv', csv))}>
              {t('signups.export')}
            </button>
          </Can>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<VolunteerSignup> rows={list.rows} rowKey={(s) => s.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
