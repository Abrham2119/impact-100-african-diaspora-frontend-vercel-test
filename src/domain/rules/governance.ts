import type { ClosedVote, ScoringCriterion, VoteOutcome } from '@/domain/entities/governance.types';

// Voting rules (BUSINESS_RULES "Voting and decisions"): quorum = quorum% of eligible voters,
// rounded up, counted on Yes + No only (abstentions recorded, not counted); no quorum → fails;
// tie → fails; otherwise simple majority of votes cast.

export const quorumNeeded = (eligible: number, quorumPct: number): number => Math.ceil((eligible * quorumPct) / 100);

export function outcomeOf(vote: Pick<ClosedVote, 'eligible' | 'yes' | 'no'>, quorumPct: number): VoteOutcome {
  if (vote.yes + vote.no < quorumNeeded(vote.eligible, quorumPct)) return 'FAILED_NO_QUORUM';
  if (vote.yes === vote.no) return 'FAILED_TIE';
  return vote.yes > vote.no ? 'PASSED' : 'FAILED';
}

/** Weighted committee score: Σ score × weight / 100 (unscored criteria count as 0). */
export const weightedScore = (scores: Array<number | null>, criteria: ScoringCriterion[]): number =>
  criteria.reduce((sum, c, i) => sum + (scores[i] ?? 0) * c.weightPct, 0) / 100;

/** The typed signature matches the account name (case and spacing ignored), as the design checks. */
export const typedNameMatches = (typed: string, fullName: string): boolean => {
  const norm = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  return norm(typed) !== '' && norm(typed) === norm(fullName);
};
