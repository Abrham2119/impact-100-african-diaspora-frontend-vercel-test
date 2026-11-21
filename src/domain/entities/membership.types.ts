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
}

export interface InstallmentPlan {
  installments: number;
  pledgeCents: number;
  /** every payment but the last */
  eachCents: number;
  lastCents: number;
}

export type DonationFrequency = 'once' | 'monthly';
