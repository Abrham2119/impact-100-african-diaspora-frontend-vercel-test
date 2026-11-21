import type {
  Amendment,
  Ballot,
  BallotProposal,
  CharterSignature,
  ClosedVote,
  Comment,
  CycleFinancials,
  Decision,
  Nomination,
  NominationType,
  Participation,
  ReviewAssignment,
  ScoringCriterion,
  VoteChoice,
} from '@/domain/entities/governance.types';
import { summarizeMembership } from '@/domain/rules/membership';
import { typedNameMatches } from '@/domain/rules/governance';
import { membershipMockStore } from '@/features/membership/api/memberRepository';
import { settingsService } from '@/features/membership/api/settingsService';
import { profileMockStore } from '@/features/profile/api/profileRepository';
import { mockResponse } from '@/infrastructure/api/mock';
import { currentMockUserId } from '@/infrastructure/mock/currentUser';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { currentBallot, currentRubric, publishedBallotProposals } from './governanceAdminStore';
import {
  AMENDMENTS,
  BALLOT,
  CHARTER_SECTIONS,
  CHARTER_VERSION,
  CLOSED_VOTES,
  COMMENTS,
  DECISIONS,
  FINANCIALS,
  NOMINATIONS,
  NOMINATION_LIMIT,
  PARTICIPATIONS,
  PROPOSALS,
  REVIEWS,
  SIGNATURES,
  receiptFor,
} from '../fixtures/portal';

// Portal governance (backend §4.8): ballot + proposals + votes, decisions, amendments, comments,
// results, nominations, charter signing, committee reviews. Contract for INT-3 + the mock on the
// persisted mock store. Rules the server enforces are enforced here too (eligibility, one ballot per
// item, ≥10-character amendments, nomination limit, signing lock, typed-name match).

export type GovernanceErrorCode = 'NOT_ELIGIBLE' | 'ALREADY_VOTED' | 'TOO_SHORT' | 'LIMIT_REACHED' | 'LOCKED' | 'NAME_MISMATCH' | 'INCOMPLETE';
export class GovernanceError extends Error {
  constructor(public readonly code: GovernanceErrorCode) {
    super(code);
    this.name = 'GovernanceError';
  }
}

export interface BallotView {
  ballot: Ballot;
  proposals: BallotProposal[];
  /** my participations (that I voted + receipt), by proposal id */
  mine: Record<string, Participation>;
  yesNo: number;
  abstain: number;
}

export interface ReviewsView {
  criteria: ScoringCriterion[];
  assignments: Array<ReviewAssignment & { proposal: BallotProposal }>;
}

export interface GovernanceRepository {
  ballot(): Promise<BallotView>;
  proposal(id: string): Promise<BallotProposal | null>;
  castVote(input: { proposalId: string; choice: VoteChoice }): Promise<Participation>;
  /** my participation on a proposal (route id = proposal id, ARCHITECTURE FQ9: the code is not in the URL) */
  participation(proposalId: string): Promise<(Participation & { proposal: BallotProposal }) | null>;
  comments(targetId: string): Promise<Comment[]>;
  postComment(input: { targetId: string; text: string }): Promise<Comment>;
  decisions(): Promise<Array<Decision & { myVote: VoteChoice | null }>>;
  voteDecision(input: { decisionId: string; choice: VoteChoice }): Promise<void>;
  amendments(): Promise<Amendment[]>;
  /** the charter's numbered sections (the amendment form's choices) */
  charterSections(): Promise<string[]>;
  amendment(id: string): Promise<Amendment | null>;
  proposeAmendment(input: { section: string; text: string }): Promise<Amendment>;
  results(): Promise<{ financials: CycleFinancials; votes: ClosedVote[] }>;
  result(id: string): Promise<ClosedVote | null>;
  nominations(): Promise<{ mine: Nomination[]; limit: number }>;
  submitNomination(input: { type: NominationType; title: string; countryKey: string | null; description: string; contact?: string }): Promise<Nomination>;
  signature(): Promise<{ signature: CharterSignature | null; version: string }>;
  signCharter(input: { typedName: string }): Promise<CharterSignature>;
  reviews(): Promise<ReviewsView>;
  saveReview(input: { proposalId: string; scores: Array<number | null>; comment: string; submit: boolean }): Promise<void>;
  recuse(proposalId: string): Promise<void>;
}

const store = createMockStore('governance', () => ({
  participations: PARTICIPATIONS,
  /** anonymous tallies of the votes cast in the demo, by proposal id */
  tallies: {} as Record<string, Record<VoteChoice, number>>,
  comments: COMMENTS,
  decisions: DECISIONS,
  amendments: AMENDMENTS,
  nominations: NOMINATIONS,
  signatures: SIGNATURES,
  reviews: REVIEWS,
}));

/** The grant ballot's items: the design's proposals, then the ones published in the admin console. */
const ballotProposals = (): BallotProposal[] => [...PROPOSALS, ...publishedBallotProposals()];
const today = () => new Date().toISOString().slice(0, 10);
const me = () => {
  const id = currentMockUserId();
  if (!id) throw new GovernanceError('NOT_ELIGIBLE');
  return id;
};
const membershipOf = (userId: string) => {
  const record = membershipMockStore.read().memberships.find((m) => m.userId === userId);
  return record ? summarizeMembership(record, settingsService.seed()) : null;
};
const profileOf = (userId: string) => profileMockStore.read().profiles.find((p) => p.userId === userId);
/** "Amara M." · "Incubator" — how the design shows comment authors */
const authorOf = (userId: string) => {
  const name = profileOf(userId)?.fullName ?? '';
  const [first = '', last = ''] = name.split(' ');
  const levelKey = membershipOf(userId)?.levelKey;
  return { authorName: last ? `${first} ${last[0]}.` : first, authorLevel: levelKey ? levelKey[0].toUpperCase() + levelKey.slice(1) : '' };
};

export const mockGovernanceRepository: GovernanceRepository = {
  ballot: () =>
    mockResponse(() => {
      const db = store.read();
      const userId = currentMockUserId();
      const extra = Object.values(db.tallies);
      return {
        // an open ballot is counted under the charter settings in force (closed votes keep theirs)
        ballot: { ...currentBallot(), quorumPct: settingsService.seed().quorumPct },
        proposals: ballotProposals(),
        mine: Object.fromEntries(db.participations.filter((p) => p.userId === userId).map((p) => [p.proposalId, p])),
        yesNo: BALLOT.baseYesNo + extra.reduce((sum, t) => sum + t.YES + t.NO, 0),
        abstain: BALLOT.baseAbstain + extra.reduce((sum, t) => sum + t.ABSTAIN, 0),
      };
    }),
  proposal: (id) => mockResponse(() => ballotProposals().find((p) => p.id === id) ?? null),
  castVote: ({ proposalId, choice }) =>
    mockResponse(() => {
      const userId = me();
      if (!membershipOf(userId)?.votingEligible) throw new GovernanceError('NOT_ELIGIBLE');
      if (store.read().participations.some((p) => p.userId === userId && p.proposalId === proposalId)) throw new GovernanceError('ALREADY_VOTED');
      const index = ballotProposals().findIndex((p) => p.id === proposalId);
      const participation: Participation = { userId, proposalId, receipt: receiptFor(Math.max(0, index)), castOn: today() };
      store.mutate((db) => {
        db.participations.push(participation);
        const tally = (db.tallies[proposalId] ??= { YES: 0, NO: 0, ABSTAIN: 0 });
        tally[choice] += 1;
      });
      return participation;
    }),
  participation: (id) =>
    mockResponse(() => {
      const p = store.read().participations.find((x) => x.proposalId === id && x.userId === currentMockUserId());
      const proposal = p && ballotProposals().find((x) => x.id === p.proposalId);
      return p && proposal ? { ...p, proposal } : null;
    }),
  comments: (targetId) => mockResponse(() => store.read().comments.filter((c) => c.targetId === targetId)),
  postComment: ({ targetId, text }) =>
    mockResponse(() => {
      const comment: Comment = { id: `c-${Date.now()}`, targetId, ...authorOf(me()), text: text.trim() };
      store.mutate((db) => void db.comments.push(comment));
      return comment;
    }),
  decisions: () =>
    mockResponse(() => {
      const userId = currentMockUserId() ?? '';
      return store.read().decisions.map((d) => ({ ...d, myVote: d.votes[userId] ?? null }));
    }),
  voteDecision: ({ decisionId, choice }) =>
    mockResponse(() => {
      const userId = me();
      if (!membershipOf(userId)?.votingEligible) throw new GovernanceError('NOT_ELIGIBLE');
      store.mutate((db) => {
        const decision = db.decisions.find((d) => d.id === decisionId);
        if (decision) decision.votes[userId] = choice;
      });
    }),
  amendments: () => mockResponse(() => store.read().amendments),
  charterSections: () => mockResponse(() => CHARTER_SECTIONS),
  amendment: (id) => mockResponse(() => store.read().amendments.find((a) => a.id === id) ?? null),
  proposeAmendment: ({ section, text }) =>
    mockResponse(() => {
      const userId = me();
      if (text.trim().length < 10) throw new GovernanceError('TOO_SHORT');
      const amendment: Amendment = { id: `a-${Date.now()}`, section, change: text.trim(), status: 'CIRCULATING', ...authorOf(userId), circulatedOn: today() };
      store.mutate((db) => void db.amendments.unshift(amendment));
      return amendment;
    }),
  results: () => mockResponse(() => ({ financials: FINANCIALS, votes: CLOSED_VOTES })),
  result: (id) => mockResponse(() => CLOSED_VOTES.find((v) => v.id === id) ?? null),
  nominations: () => mockResponse(() => ({ mine: store.read().nominations.filter((n) => n.userId === currentMockUserId()), limit: NOMINATION_LIMIT })),
  submitNomination: (input) =>
    mockResponse(() => {
      const userId = me();
      const mine = store.read().nominations.filter((n) => n.userId === userId);
      if (mine.length >= NOMINATION_LIMIT) throw new GovernanceError('LIMIT_REACHED');
      if (!input.title.trim() || input.description.trim().length < 20) throw new GovernanceError('TOO_SHORT');
      const nomination: Nomination = {
        id: `n-${Date.now()}`,
        userId,
        type: input.type,
        title: input.title.trim(),
        countryKey: input.type === 'PRIORITY' ? null : input.countryKey,
        description: input.description.trim(),
        ...(input.contact ? { contact: input.contact } : {}),
        status: 'SUBMITTED',
        reviewerNote: null,
      };
      store.mutate((db) => void db.nominations.unshift(nomination));
      return nomination;
    }),
  signature: () =>
    mockResponse(() => ({ signature: store.read().signatures.find((s) => s.userId === currentMockUserId()) ?? null, version: CHARTER_VERSION })),
  signCharter: ({ typedName }) =>
    mockResponse(() => {
      const userId = me();
      if (!membershipOf(userId)?.charterUnlocked) throw new GovernanceError('LOCKED');
      if (!typedNameMatches(typedName, profileOf(userId)?.fullName ?? '')) throw new GovernanceError('NAME_MISMATCH');
      const now = new Date();
      const signature: CharterSignature = {
        userId,
        typedName: typedName.trim().replace(/\s+/g, ' '),
        signedAt: now.toISOString(),
        version: CHARTER_VERSION,
        ip: '203.0.113.24',
      };
      store.mutate((db) => void db.signatures.push(signature));
      return signature;
    }),
  reviews: () =>
    mockResponse(() => ({
      criteria: currentRubric(),
      assignments: store
        .read()
        .reviews.filter((r) => r.reviewerId === currentMockUserId())
        .flatMap((r) => {
          const proposal = ballotProposals().find((p) => p.id === r.proposalId);
          return proposal ? [{ ...r, proposal }] : [];
        }),
    })),
  saveReview: ({ proposalId, scores, comment, submit }) =>
    mockResponse(() => {
      const userId = me();
      if (submit && scores.some((s) => s === null)) throw new GovernanceError('INCOMPLETE');
      store.mutate((db) => {
        const review = db.reviews.find((r) => r.reviewerId === userId && r.proposalId === proposalId);
        if (!review || review.status === 'SUBMITTED' || review.status === 'RECUSED') return;
        review.scores = scores;
        review.comment = comment;
        review.status = submit ? 'SUBMITTED' : 'IN_PROGRESS';
      });
    }),
  recuse: (proposalId) =>
    mockResponse(() => {
      const userId = me();
      store.mutate((db) => {
        const review = db.reviews.find((r) => r.reviewerId === userId && r.proposalId === proposalId);
        if (review && review.status !== 'SUBMITTED') review.status = 'RECUSED';
      });
    }),
};

/** The governance repository of the configured data source (INT-3 adds the HTTP implementation). */
export const governanceRepository: GovernanceRepository = mockGovernanceRepository;
export const governanceMockStore = store;
