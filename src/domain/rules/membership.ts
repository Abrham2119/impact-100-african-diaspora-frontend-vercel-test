import type { Installment, InstallmentPlan, MembershipLevel, MembershipRecord, MembershipSettings, MembershipSummary } from '@/domain/entities/membership.types';

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

/** The portal view of a membership: everything computed from what has been received (BUSINESS_RULES). */
export function summarizeMembership(record: MembershipRecord, settings: MembershipSettings): MembershipSummary {
  const receivedCents = record.installments.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.amountCents, 0);
  const open = record.installments.filter((i) => i.status === 'DUE' || i.status === 'SCHEDULED').sort((a, b) => a.seq - b.seq);
  return {
    record,
    receivedCents,
    toGoCents: Math.max(0, record.pledgeCents - receivedCents),
    levelKey: levelForAmount(receivedCents, settings)?.key ?? null,
    votingEligible: isVotingAmount(receivedCents, settings),
    charterUnlocked: receivedCents >= settings.membershipMinimumCents && receivedCents >= record.pledgeCents,
    nextInstallment: open[0] ?? null,
    processing: record.installments.find((i) => i.status === 'PROCESSING') ?? null,
  };
}

/**
 * Applies a payment received outside the schedule (an offline cheque or transfer) to a pledge: it
 * pays the open installments in order, splitting the last one it reaches; what is left above the
 * pledge is an overpayment, which never counts toward it (admin_flags).
 */
export function applyPayment(
  record: MembershipRecord,
  amountCents: number,
  paidOn: string,
): { record: MembershipRecord; appliedCents: number; overpaidCents: number } {
  let left = amountCents;
  const paid: Installment[] = record.installments.filter((i) => i.status === 'PAID');
  const open = record.installments.filter((i) => i.status !== 'PAID').sort((a, b) => a.seq - b.seq);
  const rest: Installment[] = [];
  for (const item of open) {
    if (left <= 0 || item.status === 'PROCESSING') {
      rest.push(item);
    } else if (left >= item.amountCents) {
      paid.push({ ...item, status: 'PAID', paidOn });
      left -= item.amountCents;
    } else {
      paid.push({ ...item, id: `${item.id}-part`, amountCents: left, status: 'PAID', paidOn });
      rest.push({ ...item, amountCents: item.amountCents - left });
      left = 0;
    }
  }
  const installments = [...paid.sort((a, b) => (a.paidOn ?? a.dueOn).localeCompare(b.paidOn ?? b.dueOn)), ...rest].map((item, index) => ({
    ...item,
    seq: index + 1,
  }));
  const firstOpen = installments.find((i) => i.status === 'DUE' || i.status === 'SCHEDULED');
  if (firstOpen && !installments.some((i) => i.status === 'DUE')) firstOpen.status = 'DUE';
  return {
    record: { ...record, installments, overpaidCents: (record.overpaidCents ?? 0) + left },
    appliedCents: amountCents - left,
    overpaidCents: left,
  };
}
