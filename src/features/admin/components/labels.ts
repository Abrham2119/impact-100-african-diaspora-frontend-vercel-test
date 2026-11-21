import type { Person, PersonRow, SettingsChange } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { AdminError } from '@/domain/rules/admin';
import type { useT } from '@/i18n/useT';
import { formatDate, formatDayMonth } from '@/lib/format';

// Shared admin labels (roles, tags, short hub names) built from the `admin` UiStrings.
type T = ReturnType<typeof useT<'admin'>>;

export const roleLabel = (t: T, role: ChapterRoleName) => t(`role.${role}`);

/** "Member · Committee member" / "Donor · Volunteer" — the grants as recorded, then supporter tags. */
export const rolesText = (t: T, person: Pick<Person, 'grants' | 'tags'>) =>
  [...person.grants.map((g) => roleLabel(t, g.role)), ...person.tags.map((tag) => t(`tag.${tag}`))].join(' · ') || t('people.none');

/** "N. California" — the short hub names of the admin tables */
export const hubShort = (t: T, key: string | null) => (key ? t(`hubShort.${key}` as 'hubShort.atlanta') : t('people.none'));

/** Voting / No vote / — : members and supporters get a vote status, staff without a membership don't. */
export const voteStatus = (person: Pick<PersonRow, 'votingEligible' | 'isMember' | 'grants' | 'tags'>): 'VOTING' | 'NO_VOTE' | 'NONE' =>
  person.votingEligible ? 'VOTING' : person.isMember || person.tags.length > 0 || person.grants.some((g) => g.role === 'MEMBER') ? 'NO_VOTE' : 'NONE';

/** "Max installments 6 → 8 · Quorum 50% → 45%" — a generated settings change in words. */
export const diffText = (t: T, money: (cents: number) => string, diff: SettingsChange['diff']) =>
  diff
    .map((d) => {
      const fmt = (n: number) => (d.field.endsWith('Cents') ? money(n) : String(n));
      return t(`diff.${d.field}`, { from: fmt(d.from), to: fmt(d.to) });
    })
    .join(' · ');

/** "Aisha Diallo" → "A. Diallo" (who recorded an offline payment) */
export const shortName = (fullName: string) => {
  const [first = '', ...rest] = fullName.trim().split(/\s+/);
  return rest.length ? `${first.charAt(0)}. ${rest.join(' ')}` : first;
};

/** The message of a refused admin action (`error.<code>`), or the generic one. */
export const adminErrorText = (t: T, error: unknown) => (error instanceof AdminError ? t(`error.${error.code}` as 'error.generic') : t('error.generic'));

/** "Feb 15 – Mar 1, 2027" (same year) / "Dec 1, 2026 – Jan 5, 2027" — a ballot window. */
export const windowText = (t: T, opensOn: string, closesOn: string, locale: string) =>
  t('decisions.range', { from: opensOn.slice(0, 4) === closesOn.slice(0, 4) ? formatDayMonth(opensOn, locale) : formatDate(opensOn, locale), to: formatDate(closesOn, locale) });

/** "2026-11-17T11:40" → { date: "Nov 17, 2026", time: "11:40" } (ET wall clock, as stored) */
export const stampParts = (stamp: string, locale: string) => ({ date: formatDate(stamp.slice(0, 10), locale), time: stamp.slice(11, 16) });
