import type { RouteObject } from 'react-router-dom';
import { PortalShell } from '@/app/layouts/PortalShell';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { PermissionRoute } from '@/app/guards/PermissionRoute';
import { RoutePending } from '@/app/guards/RoutePending';
import type { ShellRouteMeta } from '@/config/navigation/types';
import type { Permission } from '@/domain/enums/permission.enum';
import { ScreenPlaceholder } from '@/pages/ScreenPlaceholder';
import { PATHS } from './paths';

// /portal/* — member portal, screens 40–55 (ARCHITECTURE.md §4). Signed-in users only;
// some pages also need a grant. Business-rule gates (voting eligibility, the signing lock,
// a closed ballot) are NOT route guards: those pages render the design's locked state from
// the API. `group`/`item` select the rail group and sidebar item, as in each snapshot.

type Meta = Omit<ShellRouteMeta<'portal'>, 'namespace'>;

const screen = (path: string | undefined, name: string, meta: Meta, permission?: Permission): RouteObject => {
  const element = permission ? (
    <PermissionRoute require={permission} fallback={PATHS.portal.dashboard}>
      <ScreenPlaceholder />
    </PermissionRoute>
  ) : (
    <ScreenPlaceholder />
  );
  const handle = { screen: name, shell: { namespace: 'portal' as const, ...meta } };
  return path === undefined ? { index: true, handle, element } : { path, handle, element };
};

export const portalRoutes: RouteObject = {
  path: 'portal',
  element: (
    <ProtectedRoute pending={<RoutePending />}>
      <PortalShell />
    </ProtectedRoute>
  ),
  children: [
    screen(undefined, 'portal', { group: 'dashboard', item: 'summary', titleKey: 'title.dashboard', crumb: 'root' }),
    screen('history', 'portal_history', { group: 'dashboard', item: 'history', titleKey: 'title.history' }),
    screen('vote', 'portal_vote', { group: 'voting', item: 'vote', titleKey: 'title.vote' }, 'votes:read'),
    // FQ9: a receipt belongs to one ballot-item participation; the code is shown once (router state)
    screen('vote/receipt/:participationId', 'portal_receipt', {
      group: 'voting',
      item: 'vote',
      titleKey: 'title.receipt',
      crumb: { key: 'crumb.receipt' },
    }),
    screen(
      'vote/:proposalId',
      'portal_proposal',
      { group: 'voting', item: 'vote', titleKey: 'title.proposal', crumb: { key: 'crumb.proposal' } },
      'votes:read',
    ),
    screen('decisions', 'portal_decisions', { group: 'voting', item: 'decisions', titleKey: 'title.decisions' }, 'decisions:read'),
    screen(
      'decisions/:id',
      'portal_amendment',
      { group: 'voting', item: 'decisions', titleKey: 'title.amendment', crumb: { key: 'crumb.amendment' } },
      'decisions:read',
    ),
    screen('results', 'portal_results', { group: 'voting', item: 'results', titleKey: 'title.results' }, 'results:read'),
    screen(
      'results/:id',
      'portal_result',
      { group: 'voting', item: 'results', titleKey: 'title.result', crumb: { key: 'crumb.result' } },
      'results:read',
    ),
    screen('suggest', 'portal_suggest', { group: 'voting', item: 'suggest', titleKey: 'title.suggest' }, 'nominations:create'),
    screen('charter/sign', 'portal_sign', { group: 'charter', item: 'sign', titleKey: 'title.sign' }, 'signatures:read'),
    screen('charter/signed', 'portal_signed', {
      group: 'charter',
      item: 'sign',
      titleKey: 'title.signed',
      crumb: { key: 'crumb.signed' },
    }),
    // scoring is scoped to the reviewer's committee on the server
    screen('reviews', 'portal_reviews', { group: 'reviews', item: 'reviews', titleKey: 'title.reviews' }, 'scoring:read'),
    screen(
      'reviews/:proposalId',
      'portal_score',
      { group: 'reviews', item: 'reviews', titleKey: 'title.score', crumb: { key: 'crumb.score' } },
      'scoring:update',
    ),
    screen('profile', 'portal_profile', { group: 'account', item: 'profile', titleKey: 'title.profile' }),
    screen('privacy', 'portal_privacy', { group: 'account', item: 'privacy', titleKey: 'title.privacy' }),
  ],
};
