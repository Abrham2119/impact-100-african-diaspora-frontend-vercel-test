// The admin console's data (admin*.dc.html, BUSINESS_RULES "Admin"). Framework-free.
import type { ChapterRole } from '@/domain/enums/role.enum';
import type { VoteOutcome } from '@/domain/entities/governance.types';

// ── People ────────────────────────────────────────────────────────────────────────────────────

/** A role grant on a person: who granted it (null = automatic) and since when. */
export interface RoleGrant extends ChapterRole {
  grantedBy: string | null;
  grantedOn: string;
}

/** Supporter labels that are not roles (derived from gifts and sign-ups; admin_people "Donor · Volunteer"). */
export type SupporterTag = 'DONOR' | 'VOLUNTEER';

/** One record per email across donors, members, volunteers and staff. */
export interface Person {
  id: string;
  fullName: string;
  email: string;
  usHubKey: string | null;
  joinedOn: string;
  grants: RoleGrant[];
  tags: SupporterTag[];
  /** linked to a WAZIImpact.org account (SSO) */
  waziLinked: boolean;
  disabled: boolean;
  /** shown in the People list (the design lists the chapter's people; ledger-only names are not) */
  listed: boolean;
}

/** A line of a person's recent activity (admin_person). */
export interface PersonActivity {
  date: string;
  /** UiString key under `activity.*` and its values */
  kind: 'PAYMENT' | 'COMMENT' | 'ROLE_GRANTED' | 'ROLE_REVOKED' | 'ACCESS_DISABLED' | 'OFFLINE_PAYMENT';
  values: Record<string, string>;
}

/** The People list row: the person plus what is computed from the ledger. */
export interface PersonRow extends Person {
  levelKey: string | null;
  votingEligible: boolean;
  isMember: boolean;
}

export interface PersonDetail extends PersonRow {
  avatarFile: string | null;
  receivedCents: number;
  pledgeLevelKey: string | null;
  pledgeCents: number;
  installmentCount: number;
  africanHubKey: string | null;
  portfolioKey: string | null;
  activity: PersonActivity[];
}

/** An assignable role and how many people hold it (admin_roles). */
export interface RoleSummary {
  role: ChapterRole['role'];
  people: number;
  twoFactor: boolean;
}

// ── Permission matrix ────────────────────────────────────────────────────────────────────────

export type MatrixAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export';
export const MATRIX_ACTIONS: MatrixAction[] = ['view', 'create', 'update', 'delete', 'approve', 'export'];

/** One row of the permission matrix: a module, the role it is shown for, and its six actions. */
export interface MatrixRow {
  module: string;
  role: ChapterRole['role'];
  /** "Voting member" is the member role limited to voting-eligible members */
  roleLabel: 'admin' | 'finance' | 'votingMember' | 'member' | 'committee' | 'editor' | 'coAmbassador';
  cells: Record<MatrixAction, boolean>;
}

// ── Campaigns and charter settings ───────────────────────────────────────────────────────────

export type CampaignStatus = 'ACTIVE' | 'HISTORY' | 'PLANNED';
export interface AdminCampaign {
  slug: string;
  name: string;
  startsOn: string;
  endsOn: string;
  goalCents: number;
  raisedCents: number;
  grants: number;
  /** the grants and details text of the set-up form */
  grantsNote: string;
  status: CampaignStatus;
}

/** The versioned numbers of the charter (admin_settings). */
export interface CharterValues {
  initiatorCents: number;
  incubatorCents: number;
  innovatorCents: number;
  investorCents: number;
  minimumCents: number;
  votingThresholdCents: number;
  maxInstallments: number;
  roundingCents: number;
  quorumPct: number;
  circulationDays: number;
  /** quorum for decisions that are not grant votes (defaults to `quorumPct`) */
  nonGrantQuorumPct?: number;
}

export type SettingsChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
/** A proposed change: needs a second admin; becomes a version from its effective date. */
export interface SettingsChange {
  id: string;
  /** the design's wording for seeded changes; generated changes use `diff` */
  summary: string | null;
  diff: Array<{ field: keyof CharterValues; from: number; to: number }>;
  proposedBy: string;
  proposedByName: string;
  effectiveFrom: string;
  status: SettingsChangeStatus;
  decidedBy: string | null;
  decidedByName: string | null;
}

export type SettingsVersionStatus = 'ACTIVE' | 'SUPERSEDED' | 'SCHEDULED' | 'REJECTED';
export interface SettingsVersion {
  id: string;
  /** "v1.0"; null for rejected changes (they never became a version) */
  version: string | null;
  /** the design's wording; empty for versions made in the demo (their `diff` describes them) */
  change: string;
  diff?: SettingsChange['diff'];
  proposedByName: string;
  approvedByName: string | null;
  activeFrom: string | null;
  status: SettingsVersionStatus;
  values: CharterValues | null;
}

// ── Payments ─────────────────────────────────────────────────────────────────────────────────

export type PaymentSource = 'WAZI' | 'CHEQUE' | 'TRANSFER';
export type LedgerStatus = 'CONFIRMED' | 'OVERPAID' | 'REFUNDED';
/** A payment for a pledge or a direct donation (admin_ledger). Amounts in cents; no card data. */
export interface LedgerEntry {
  id: string;
  date: string;
  personId: string;
  personName: string;
  kind: 'PLEDGE' | 'DONATION';
  countryKey: string | null;
  portfolioKey: string | null;
  amountCents: number;
  source: PaymentSource;
  /** WAZI reference, or who recorded an offline payment */
  reference: string | null;
  recordedBy: string | null;
  reason: string | null;
  status: LedgerStatus;
}

export type FlagType = 'OVERPAYMENT' | 'REFUND' | 'LATE_INSTALLMENT';
export interface FinanceFlag {
  id: string;
  raisedOn: string;
  type: FlagType;
  personId: string;
  personName: string;
  /** values for the `flag.detail.<type>` UiString */
  values: Record<string, string>;
  status: 'OPEN' | 'RESOLVED';
  resolvedBy: string | null;
}

export interface ReconciliationRun {
  id: string;
  /** ISO date-time (ET wall clock) */
  ranAt: string;
  checked: number;
  recovered: number;
  duplicates: number;
  badSignatures: number;
  status: 'OK' | 'ALERT';
}

// ── Exports and audit ────────────────────────────────────────────────────────────────────────

export type ExportDataset = 'MEMBERS' | 'PAYMENTS' | 'DONATIONS' | 'SIGNUPS' | 'RESULTS';
export interface ExportRecord {
  id: string;
  dataset: ExportDataset;
  requestedBy: string;
  rows: number;
  /** ISO date-time */
  createdAt: string;
  expired: boolean;
  /** the CSV, kept for the demo download (seeded exports have none) */
  csv: string | null;
}

export interface AuditEntry {
  id: string;
  /** ISO date-time */
  at: string;
  actorId: string | null;
  actorName: string;
  actorRole: string | null;
  action: string;
  entity: string;
  /** the person / payment / setting the entry is about (links and person activity) */
  subjectId: string | null;
  before: string | null;
  after: string | null;
  /** the entry page's fuller wording of the entity, when it differs from the list (admin_audit_entry) */
  entityDetail?: string;
  /** hash chain: this entry's hash, over its content and the previous entry's hash */
  hash: string;
  prevHash: string | null;
}

// ── Governance ───────────────────────────────────────────────────────────────────────────────

export type BallotSubject = 'PROPOSALS' | 'DECISION' | 'AMENDMENT';
export type AdminBallotStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'PUBLISHED';
/** A ballot window (admin_ballots): opening starts voting; closing freezes the eligible-voter count. */
export interface AdminBallot {
  id: string;
  title: string;
  subject: BallotSubject;
  /** the decision or amendment on the ballot (null for the grant ballot, whose items are its proposals) */
  subjectId: string | null;
  /** ISO dates */
  opensOn: string;
  closesOn: string;
  /** eligible voters frozen at close; null while the count is live */
  frozenEligible: number | null;
  status: AdminBallotStatus;
}
export interface AdminBallotRow extends AdminBallot {
  /** proposals on a grant ballot */
  proposals: number;
  /** frozen, or the live voting-eligible count */
  eligible: number;
}

/** A closed ballot's result (admin_publish): counts from the rules engine, published once, never edited. */
export interface ResultPublication {
  id: string;
  /** the ballot it closes (published together) */
  ballotId: string | null;
  title: string;
  eligible: number;
  yes: number;
  no: number;
  abstain: number;
  /** members who took part (must equal yes + no + abstain) */
  participations: number;
  /** the quorum it is decided under */
  quorumPct: number;
  status: 'READY' | 'PUBLISHED';
  publishedOn: string | null;
  /** a correction notice added after publishing */
  notice: string | null;
  noticeOn: string | null;
}
export interface PublicationRow extends ResultPublication {
  outcome: VoteOutcome;
}

export type BoardStatus = 'UNDER_REVIEW' | 'SCORED' | 'ON_BALLOT';
/** The review board's figures per proposal (admin_review_board), before the demo's reviews. */
export interface BoardBaseline {
  proposalId: string;
  reviewers: number;
  submitted: number;
  recused: number;
  /** the committee's weighted total so far (null until scored) */
  weightedTotal: number | null;
  movedToBallot: boolean;
}
export interface BoardRow {
  proposalId: string;
  title: string;
  reviewers: number;
  submitted: number;
  recused: number;
  weightedTotal: number | null;
  status: BoardStatus;
  /** people assigned in the portal (can't be assigned twice) */
  assignedIds: string[];
}

// ── System ───────────────────────────────────────────────────────────────────────────────────

export type TemplateCategory = 'TRANSACTIONAL' | 'VOTE_NOTICES';
export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  attachment: 'ICS' | 'PDF' | null;
  /** ISO date */
  editedOn: string;
  subject: string;
  body: string;
  /** the [variables] a template may use */
  variables: string[];
}

export type DeliveryStatus = 'DELIVERED' | 'RETRYING' | 'BOUNCED' | 'SUPPRESSED';
/** A send (admin_delivery). No personal data: recipients are record numbers. */
export interface Delivery {
  id: string;
  /** ISO date-time (ET wall clock) */
  sentAt: string;
  templateId: string;
  recipient: { type: 'MEMBER' | 'VISITOR'; ref: string } | { type: 'TEST' };
  status: DeliveryStatus;
  attempts: number;
}

// ── Overview ─────────────────────────────────────────────────────────────────────────────────

export interface LevelCount {
  levelKey: string;
  count: number;
}
export interface ChapterDashboard {
  cycleLabel: string;
  members: number;
  votingEligible: number;
  receivedCents: number;
  pledgedCents: number;
  turnoutPct: number;
  quorumPct: number;
  byLevel: LevelCount[];
  /** the bar scale of "Membership by level" (count at 100 %) */
  levelScale: number;
  pledgedNotMembers: number;
  funnel: Array<{ key: string; value: number; widthPct: number }>;
  attention: { approvals: number; flags: number; nominations: number; stories: number };
}

export interface FinanceSummary {
  pledgedCents: number;
  receivedCents: number;
  donationsCents: number;
  gifts: number;
  openFlags: number;
  donationsByPortfolio: Array<{ portfolioKey: string; cents: number }>;
  byLevel: Array<{ levelKey: string; pledges: number; pledgedCents: number; receivedCents: number; paidInFull: number }>;
}

export interface HubDashboard {
  hubKey: string;
  ambassadors: string[];
  members: number;
  signups: number;
  rsvps: number;
  receivedCents: number;
  pledgedCents: number;
  recentSignups: Array<{ id: string; name: string; type: 'JOIN_HUB' | 'VOLUNTEER'; role: string | null; date: string; status: 'NEW' | 'CONTACTED' | 'WELCOMED' }>;
  events: Array<{ id: string; title: string; date: string; rsvps: number; capacity: number }>;
}
