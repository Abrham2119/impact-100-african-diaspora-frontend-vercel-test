import { PATHS } from '@/app/routes/paths';
import type { ShellMenu } from './types';

// Admin console rail + section sidebars, order, icons and labels verbatim from
// design-reference/snapshots/admin*.html (admin sidebar items have no icons).
// Permissions follow ARCHITECTURE.md §4.
const A = PATHS.admin;

export const adminMenu: ShellMenu<'admin'> = {
  namespace: 'admin',
  rootLabelKey: 'root',
  rootTo: A.dashboard,
  bellTo: A.approvals,
  accountTo: A.people,
  groups: [
    {
      key: 'overview',
      railLabelKey: 'rail.dashboard',
      titleKey: 'group.overview',
      icon: 'far fa-th-large',
      items: [
        {
          key: 'chapter',
          labelKey: 'item.chapter',
          to: A.dashboard,
          permission: ['campaigns:read', 'ballots:read', 'submissions:read', 'content:read'],
        },
        { key: 'finance', labelKey: 'item.finance', to: A.finance, permission: 'payments:read' },
        { key: 'hub', labelKey: 'item.hub', to: A.hubs, permission: 'hub_dashboard:read' },
        { key: 'exports', labelKey: 'item.exports', to: A.exports, permission: 'users:list' },
      ],
    },
    {
      key: 'people',
      railLabelKey: 'rail.people',
      titleKey: 'group.people',
      icon: 'far fa-users',
      items: [
        { key: 'people', labelKey: 'item.people', to: A.people, permission: 'users:list' },
        { key: 'roles', labelKey: 'item.roles', to: A.roles, permission: 'roles:list' },
        { key: 'permissions', labelKey: 'item.permissions', to: A.permissions, permission: 'permissions:read' },
      ],
    },
    {
      key: 'rules',
      railLabelKey: 'rail.rules',
      titleKey: 'group.rules',
      icon: 'far fa-sliders-h',
      items: [
        { key: 'campaigns', labelKey: 'item.campaigns', to: A.campaigns, permission: 'campaigns:read' },
        { key: 'settings', labelKey: 'item.settings', to: A.settings, permission: 'charter_settings:read' },
        { key: 'approvals', labelKey: 'item.approvals', to: A.approvals, permission: 'charter_settings:read' },
        { key: 'settingsHistory', labelKey: 'item.settingsHistory', to: A.settingsHistory, permission: 'charter_settings:read' },
      ],
    },
    {
      key: 'payments',
      railLabelKey: 'rail.payments',
      titleKey: 'group.payments',
      icon: 'far fa-wallet',
      items: [
        { key: 'ledger', labelKey: 'item.ledger', to: A.ledger, permission: 'payments:read' },
        { key: 'offline', labelKey: 'item.offline', to: A.offline, permission: 'payments:create' },
        { key: 'flags', labelKey: 'item.flags', to: A.financeFlags, permission: 'payments:read' },
        { key: 'reconciliation', labelKey: 'item.reconciliation', to: A.reconciliation, permission: 'payments:read' },
      ],
    },
    {
      key: 'governance',
      railLabelKey: 'rail.governance',
      titleKey: 'group.governance',
      icon: 'far fa-gavel',
      items: [
        { key: 'ballots', labelKey: 'item.ballots', to: A.ballots, permission: 'ballots:read' },
        { key: 'proposalNew', labelKey: 'item.proposalNew', to: A.proposalNew, permission: 'ballots:create' },
        { key: 'decisions', labelKey: 'item.decisions', to: A.decisions, permission: 'decisions:read' },
        { key: 'publish', labelKey: 'item.publish', to: A.publish, permission: 'results:read' },
        { key: 'nominations', labelKey: 'item.nominations', to: A.nominations, permission: 'nominations:read' },
        { key: 'signatures', labelKey: 'item.signatures', to: A.signatures, permission: 'signatures:read' },
        { key: 'rubric', labelKey: 'item.rubric', to: A.rubric, permission: 'scoring:read' },
        { key: 'reviewBoard', labelKey: 'item.reviewBoard', to: A.reviewBoard, permission: 'scoring:read' },
      ],
    },
    {
      key: 'engagement',
      railLabelKey: 'rail.engage',
      titleKey: 'group.engagement',
      icon: 'far fa-hands-helping',
      items: [
        { key: 'signups', labelKey: 'item.signups', to: A.signups, permission: 'signups:read' },
        { key: 'submissions', labelKey: 'item.submissions', to: A.submissions, permission: 'submissions:read' },
        { key: 'routing', labelKey: 'item.routing', to: A.routing, permission: 'submissions:read' },
      ],
    },
    {
      key: 'content',
      railLabelKey: 'rail.content',
      titleKey: 'group.content',
      icon: 'far fa-pen-nib',
      items: [
        { key: 'cms', labelKey: 'item.cms', to: A.cms, permission: 'content:read' },
        { key: 'preview', labelKey: 'item.preview', to: A.cmsPreview, permission: 'content:read' },
      ],
    },
    {
      key: 'system',
      railLabelKey: 'rail.system',
      titleKey: 'group.system',
      icon: 'far fa-cog',
      items: [
        { key: 'emails', labelKey: 'item.emails', to: A.emails, permission: 'emails:read' },
        { key: 'delivery', labelKey: 'item.delivery', to: A.delivery, permission: 'emails:read' },
        { key: 'audit', labelKey: 'item.audit', to: A.audit, permission: 'audit:list' },
      ],
    },
  ],
  exits: [
    { key: 'website', labelKey: 'shell.website', icon: 'far fa-globe-africa', to: PATHS.home },
    { key: 'portal', labelKey: 'shell.portal', icon: 'far fa-id-card', to: PATHS.portal.dashboard },
  ],
};
