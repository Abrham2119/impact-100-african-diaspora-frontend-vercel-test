import type { RouteObject } from 'react-router-dom';
import { AdminShell } from '@/app/layouts/AdminShell';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { PermissionRoute } from '@/app/guards/PermissionRoute';
import { RoutePending } from '@/app/guards/RoutePending';
import { TwoFactorRoute } from '@/app/guards/TwoFactorRoute';
import type { ShellRouteMeta } from '@/config/navigation/types';
import type { Permission } from '@/domain/enums/permission.enum';
import type { UiKey } from '@/features/content/fixtures/en/ui';
import type { ComponentType } from 'react';
import { ScreenPlaceholder } from '@/pages/ScreenPlaceholder';
import { DashboardPage } from '@/features/admin/components/DashboardPage';
import { ExportsPage } from '@/features/admin/components/ExportsPage';
import { FinancePage } from '@/features/admin/components/FinancePage';
import { HubPage } from '@/features/admin/components/HubPage';
import { PATHS } from './paths';

// The built screens by design screen name (FE-9 / FE-10); the rest keep the placeholder until built.
const PAGES: Record<string, ComponentType> = {
  admin: DashboardPage,
  admin_finance: FinancePage,
  admin_hub: HubPage,
  admin_exports: ExportsPage,
};

// /admin/* — admin console, screens 56–88 (ARCHITECTURE.md §4). Every page needs a grant
// (ANY of the listed permissions) and, except the hub dashboard and volunteer sign-ups
// (Hub co-Ambassadors, scoped on the server), two-step verification.
// A user without the grant is sent to the member portal.

interface Options {
  /** h1 when it differs from the sidebar label */
  titleKey?: UiKey<'admin'>;
  crumb?: ShellRouteMeta<'admin'>['crumb'];
  twoFactor?: boolean;
}

const screen = (
  path: string | undefined,
  name: string,
  group: string,
  item: string,
  labelKey: UiKey<'admin'>,
  permission: Permission | Permission[],
  { titleKey = labelKey, crumb, twoFactor = true }: Options = {},
): RouteObject => {
  const Page = PAGES[name] ?? ScreenPlaceholder;
  const gated = (
    <PermissionRoute require={permission} mode="any" fallback={PATHS.portal.dashboard}>
      <Page />
    </PermissionRoute>
  );
  const element = twoFactor ? <TwoFactorRoute>{gated}</TwoFactorRoute> : gated;
  const handle = { screen: name, shell: { namespace: 'admin' as const, group, item, titleKey, crumb } };
  return path === undefined ? { index: true, handle, element } : { path, handle, element };
};

export const adminRoutes: RouteObject = {
  path: 'admin',
  element: (
    <ProtectedRoute pending={<RoutePending />}>
      <AdminShell />
    </ProtectedRoute>
  ),
  children: [
    // Overview
    screen(undefined, 'admin', 'overview', 'chapter', 'item.chapter', ['campaigns:read', 'ballots:read', 'submissions:read', 'content:read'], {
      titleKey: 'title.dashboard',
      crumb: 'root',
    }),
    screen('finance', 'admin_finance', 'overview', 'finance', 'item.finance', 'payments:read'),
    screen('hubs', 'admin_hub', 'overview', 'hub', 'item.hub', 'hub_dashboard:read', { twoFactor: false }),
    screen('exports', 'admin_exports', 'overview', 'exports', 'item.exports', 'users:list'),
    // People
    screen('people', 'admin_people', 'people', 'people', 'item.people', 'users:list'),
    // the last crumb is the person's name once the page loads it (Step 16)
    screen('people/:id', 'admin_person', 'people', 'people', 'item.people', 'users:read', {
      titleKey: 'title.person',
      crumb: { param: 'id' },
    }),
    screen('roles', 'admin_roles', 'people', 'roles', 'item.roles', 'roles:list'),
    screen('permissions', 'admin_permissions', 'people', 'permissions', 'item.permissions', 'permissions:read'),
    // Charter rules
    screen('campaigns', 'admin_cycles', 'rules', 'campaigns', 'item.campaigns', 'campaigns:read'),
    screen('settings', 'admin_settings', 'rules', 'settings', 'item.settings', 'charter_settings:read'),
    screen('approvals', 'admin_approvals', 'rules', 'approvals', 'item.approvals', 'charter_settings:read'),
    screen('settings/history', 'admin_settings_history', 'rules', 'settingsHistory', 'item.settingsHistory', 'charter_settings:read'),
    // Payments
    screen('ledger', 'admin_ledger', 'payments', 'ledger', 'item.ledger', 'payments:read'),
    screen('ledger/offline', 'admin_offline', 'payments', 'offline', 'item.offline', 'payments:create'),
    screen('finance-flags', 'admin_flags', 'payments', 'flags', 'item.flags', 'payments:read'),
    screen('reconciliation', 'admin_reconciliation', 'payments', 'reconciliation', 'item.reconciliation', 'payments:read'),
    // Governance
    screen('ballots', 'admin_ballots', 'governance', 'ballots', 'item.ballots', 'ballots:read'),
    screen('proposals/new', 'admin_proposal_form', 'governance', 'proposalNew', 'item.proposalNew', 'ballots:create'),
    screen('decisions', 'admin_decisions', 'governance', 'decisions', 'item.decisions', 'decisions:read'),
    screen('results/publish', 'admin_publish', 'governance', 'publish', 'item.publish', 'results:read'),
    screen('nominations', 'admin_nominations', 'governance', 'nominations', 'item.nominations', 'nominations:read'),
    screen('signatures', 'admin_signatures', 'governance', 'signatures', 'item.signatures', 'signatures:read'),
    screen('rubric', 'admin_rubric', 'governance', 'rubric', 'item.rubric', 'scoring:read'),
    screen('review-board', 'admin_review_board', 'governance', 'reviewBoard', 'item.reviewBoard', 'scoring:read'),
    // Engagement
    screen('volunteer-signups', 'admin_signups', 'engagement', 'signups', 'item.signups', 'signups:read', { twoFactor: false }),
    screen('submissions', 'admin_submissions', 'engagement', 'submissions', 'item.submissions', 'submissions:read'),
    screen('routing', 'admin_routing', 'engagement', 'routing', 'item.routing', 'submissions:read'),
    // Content
    screen('cms', 'admin_cms', 'content', 'cms', 'item.cms', 'content:read'),
    screen('cms/preview', 'admin_preview', 'content', 'preview', 'item.preview', 'content:read'),
    // System
    screen('emails', 'admin_emails', 'system', 'emails', 'item.emails', 'emails:read'),
    screen('emails/delivery', 'admin_delivery', 'system', 'delivery', 'item.delivery', 'emails:read'),
    screen('audit', 'admin_audit', 'system', 'audit', 'item.audit', 'audit:list'),
    screen('audit/:id', 'admin_audit_entry', 'system', 'audit', 'item.audit', 'audit:read', {
      titleKey: 'title.auditEntry',
      crumb: { key: 'crumb.auditEntry' },
    }),
  ],
};
