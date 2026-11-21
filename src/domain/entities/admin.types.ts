// The admin console's data (admin*.dc.html, BUSINESS_RULES "Admin"). Framework-free.
import type { ChapterRole } from '@/domain/enums/role.enum';

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
