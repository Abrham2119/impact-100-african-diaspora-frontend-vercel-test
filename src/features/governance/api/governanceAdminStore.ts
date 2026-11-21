import type { AdminBallot, BoardBaseline, ResultPublication } from '@/domain/entities/admin.types';
import type { AdminProposal, Ballot, BallotProposal, ScoringCriterion } from '@/domain/entities/governance.types';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import type { PublicProposalDto } from '@/types/governance.dto';
import { BALLOTS, BOARD, PUBLICATIONS } from '../fixtures/admin';
import { BALLOT, SCORING_CRITERIA } from '../fixtures/portal';

// What the admin console sets for governance and the portal / public site read (FE-10): ballot
// windows (the grant ballot's is the portal's), proposals written in the console (published ones join
// the grant ballot and the Grants page's "Under review"), the rubric weightings the committee scores
// with, result publications and the review board. (Part B: governance admin endpoints.)
export const governanceAdminMockStore = createMockStore('governance-admin', () => ({
  ballots: BALLOTS as AdminBallot[],
  proposals: [] as AdminProposal[],
  rubric: SCORING_CRITERIA as ScoringCriterion[],
  publications: PUBLICATIONS as ResultPublication[],
  board: BOARD as BoardBaseline[],
}));

/** The portal's grant ballot with the window set in the admin console. */
export function currentBallot(): Ballot {
  const grant = governanceAdminMockStore.read().ballots.find((b) => b.id === BALLOT.key);
  return grant ? { ...BALLOT, opensOn: grant.opensOn, closesOn: grant.closesOn } : BALLOT;
}

const published = () => governanceAdminMockStore.read().proposals.filter((p) => p.status === 'PUBLISHED');

/** Published console proposals as ballot items of the current grant ballot. */
export const publishedBallotProposals = (): BallotProposal[] =>
  published().map((p) => ({
    id: p.id,
    ballotKey: BALLOT.key,
    countryKey: p.countryKey,
    portfolioKey: p.portfolioKey,
    title: p.orgName,
    budgetCents: p.budgetCents,
    summary: p.summary,
    conflicts: p.conflicts,
  }));

/** Published console proposals in the shape of `GET proposals/public`. */
export const publishedPublicProposals = (): PublicProposalDto[] =>
  published().map((p) => ({ id: p.id, title: p.orgName, country_key: p.countryKey, portfolio_key: p.portfolioKey, budget_cents: p.budgetCents }));

/** The rubric in force (the committee's weightings). */
export const currentRubric = (): ScoringCriterion[] => governanceAdminMockStore.read().rubric;
