import type { AdminCampaign, CharterValues, Person, SettingsChange } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';

// Admin rules (BUSINESS_RULES "Campaigns", "Charter settings", "Roles", "Payments"), pure functions.
// The mock repositories enforce them now; the API enforces them in Part B.

export type AdminErrorCode =
  | 'CAMPAIGN_ACTIVE'
  | 'CAMPAIGN_DATES'
  | 'SETTINGS_INVALID'
  | 'SETTINGS_UNCHANGED'
  | 'OWN_CHANGE'
  | 'HUB_FULL'
  | 'LAST_ADMINS'
  | 'ROLE_HELD'
  | 'OUTSIDE_CYCLE'
  | 'NOT_FOUND'
  | 'EMAIL_TAKEN'
  | 'NO_PLEDGE'
  | 'AMOUNT';

export class AdminError extends Error {
  constructor(public readonly code: AdminErrorCode) {
    super(code);
    this.name = 'AdminError';
  }
}

/** Every campaign's goal is the $100,000 maximum. */
export const CAMPAIGN_GOAL_CENTS = 10_000_000;
/** A campaign runs six months. */
export const CAMPAIGN_MONTHS = 6;
/** Two co-Ambassadors per US hub at most. */
export const MAX_AMBASSADORS_PER_HUB = 2;
/** The last two Chapter admins can't be removed. */
export const MIN_CHAPTER_ADMINS = 2;

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Six months from the start, the day before (Oct 1, 2026 → Mar 31, 2027). */
export function campaignEndFor(startsOn: string): string {
  const start = parse(startsOn);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + CAMPAIGN_MONTHS, start.getUTCDate() - 1));
  return iso(end);
}

/** A new campaign may only start after the active (or planned) one ends. */
export function checkNewCampaign(campaigns: AdminCampaign[], startsOn: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) throw new AdminError('CAMPAIGN_DATES');
  const blocking = campaigns.filter((c) => c.status === 'ACTIVE' || c.status === 'PLANNED');
  if (blocking.some((c) => startsOn <= c.endsOn)) throw new AdminError('CAMPAIGN_ACTIVE');
}

/** The cycle (campaign) a date falls in, if any. */
export const campaignFor = (campaigns: AdminCampaign[], date: string): AdminCampaign | undefined =>
  campaigns.find((c) => c.startsOn <= date && date <= c.endsOn);

/** Level amounts must increase; the minimum equals the lowest level; percentages and counts in range. */
export function charterValuesValid(v: CharterValues): boolean {
  const levels = [v.initiatorCents, v.incubatorCents, v.innovatorCents, v.investorCents];
  const increasing = levels.every((amount, i) => amount > 0 && (i === 0 || amount > levels[i - 1]));
  return (
    increasing &&
    v.minimumCents === v.initiatorCents &&
    v.votingThresholdCents >= v.minimumCents &&
    v.maxInstallments >= 1 &&
    v.roundingCents >= 1 &&
    v.quorumPct > 0 &&
    v.quorumPct <= 100 &&
    v.circulationDays >= 1
  );
}

const FIELDS: Array<keyof CharterValues> = [
  'initiatorCents',
  'incubatorCents',
  'innovatorCents',
  'investorCents',
  'minimumCents',
  'votingThresholdCents',
  'maxInstallments',
  'roundingCents',
  'quorumPct',
  'circulationDays',
];
/** What a proposal changes, field by field. */
export const diffValues = (from: CharterValues, to: CharterValues): SettingsChange['diff'] =>
  FIELDS.filter((f) => from[f] !== to[f]).map((field) => ({ field, from: from[field] ?? 0, to: to[field] ?? 0 }));

/** A second admin approves: never the proposer. */
export const canDecide = (change: Pick<SettingsChange, 'proposedBy' | 'status'>, userId: string | null): boolean =>
  change.status === 'PENDING' && userId !== null && change.proposedBy !== userId;

const holds = (person: Person, role: ChapterRoleName, scopeId?: string) =>
  !person.disabled && person.grants.some((g) => g.role === role && (scopeId === undefined || g.scopeId === scopeId));

/** Refuses a grant that breaks a rule (already held, hub full). */
export function checkGrant(people: Person[], target: Person, role: ChapterRoleName, hubKey: string | null): void {
  if (role === 'HUB_CO_AMBASSADOR') {
    if (!hubKey) throw new AdminError('NOT_FOUND');
    if (holds(target, role, hubKey)) throw new AdminError('ROLE_HELD');
    if (people.filter((p) => holds(p, role, hubKey)).length >= MAX_AMBASSADORS_PER_HUB) throw new AdminError('HUB_FULL');
    return;
  }
  if (holds(target, role)) throw new AdminError('ROLE_HELD');
}

/** Removing a Chapter admin (revoke or disable) must leave at least two. */
export function checkAdminRemoval(people: Person[], target: Person): void {
  if (!holds(target, 'CHAPTER_ADMIN')) return;
  if (people.filter((p) => holds(p, 'CHAPTER_ADMIN')).length <= MIN_CHAPTER_ADMINS) throw new AdminError('LAST_ADMINS');
}
