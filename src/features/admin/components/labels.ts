import type { Person, PersonRow } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import type { useT } from '@/i18n/useT';

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
