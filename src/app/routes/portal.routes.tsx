import type { RouteObject } from 'react-router-dom';
import { PortalShell } from '@/app/layouts/PortalShell';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { PermissionRoute } from '@/app/guards/PermissionRoute';
import { RoutePending } from '@/app/guards/RoutePending';
import type { ShellRouteMeta } from '@/config/navigation/types';
import type { Permission } from '@/domain/enums/permission.enum';
import type { ComponentType } from 'react';
import { ScreenPlaceholder } from '@/pages/ScreenPlaceholder';
import { AmendmentPage } from '@/features/portal/components/AmendmentPage';
import { DashboardPage } from '@/features/portal/components/DashboardPage';
import { DecisionsPage } from '@/features/portal/components/DecisionsPage';
import { HistoryPage } from '@/features/portal/components/HistoryPage';
import { ProposalPage } from '@/features/portal/components/ProposalPage';
import { ReceiptPage } from '@/features/portal/components/ReceiptPage';
import { ResultPage } from '@/features/portal/components/ResultPage';
import { ResultsPage } from '@/features/portal/components/ResultsPage';
import { ReviewsPage } from '@/features/portal/components/ReviewsPage';
import { ScorePage } from '@/features/portal/components/ScorePage';
import { SignedPage } from '@/features/portal/components/SignedPage';
import { SignPage } from '@/features/portal/components/SignPage';
import { SuggestPage } from '@/features/portal/components/SuggestPage';
import { VotePage } from '@/features/portal/components/VotePage';
import { PATHS } from './paths';

// The built screens by design screen name (FE-8); the rest keep the placeholder until their batch lands.
const PAGES: Record<string, ComponentType> = {
  portal: DashboardPage,
  portal_history: HistoryPage,
  portal_vote: VotePage,
  portal_proposal: ProposalPage,
  portal_receipt: ReceiptPage,
  portal_decisions: DecisionsPage,
  portal_amendment: AmendmentPage,
  portal_results: ResultsPage,
  portal_result: ResultPage,
  portal_suggest: SuggestPage,
  portal_sign: SignPage,
  portal_signed: SignedPage,
  portal_reviews: ReviewsPage,
  portal_score: ScorePage,
};

// /portal/* — member portal, screens 40–55 (ARCHITECTURE.md §4). Signed-in users only;
// some pages also need a grant. Business-rule gates (voting eligibility, the signing lock,
// a closed ballot) are NOT route guards: those pages render the design's locked state from
// the API. `group`/`item` select the rail group and sidebar item, as in each snapshot.

type Meta = Omit<ShellRouteMeta<'portal'>, 'namespace'>;

const screen = (path: string | undefined, name: string, meta: Meta, permission?: Permission): RouteObject => {
  const Page = PAGES[name] ?? ScreenPlaceholder;
  const element = permission ? (
    <PermissionRoute require={permission} fallback={PATHS.portal.dashboard}>
      <Page />
    </PermissionRoute>
  ) : (
    <Page />
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
