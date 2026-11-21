import type { AdminBallot, AdminBallotRow, BoardRow, PublicationRow } from '@/domain/entities/admin.types';
import type { AdminProposal, Amendment, CharterSignature, Nomination, NominationStatus, ReviewAssignment, ScoringCriterion } from '@/domain/entities/governance.types';
import { AdminError, checkRubric, checkWindow, countsReconcile, windowStatus } from '@/domain/rules/admin';
import { outcomeOf, weightedScore } from '@/domain/rules/governance';
import { BALLOT, PROPOSALS, REVIEWS } from '@/features/governance/fixtures/portal';
import { currentRubric, governanceAdminMockStore, publishedBallotProposals } from '@/features/governance/api/governanceAdminStore';
import { governanceMockStore } from '@/features/governance/api/governanceRepository';
import { NOMINATIONS } from '@/features/governance/fixtures/portal';
import { mockResponse } from '@/infrastructure/api/mock';
import { toCsv } from '@/lib/download';
import { CHAPTER } from '../fixtures/chapter';
import { adminMockStore, recordAudit, today, withProfile } from './adminMockStore';
import { demoDelta } from './chapterFigures';

// Governance in the admin console (backend §4.8 governance admin): ballots, proposals, decisions and
// amendments, result publication, the nominations queue, the signature register, the rubric and the
// review board. Contract for INT-4 + the mock. Outcomes come from the rules engine, never by hand;
// published results and signatures can't be edited; every action is audited.

export interface ProposalInput {
  orgName: string;
  countryKey: string;
  portfolioKey: string;
  budgetCents: number;
  summary: string;
  conflicts: string;
  opensAt: string;
  closesAt: string;
}

export interface DecisionRow {
  id: string;
  title: string;
  opensOn: string;
  closesOn: string;
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED';
}

export interface NominationRow extends Nomination {
  fromName: string;
}

export interface SignatureRow extends CharterSignature {
  memberName: string;
}

export interface AdminGovernanceRepository {
  ballots(): Promise<AdminBallotRow[]>;
  openBallot(id: string): Promise<void>;
  editWindow(input: { id: string; opensOn: string; closesOn: string }): Promise<void>;
  proposal(id: string): Promise<AdminProposal | null>;
  /** saves a draft, or publishes it (published proposals join the grant ballot and the Grants page) */
  saveProposal(input: ProposalInput & { id?: string; publish: boolean }): Promise<AdminProposal>;
  decisions(): Promise<{ decisions: DecisionRow[]; amendments: Amendment[] }>;
  createDecision(input: { title: string; description: string }): Promise<void>;
  /** only after the circulation notice has gone to all members */
  placeOnBallot(amendmentId: string): Promise<void>;
  publications(): Promise<PublicationRow[]>;
  publish(id: string): Promise<void>;
  addNotice(input: { id: string; text: string }): Promise<void>;
  nominations(): Promise<NominationRow[]>;
  setNominationStatus(input: { id: string; status: NominationStatus }): Promise<void>;
  /** an accepted proposal idea becomes a proposal draft */
  convertNomination(id: string): Promise<AdminProposal>;
  signatures(): Promise<SignatureRow[]>;
  exportSignatures(): Promise<string>;
  rubric(): Promise<ScoringCriterion[]>;
  saveRubric(weights: number[]): Promise<void>;
  board(): Promise<BoardRow[]>;
  /** Grants Selection committee members who can review */
  reviewers(): Promise<Array<{ id: string; name: string }>>;
  assignReviewer(input: { proposalId: string; personId: string }): Promise<void>;
  moveToBallot(proposalId: string): Promise<void>;
}

const gov = governanceAdminMockStore;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;
const nameOf = (userId: string) => {
  const person = adminMockStore.read().people.find((p) => p.id === userId);
  return person ? withProfile(person).fullName : '';
};
/** voting-eligible members right now (the live count until a ballot closes) */
const liveEligible = () => Math.max(0, CHAPTER.votingEligible + demoDelta().voting);
const grantBallot = () => gov.read().ballots.find((b) => b.id === BALLOT.key);
const ballotItems = () => [...PROPOSALS, ...publishedBallotProposals()];
const range = (b: Pick<AdminBallot, 'opensOn' | 'closesOn'>) => `${b.opensOn} – ${b.closesOn}`;

/** A ballot for a decision or amendment, in the grant ballot's window. */
const scheduleWithGrantBallot = (subject: AdminBallot['subject'], subjectId: string, title: string): AdminBallot => {
  const grant = grantBallot();
  return {
    id: newId('bl'),
    title,
    subject,
    subjectId,
    opensOn: grant?.opensOn ?? BALLOT.opensOn,
    closesOn: grant?.closesOn ?? BALLOT.closesOn,
    frozenEligible: null,
    status: 'SCHEDULED',
  };
};

function boardRows(): BoardRow[] {
  const reviews = governanceMockStore.read().reviews;
  const criteria = currentRubric();
  const count = (list: ReviewAssignment[], proposalId: string, status?: ReviewAssignment['status']) =>
    list.filter((r) => r.proposalId === proposalId && (status === undefined || r.status === status)).length;
  return gov.read().board.map((base) => {
    const id = base.proposalId;
    const reviewers = base.reviewers + count(reviews, id) - count(REVIEWS, id);
    const submitted = base.submitted + count(reviews, id, 'SUBMITTED') - count(REVIEWS, id, 'SUBMITTED');
    const recused = base.recused + count(reviews, id, 'RECUSED') - count(REVIEWS, id, 'RECUSED');
    const done = submitted > 0 && submitted + recused >= reviewers;
    const scored = reviews.filter((r) => r.proposalId === id && r.status === 'SUBMITTED' && r.scores.every((s) => s !== null));
    const computed = scored.length ? scored.reduce((sum, r) => sum + weightedScore(r.scores, criteria), 0) / scored.length : null;
    return {
      proposalId: id,
      title: ballotItems().find((p) => p.id === id)?.title ?? id,
      reviewers,
      submitted,
      recused,
      weightedTotal: done ? (base.weightedTotal ?? computed) : null,
      status: base.movedToBallot ? 'ON_BALLOT' : done ? 'SCORED' : 'UNDER_REVIEW',
      assignedIds: reviews.filter((r) => r.proposalId === id).map((r) => r.reviewerId),
    };
  });
}

const GRANTS_COMMITTEE = 'grants-selection';
const isReviewer = (personId: string) =>
  adminMockStore.read().people.some((p) => p.id === personId && !p.disabled && p.grants.some((g) => g.role === 'COMMITTEE_MEMBER' && g.scopeId === GRANTS_COMMITTEE));

/** what a nomination moves to from where it is (the queue's buttons) */
const NEXT: Record<NominationStatus, NominationStatus[]> = { SUBMITTED: ['IN_REVIEW'], IN_REVIEW: ['ACCEPTED', 'DECLINED'], ACCEPTED: [], DECLINED: [] };

export const mockAdminGovernanceRepository: AdminGovernanceRepository = {
  ballots: () =>
    mockResponse(() => {
      const live = liveEligible();
      const items = ballotItems().filter((p) => p.ballotKey === BALLOT.key).length;
      return gov.read().ballots.map((b) => ({ ...b, proposals: b.subject === 'PROPOSALS' ? items : 0, eligible: b.frozenEligible ?? live }));
    }),
  openBallot: (id) =>
    mockResponse(() => {
      const ballot = gov.read().ballots.find((b) => b.id === id);
      if (!ballot) throw new AdminError('NOT_FOUND');
      if (ballot.status !== 'SCHEDULED') throw new AdminError('STATE');
      const on = today();
      if (on > ballot.closesOn) throw new AdminError('WINDOW');
      gov.mutate((db) => {
        const b = db.ballots.find((x) => x.id === id);
        if (b) Object.assign(b, { status: 'OPEN', opensOn: on });
      });
      recordAudit({ action: 'ballot.opened', entity: `Ballot · ${ballot.title}`, before: range(ballot), after: `${on} – ${ballot.closesOn}` });
    }),
  editWindow: ({ id, opensOn, closesOn }) =>
    mockResponse(() => {
      const ballot = gov.read().ballots.find((b) => b.id === id);
      if (!ballot) throw new AdminError('NOT_FOUND');
      if (ballot.status !== 'SCHEDULED') throw new AdminError('STATE');
      checkWindow(opensOn, closesOn);
      gov.mutate((db) => {
        const b = db.ballots.find((x) => x.id === id);
        if (b) Object.assign(b, { opensOn, closesOn });
      });
      // a decision closes with its ballot (the portal shows the date)
      if (ballot.subject === 'DECISION' && ballot.subjectId) {
        governanceMockStore.mutate((db) => {
          const d = db.decisions.find((x) => x.id === ballot.subjectId);
          if (d) d.closesOn = closesOn;
        });
      }
      recordAudit({ action: 'ballot.window_changed', entity: `Ballot · ${ballot.title}`, before: range(ballot), after: `${opensOn} – ${closesOn}` });
    }),
  proposal: (id) => mockResponse(() => gov.read().proposals.find((p) => p.id === id) ?? null),
  saveProposal: ({ id, publish, ...input }) =>
    mockResponse(() => {
      if (!input.orgName.trim() || !input.summary.trim()) throw new AdminError('REQUIRED');
      if (!Number.isFinite(input.budgetCents) || input.budgetCents <= 0) throw new AdminError('AMOUNT');
      if (input.opensAt && input.closesAt && input.closesAt <= input.opensAt) throw new AdminError('WINDOW');
      const existing = id ? gov.read().proposals.find((p) => p.id === id) : undefined;
      if (existing?.status === 'PUBLISHED') throw new AdminError('STATE');
      const record: AdminProposal = {
        id: existing?.id ?? newId('pp'),
        ...input,
        orgName: input.orgName.trim(),
        summary: input.summary.trim(),
        conflicts: input.conflicts.trim(),
        status: publish ? 'PUBLISHED' : 'DRAFT',
        createdOn: existing?.createdOn ?? today(),
        fromNominationId: existing?.fromNominationId ?? null,
      };
      gov.mutate((db) => {
        const index = db.proposals.findIndex((p) => p.id === record.id);
        if (index >= 0) db.proposals[index] = record;
        else db.proposals.unshift(record);
        // a published proposal goes to the review board
        if (publish && !db.board.some((b) => b.proposalId === record.id)) db.board.push({ proposalId: record.id, reviewers: 0, submitted: 0, recused: 0, weightedTotal: null, movedToBallot: false });
      });
      recordAudit({ action: publish ? 'proposal.published' : 'proposal.draft_saved', entity: `Proposal · ${record.orgName}` });
      return record;
    }),
  decisions: () =>
    mockResponse(() => {
      const { decisions, amendments } = governanceMockStore.read();
      const ballots = gov.read().ballots;
      const opens = grantBallot()?.opensOn ?? BALLOT.opensOn;
      const on = today();
      return {
        decisions: decisions.map((d) => {
          const ballot = ballots.find((b) => b.subject === 'DECISION' && b.subjectId === d.id);
          const opensOn = ballot?.opensOn ?? opens;
          const closesOn = ballot?.closesOn ?? d.closesOn;
          return { id: d.id, title: d.title, opensOn, closesOn, status: windowStatus(opensOn, closesOn, on) };
        }),
        amendments,
      };
    }),
  createDecision: ({ title, description }) =>
    mockResponse(() => {
      if (title.trim().length < 3 || !description.trim()) throw new AdminError('REQUIRED');
      const ballot = scheduleWithGrantBallot('DECISION', newId('d'), title.trim());
      governanceMockStore.mutate((db) => void db.decisions.push({ id: ballot.subjectId ?? '', title: title.trim(), description: description.trim(), closesOn: ballot.closesOn, votes: {} }));
      gov.mutate((db) => void db.ballots.push(ballot));
      recordAudit({ action: 'decision.created', entity: `Decision · ${title.trim()}` });
    }),
  placeOnBallot: (amendmentId) =>
    mockResponse(() => {
      const amendment = governanceMockStore.read().amendments.find((a) => a.id === amendmentId);
      if (!amendment) throw new AdminError('NOT_FOUND');
      if (amendment.status !== 'CIRCULATING') throw new AdminError('STATE');
      if (!amendment.circulatedOn) throw new AdminError('NOT_CIRCULATED');
      const title = amendment.changeShort ?? amendment.change.replace(/\.$/, '');
      governanceMockStore.mutate((db) => {
        const a = db.amendments.find((x) => x.id === amendmentId);
        if (a) a.status = 'ON_BALLOT';
      });
      gov.mutate((db) => void db.ballots.push(scheduleWithGrantBallot('AMENDMENT', amendmentId, title)));
      recordAudit({ action: 'amendment.placed_on_ballot', entity: `Amendment · ${amendment.sectionShort ?? amendment.section}`, after: title });
    }),
  publications: () => mockResponse(() => gov.read().publications.map((p) => ({ ...p, outcome: outcomeOf(p, p.quorumPct) }))),
  publish: (id) =>
    mockResponse(() => {
      const pub = gov.read().publications.find((p) => p.id === id);
      if (!pub) throw new AdminError('NOT_FOUND');
      if (pub.status !== 'READY') throw new AdminError('STATE');
      if (!countsReconcile(pub)) throw new AdminError('COUNTS');
      const on = today();
      gov.mutate((db) => {
        const p = db.publications.find((x) => x.id === id);
        if (p) Object.assign(p, { status: 'PUBLISHED', publishedOn: on });
        const b = pub.ballotId ? db.ballots.find((x) => x.id === pub.ballotId) : undefined;
        if (b) Object.assign(b, { status: 'PUBLISHED', frozenEligible: b.frozenEligible ?? pub.eligible });
      });
      recordAudit({ action: 'result.published', entity: `Result · ${pub.title}`, after: outcomeOf(pub, pub.quorumPct) });
    }),
  addNotice: ({ id, text }) =>
    mockResponse(() => {
      const pub = gov.read().publications.find((p) => p.id === id);
      if (!pub) throw new AdminError('NOT_FOUND');
      if (pub.status !== 'PUBLISHED' || pub.notice) throw new AdminError('STATE');
      if (text.trim().length < 10) throw new AdminError('REQUIRED');
      gov.mutate((db) => {
        const p = db.publications.find((x) => x.id === id);
        if (p) Object.assign(p, { notice: text.trim(), noticeOn: today() });
      });
      recordAudit({ action: 'result.notice_added', entity: `Result · ${pub.title}`, after: text.trim() });
    }),
  nominations: () => mockResponse(() => governanceMockStore.read().nominations.map((n) => ({ ...n, fromName: n.submitterName ?? nameOf(n.userId) }))),
  setNominationStatus: ({ id, status }) =>
    mockResponse(() => {
      const nomination = governanceMockStore.read().nominations.find((n) => n.id === id);
      if (!nomination) throw new AdminError('NOT_FOUND');
      if (!NEXT[nomination.status].includes(status)) throw new AdminError('STATE');
      governanceMockStore.mutate((db) => {
        const n = db.nominations.find((x) => x.id === id);
        if (n) n.status = status;
      });
      recordAudit({ action: 'nomination.status_changed', entity: `Nomination · ${nomination.title}`, subjectId: nomination.userId, before: nomination.status, after: status });
    }),
  convertNomination: (id) =>
    mockResponse(() => {
      const nomination = governanceMockStore.read().nominations.find((n) => n.id === id);
      if (!nomination) throw new AdminError('NOT_FOUND');
      if (nomination.type !== 'PROPOSAL' || nomination.status !== 'ACCEPTED') throw new AdminError('STATE');
      const existing = nomination.draftProposalId ? gov.read().proposals.find((p) => p.id === nomination.draftProposalId) : undefined;
      if (existing) return existing;
      const draft: AdminProposal = {
        id: newId('pp'),
        orgName: nomination.title,
        countryKey: nomination.countryKey ?? '',
        portfolioKey: '',
        budgetCents: 0,
        summary: nomination.description ?? '',
        conflicts: '',
        opensAt: '',
        closesAt: '',
        status: 'DRAFT',
        createdOn: today(),
        fromNominationId: id,
      };
      gov.mutate((db) => void db.proposals.unshift(draft));
      governanceMockStore.mutate((db) => {
        const n = db.nominations.find((x) => x.id === id);
        if (n) n.draftProposalId = draft.id;
      });
      recordAudit({ action: 'nomination.converted', entity: `Nomination · ${nomination.title}`, subjectId: nomination.userId });
      return draft;
    }),
  signatures: () =>
    mockResponse(() =>
      governanceMockStore
        .read()
        .signatures.map((s) => ({ ...s, memberName: nameOf(s.userId) || s.typedName }))
        .sort((a, b) => b.signedAt.localeCompare(a.signedAt)),
    ),
  exportSignatures: () =>
    mockResponse(() => {
      const rows = governanceMockStore.read().signatures.map((s) => [nameOf(s.userId) || s.typedName, s.typedName, s.version, s.signedAt, s.ip]);
      recordAudit({ action: 'export.created', entity: `Signatures · ${rows.length} rows` });
      return toCsv([['member', 'typed_name', 'charter', 'signed', 'ip'], ...rows]);
    }),
  rubric: () => mockResponse(() => currentRubric()),
  saveRubric: (weights) =>
    mockResponse(() => {
      checkRubric(weights);
      const before = currentRubric();
      gov.mutate((db) => {
        db.rubric = db.rubric.map((c, i) => ({ ...c, weightPct: weights[i] ?? c.weightPct }));
      });
      recordAudit({ action: 'rubric.updated', entity: 'Rubric weightings', before: before.map((c) => c.weightPct).join(' / '), after: weights.join(' / ') });
    }),
  board: () => mockResponse(boardRows),
  reviewers: () =>
    mockResponse(() =>
      adminMockStore
        .read()
        .people.filter((p) => isReviewer(p.id))
        .map((p) => ({ id: p.id, name: withProfile(p).fullName })),
    ),
  assignReviewer: ({ proposalId, personId }) =>
    mockResponse(() => {
      const row = boardRows().find((r) => r.proposalId === proposalId);
      if (!row) throw new AdminError('NOT_FOUND');
      if (row.status !== 'UNDER_REVIEW') throw new AdminError('STATE');
      if (!isReviewer(personId)) throw new AdminError('NOT_FOUND');
      if (row.assignedIds.includes(personId)) throw new AdminError('ALREADY_ASSIGNED');
      const dueOn = governanceMockStore.read().reviews.find((r) => r.proposalId === proposalId)?.dueOn ?? REVIEWS[0].dueOn;
      governanceMockStore.mutate(
        (db) => void db.reviews.push({ reviewerId: personId, proposalId, dueOn, status: 'NOT_STARTED', scores: currentRubric().map(() => null), comment: '' }),
      );
      recordAudit({ action: 'review.assigned', entity: `Proposal · ${row.title}`, subjectId: personId, after: nameOf(personId) });
    }),
  moveToBallot: (proposalId) =>
    mockResponse(() => {
      const row = boardRows().find((r) => r.proposalId === proposalId);
      if (!row) throw new AdminError('NOT_FOUND');
      if (row.status !== 'SCORED') throw new AdminError('STATE');
      gov.mutate((db) => {
        const b = db.board.find((x) => x.proposalId === proposalId);
        if (b) b.movedToBallot = true;
      });
      recordAudit({ action: 'proposal.moved_to_ballot', entity: `Proposal · ${row.title}` });
    }),
};

/** Seeded nominations in review (the dashboard's "nominations in review" moves from the design's figure). */
export const SEED_NOMINATIONS_IN_REVIEW = NOMINATIONS.filter((n) => n.status === 'IN_REVIEW').length;

/** The governance admin repository of the configured data source (INT-4 adds the HTTP implementation). */
export const adminGovernanceRepository: AdminGovernanceRepository = mockAdminGovernanceRepository;
