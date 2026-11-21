// Charter settings and membership values used by the public join / donate flows. Framework-free;
// amounts are integer cents. Mapped from `GET /settings/public` (src/types/membership.dto.ts).

export interface MembershipLevel {
  key: string;
  amountCents: number;
}

export interface MembershipSettings {
  versionLabel: string;
  levels: MembershipLevel[];
  membershipMinimumCents: number;
  /** a member votes when MORE than this has been received in the cycle */
  votingThresholdCents: number;
  maxInstallments: number;
  installmentRoundingCents: number;
  quorumPct: number;
  cycle: { starts: string; ends: string };
  goalCents: number;
  /** days an amendment circulates before it can go on a ballot */
  circulationDays?: number;
}

export interface InstallmentPlan {
  installments: number;
  pledgeCents: number;
  /** every payment but the last */
  eachCents: number;
  lastCents: number;
}

export type DonationFrequency = 'once' | 'monthly';

// ---- the member's own membership (portal) -------------------------------------------------------

export type InstallmentStatus = 'PAID' | 'DUE' | 'SCHEDULED' | 'PROCESSING';

export interface Installment {
  id: string;
  seq: number;
  /** ISO date */
  dueOn: string;
  amountCents: number;
  status: InstallmentStatus;
  paidOn?: string;
}

/** A membership of one campaign: the pledge and its installments. */
export interface MembershipRecord {
  userId: string;
  campaignSlug: string;
  memberNo: string;
  pledgeLevelKey: string;
  pledgeCents: number;
  /** "03/27" — the campaign end on the card */
  validThru: string;
  installments: Installment[];
  /** received above the pledge — never counted toward it (a finance flag) */
  overpaidCents?: number;
}

/** A confirmed payment in the contribution history (membership installments and direct donations). */
export interface Contribution {
  id: string;
  /** ISO date */
  date: string;
  kind: 'INSTALLMENT' | 'DONATION';
  installmentSeq?: number;
  installmentCount?: number;
  frequency?: DonationFrequency;
  amountCents: number;
  portfolioKey?: string;
  countryKey?: string;
}

/** The membership as the portal shows it: the record plus everything computed from what was received. */
export interface MembershipSummary {
  record: MembershipRecord;
  receivedCents: number;
  toGoCents: number;
  /** highest level fully received (null below the minimum) */
  levelKey: string | null;
  votingEligible: boolean;
  /** signing needs the minimum received and the pledge paid in full */
  charterUnlocked: boolean;
  nextInstallment: Installment | null;
  /** a payment waiting for WAZIImpact.org to confirm */
  processing: Installment | null;
}
