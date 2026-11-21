import type { InstallmentPlan, MembershipLevel, MembershipSettings } from '@/domain/entities/membership.types';

// Membership rules of design-reference/BUSINESS_RULES.md, as pure functions. The thresholds and
// rounding come from the charter settings (one source), never from literals.

/**
 * A pledge in `n` monthly installments: every payment is the pledge / n rounded UP to the settings'
 * rounding step ($5); the last one takes the remainder (rules: "$250 in 6 → 5 × $45 + $25").
 */
export function installmentPlan(pledgeCents: number, installments: number, roundingCents: number): InstallmentPlan {
  const n = Math.max(1, Math.floor(installments));
  const step = Math.max(1, roundingCents);
  const eachCents = n === 1 ? pledgeCents : Math.ceil(pledgeCents / n / step) * step;
  return { installments: n, pledgeCents, eachCents, lastCents: pledgeCents - eachCents * (n - 1) };
}

/** Voting member: MORE than the threshold received ($500 does not qualify, $501 does). */
export const isVotingAmount = (receivedCents: number, settings: MembershipSettings): boolean =>
  receivedCents > settings.votingThresholdCents;

/** The highest level whose amount has been received; between two levels the lower one; none below the minimum. */
export function levelForAmount(receivedCents: number, settings: MembershipSettings): MembershipLevel | null {
  const reached = settings.levels.filter((level) => receivedCents >= level.amountCents);
  return reached.length > 0 ? reached.reduce((a, b) => (b.amountCents > a.amountCents ? b : a)) : null;
}

export const findLevel = (settings: MembershipSettings, key: string | null | undefined): MembershipLevel | undefined =>
  settings.levels.find((level) => level.key === key);
