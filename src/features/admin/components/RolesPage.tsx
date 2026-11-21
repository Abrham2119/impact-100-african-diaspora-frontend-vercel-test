import { Badge, Panel, QueryState, Table } from '@/components/design';
import type { RoleSummary } from '@/domain/entities/admin.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { findLevel } from '@/domain/rules/membership';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatCount, formatMoney } from '@/lib/format';
import { useRoles } from '../hooks/useAdmin';
import { roleLabel } from './labels';

// Roles (admin_roles.dc.html): the assignable roles, who holds them, how many people, whether
// two-step is required and the scope. Donor, level and voting member are derived, not roles.
const SCOPED = new Set(['COMMITTEE_MEMBER', 'HUB_CO_AMBASSADOR', 'CHAPTER_ADMIN', 'USAFI_FINANCE']);

export function RolesPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const query = useRoles();
  const { data: settings } = usePublicSettings();
  const money = (cents: number) => formatMoney(cents, locale);
  const who = (role: RoleSummary['role']) =>
    t(`roles.who.${role}`, {
      initiator: money(findLevel(settings, 'initiator')?.amountCents ?? 0),
      incubator: money(findLevel(settings, 'incubator')?.amountCents ?? 0),
      count: catalog.committeeKeys.length,
    });

  return (
    <Panel title={t('roles.title')} lead={t('roles.lead')}>
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<RoleSummary>
          rows={query.data ?? []}
          rowKey={(r) => r.role}
          columns={[
            { key: 'role', header: t('roles.role'), cell: (r) => roleLabel(t, r.role) },
            { key: 'who', header: t('roles.who'), cell: (r) => who(r.role) },
            { key: 'people', header: t('roles.people'), cell: (r) => formatCount(r.people, locale) },
            { key: 'twoFactor', header: t('roles.twoFactor'), cell: (r) => (r.twoFactor ? <Badge kind="warn">{t('roles.required')}</Badge> : t('roles.optional')) },
            { key: 'scope', header: t('roles.scope'), cell: (r) => (SCOPED.has(r.role) ? t(`roles.scope.${r.role}` as 'roles.scope.COMMITTEE_MEMBER') : t('people.none')) },
          ]}
        />
      </QueryState>
    </Panel>
  );
}
