import type { AdminBallot, BoardBaseline, ResultPublication } from '@/domain/entities/admin.types';
import { BALLOT, CLOSED_VOTES } from './portal';

// Governance as the admin console runs it (admin_ballots, admin_publish, admin_review_board
// .dc.html), verbatim. The grant ballot's window is the portal's (BALLOT); published counts are the
// portal results' (CLOSED_VOTES).

export const BALLOTS: AdminBallot[] = [
  { id: BALLOT.key, title: 'Grant ballot 2026–27', subject: 'PROPOSALS', subjectId: null, opensOn: BALLOT.opensOn, closesOn: BALLOT.closesOn, frozenEligible: null, status: 'SCHEDULED' },
  { id: 'work-plan-2026-27', title: 'Adopt the 2026–27 work plan', subject: 'DECISION', subjectId: 'd-work-plan', opensOn: BALLOT.opensOn, closesOn: BALLOT.closesOn, frozenEligible: null, status: 'SCHEDULED' },
  { id: 'november-installments', title: 'Installments from November', subject: 'AMENDMENT', subjectId: 'a-november-installments', opensOn: '2026-01-05', closesOn: '2026-01-19', frozenEligible: 84, status: 'PUBLISHED' },
];

const counts = (id: string) => {
  const v = CLOSED_VOTES.find((c) => c.id === id);
  if (!v) throw new Error(`unknown closed vote ${id}`);
  return { eligible: v.eligible, yes: v.yes, no: v.no, abstain: v.abstain, participations: v.yes + v.no + v.abstain, quorumPct: v.quorumPct };
};

export const PUBLICATIONS: ResultPublication[] = [
  { id: 'pub-grant-2025-26', ballotId: null, title: 'Grant ballot 2025–26', ...counts('r-grant-2025-26'), status: 'READY', publishedOn: null, notice: null, noticeOn: null },
  { id: 'pub-november-installments', ballotId: 'november-installments', title: 'Installments from November', ...counts('r-november-installments'), status: 'PUBLISHED', publishedOn: '2026-01-20', notice: null, noticeOn: null },
  { id: 'pub-agm-online', ballotId: null, title: 'Move the AGM online', ...counts('r-agm-online'), status: 'PUBLISHED', publishedOn: '2026-01-20', notice: null, noticeOn: null },
];

/** The review board before the demo's reviews (Amara's assignments are part of these figures). */
export const BOARD: BoardBaseline[] = [
  { proposalId: 'kenya-youth-digital-skills', reviewers: 3, submitted: 3, recused: 0, weightedTotal: 4.3, movedToBallot: false },
  { proposalId: 'ghana-community-health', reviewers: 3, submitted: 1, recused: 1, weightedTotal: null, movedToBallot: false },
  { proposalId: 'zambia-women-agribusiness', reviewers: 2, submitted: 0, recused: 0, weightedTotal: null, movedToBallot: false },
];

/** Score scale and reviewers per proposal (admin_rubric "Scale and reviewers"). */
export const SCORE_SCALE = { min: 1, max: 5 } as const;
export const MIN_REVIEWERS = 2;
