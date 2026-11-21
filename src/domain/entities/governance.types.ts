// Governance as members see it in the portal (backend §4.8): the current ballot, proposals,
// decisions, amendments, published results, nominations, charter signatures and committee reviews.
// Framework-free. Who voted is stored apart from what they chose (ballot secrecy, BUSINESS_RULES).

export type VoteChoice = 'YES' | 'NO' | 'ABSTAIN';

export interface Ballot {
  key: string;
  /** ISO date + display time (ET) */
  opensOn: string;
  opensTime: string;
  closesOn: string;
  closesTime: string;
  /** eligible voters, frozen at close */
  eligibleCount: number;
  quorumPct: number;
  /** Yes/No votes and abstentions cast by other members (sample) */
  baseYesNo: number;
  baseAbstain: number;
}

export interface ProposalDetail {
  submittedBy: string;
  publishedOn: string;
  committeeScore: string;
  reviewers: number;
  reach: string;
  reachNote: string;
  description: string;
  budgetLines: Array<{ item: string; amountCents: number }>;
  rubric: Array<{ criterion: string; score: number }>;
  conflictsNote: string;
}

export interface BallotProposal {
  id: string;
  ballotKey: string;
  countryKey: string;
  portfolioKey: string;
  title: string;
  budgetCents: number;
  summary: string;
  conflicts: string;
  detail?: ProposalDetail;
}

/** That a member voted on an item (never what they chose) + the receipt code shown to them. */
export interface Participation {
  userId: string;
  proposalId: string;
  receipt: string;
  castOn: string;
}

export interface Comment {
  id: string;
  targetId: string;
  authorName: string;
  authorLevel: string;
  text: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  closesOn: string;
  /** member id → choice (decision votes can be changed until close, as in the design) */
  votes: Record<string, VoteChoice>;
}

export type AmendmentStatus = 'CIRCULATING' | 'ON_BALLOT' | 'ADOPTED' | 'REJECTED';

export interface Amendment {
  id: string;
  section: string;
  /** the one-line change (tables, detail heading) */
  change: string;
  /** charter wording before / after (the detail page's diff), when known */
  currentText?: string;
  proposedText?: string;
  status: AmendmentStatus;
  authorName?: string;
  authorLevel?: string;
  circulatedOn?: string;
}

export interface ClosedVote {
  id: string;
  title: string;
  eligible: number;
  yes: number;
  no: number;
  abstain: number;
  publishedOn: string;
  settingsVersion: string;
  /** the quorum of that settings version — later settings never change a published result */
  quorumPct: number;
}

export interface CycleFinancials {
  cycle: string;
  pledgedCents: number;
  receivedCents: number;
  donationsCents: number;
  donationsNote: string;
  grantedCents: number;
  partners: number;
}

export type NominationType = 'PRIORITY' | 'NOMINEE' | 'PROPOSAL';
export type NominationStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ACCEPTED' | 'DECLINED';

export interface Nomination {
  id: string;
  userId: string;
  type: NominationType;
  title: string;
  countryKey: string | null;
  description?: string;
  contact?: string;
  status: NominationStatus;
  reviewerNote: string | null;
}

export interface CharterSignature {
  userId: string;
  typedName: string;
  /** display date + time (ET) */
  signedAt: string;
  version: string;
  ip: string;
}

export type ReviewStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'RECUSED';

export interface ReviewAssignment {
  reviewerId: string;
  proposalId: string;
  dueOn: string;
  status: ReviewStatus;
  scores: Array<number | null>;
  comment: string;
}

export interface ScoringCriterion {
  name: string;
  weightPct: number;
}

export type VoteOutcome = 'PASSED' | 'FAILED_NO_QUORUM' | 'FAILED_TIE' | 'FAILED';
