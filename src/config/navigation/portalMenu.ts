import { PATHS } from '@/app/routes/paths';
import type { ShellMenu } from './types';

// Member portal rail + section sidebars, order and icons verbatim from
// design-reference/snapshots/portal*.html. Permissions follow ARCHITECTURE.md §4.
const P = PATHS.portal;

export const portalMenu: ShellMenu<'portal'> = {
  namespace: 'portal',
  rootLabelKey: 'root',
  rootTo: P.dashboard,
  bellTo: P.vote,
  accountTo: P.profile,
  groups: [
    {
      key: 'dashboard',
      railLabelKey: 'group.dashboard',
      titleKey: 'group.dashboard',
      icon: 'far fa-th-large',
      items: [
        { key: 'summary', labelKey: 'item.summary', to: P.dashboard, icon: 'far fa-th-large' },
        { key: 'history', labelKey: 'item.history', to: P.history, icon: 'far fa-receipt' },
      ],
    },
    {
      key: 'voting',
      railLabelKey: 'group.voting',
      titleKey: 'group.voting',
      icon: 'far fa-vote-yea',
      items: [
        { key: 'vote', labelKey: 'item.vote', to: P.vote, icon: 'far fa-vote-yea', permission: 'votes:read' },
        { key: 'decisions', labelKey: 'item.decisions', to: P.decisions, icon: 'far fa-gavel', permission: 'decisions:read' },
        { key: 'results', labelKey: 'item.results', to: P.results, icon: 'far fa-chart-bar', permission: 'results:read' },
        { key: 'suggest', labelKey: 'item.suggest', to: P.suggest, icon: 'far fa-lightbulb', permission: 'nominations:create' },
      ],
    },
    {
      key: 'charter',
      railLabelKey: 'group.charter',
      titleKey: 'group.charter',
      icon: 'far fa-file-signature',
      items: [{ key: 'sign', labelKey: 'item.sign', to: P.sign, icon: 'far fa-file-signature', permission: 'signatures:read' }],
    },
    {
      key: 'reviews',
      railLabelKey: 'group.reviews',
      titleKey: 'group.reviews',
      icon: 'far fa-clipboard-check',
      items: [{ key: 'reviews', labelKey: 'item.reviews', to: P.reviews, icon: 'far fa-clipboard-check', permission: 'scoring:read' }],
    },
    {
      key: 'account',
      railLabelKey: 'group.account',
      titleKey: 'group.account',
      icon: 'far fa-user-cog',
      items: [
        { key: 'profile', labelKey: 'item.profile', to: P.profile, icon: 'far fa-user-cog' },
        { key: 'privacy', labelKey: 'item.privacy', to: P.privacy, icon: 'far fa-shield-alt' },
      ],
    },
  ],
  exits: [{ key: 'website', labelKey: 'shell.website', icon: 'far fa-globe-africa', to: PATHS.home }],
};
