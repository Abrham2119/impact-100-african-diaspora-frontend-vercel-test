import type { Person, PersonActivity, RoleGrant } from '@/domain/entities/admin.types';

// People (admin_people / admin_person .dc.html), verbatim: one record per email across donors,
// members, volunteers and staff. Levels and votes are computed from the ledger, never stored.
// Ngozi Eze (Chapter admin, Atlanta co-Ambassador — admin_hub, admin_approvals), Tunde Ade and
// S. Banda (admin_ledger, admin_flags) are on record but not in the design's list.
const grant = (role: RoleGrant['role'], grantedOn: string, grantedBy: string | null = null, scope?: Pick<RoleGrant, 'scopeType' | 'scopeId'>): RoleGrant => ({
  role,
  grantedBy,
  grantedOn,
  ...scope,
});
const person = (p: Omit<Person, 'disabled' | 'waziLinked' | 'listed' | 'tags'> & Partial<Pick<Person, 'waziLinked' | 'listed' | 'tags'>>): Person => ({
  disabled: false,
  waziLinked: true,
  listed: true,
  tags: [],
  ...p,
});

export const PEOPLE: Person[] = [
  person({
    id: 'u-amara',
    fullName: 'Amara Mensah',
    email: 'amara@example.com',
    usHubKey: 'atlanta',
    joinedOn: '2026-10-01',
    grants: [grant('MEMBER', '2026-10-01'), grant('COMMITTEE_MEMBER', '2026-10-20', 'Kofi Boateng', { scopeType: 'COMMITTEE', scopeId: 'grants-selection' })],
  }),
  person({
    id: 'u-kofi',
    fullName: 'Kofi Boateng',
    email: 'kofi@example.com',
    usHubKey: 'atlanta',
    joinedOn: '2026-10-01',
    grants: [grant('CHAPTER_ADMIN', '2026-09-01', 'Ngozi Eze'), grant('HUB_CO_AMBASSADOR', '2026-09-01', 'Ngozi Eze', { scopeType: 'HUB', scopeId: 'atlanta' })],
  }),
  person({ id: 'u-wanjiru', fullName: 'Wanjiru Kamau', email: 'wanjiru@example.com', usHubKey: 'northern-california', joinedOn: '2026-11-27', grants: [grant('MEMBER', '2026-11-27')] }),
  person({ id: 'u-david', fullName: 'David Otieno', email: 'david@example.com', usHubKey: 'dmv', joinedOn: '2026-11-28', grants: [grant('MEMBER', '2026-11-28')] }),
  person({ id: 'u-aisha', fullName: 'Aisha Diallo', email: 'aisha@example.com', usHubKey: null, joinedOn: '2026-09-01', grants: [grant('USAFI_FINANCE', '2026-09-01', 'Kofi Boateng')], waziLinked: false }),
  person({ id: 'u-grace', fullName: 'Grace Mwale', email: 'grace@example.com', usHubKey: 'atlanta', joinedOn: '2026-10-14', grants: [], tags: ['DONOR', 'VOLUNTEER'] }),
  person({
    id: 'u-ngozi',
    fullName: 'Ngozi Eze',
    email: 'ngozi@example.com',
    usHubKey: 'atlanta',
    joinedOn: '2025-10-01',
    grants: [grant('CHAPTER_ADMIN', '2025-10-01'), grant('HUB_CO_AMBASSADOR', '2026-09-01', 'Kofi Boateng', { scopeType: 'HUB', scopeId: 'atlanta' })],
    listed: false,
  }),
  person({ id: 'u-tunde', fullName: 'Tunde Ade', email: 'tunde@example.com', usHubKey: 'atlanta', joinedOn: '2026-11-16', grants: [], listed: false }),
  person({ id: 'u-sbanda', fullName: 'S. Banda', email: 's.banda@example.com', usHubKey: null, joinedOn: '2025-10-01', grants: [], listed: false }),
];

/** Recent activity on record (admin_person: Amara Mensah's); newer entries come from the ledger and the audit log. */
export const ACTIVITY: Record<string, PersonActivity[]> = {
  'u-amara': [
    { date: '2026-12-01', kind: 'PAYMENT', values: { amount: '17000' } },
    { date: '2026-11-20', kind: 'COMMENT', values: { title: 'Youth digital skills programme' } },
    { date: '2026-10-20', kind: 'ROLE_GRANTED', values: { role: 'COMMITTEE_MEMBER' } },
  ],
};

/** People per role across the chapter (admin_roles), before the demo's grants and revocations. */
export const ROLE_PEOPLE_BASELINE = { MEMBER: 126, COMMITTEE_MEMBER: 34, HUB_CO_AMBASSADOR: 8, CONTENT_EDITOR: 6, CHAPTER_ADMIN: 4, USAFI_FINANCE: 2 } as const;
