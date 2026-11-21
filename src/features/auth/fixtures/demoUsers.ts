import type { SessionUser } from '@/domain/entities/session.types';

// Demo people for mock auth (Part A), one per role of backend §6.1. Names, emails, hubs and levels
// are the design's sample members (admin_people.dc.html); the three "(demo)" accounts cover roles no
// sample person holds alone (Content Editor, Hub co-Ambassador, Super admin). `twoFactorEnrolled`
// seeds the mock's TOTP enrolment, so both the code and the enrol paths can be demonstrated.
export interface DemoUser {
  key: string;
  /** the role shown in the demo switcher (UiStrings `common.demo.role.<roleKey>`) */
  roleKey: 'member' | 'voting' | 'reviewer' | 'hub' | 'editor' | 'finance' | 'admin' | 'super' | 'supporter';
  user: SessionUser;
  twoFactorEnrolled: boolean;
}

export const DEMO_USERS: DemoUser[] = [
  {
    key: 'david',
    roleKey: 'member',
    user: { id: 'u-david', email: 'david@example.com', fullName: 'David Otieno', platformRole: 'USER', roles: [{ role: 'MEMBER' }], votingEligible: false },
    twoFactorEnrolled: false,
  },
  {
    key: 'wanjiru',
    roleKey: 'voting',
    user: { id: 'u-wanjiru', email: 'wanjiru@example.com', fullName: 'Wanjiru Kamau', platformRole: 'USER', roles: [{ role: 'MEMBER' }], votingEligible: true },
    twoFactorEnrolled: false,
  },
  {
    key: 'amara',
    roleKey: 'reviewer',
    user: {
      id: 'u-amara',
      email: 'amara@example.com',
      fullName: 'Amara Mensah',
      platformRole: 'USER',
      roles: [{ role: 'MEMBER' }, { role: 'COMMITTEE_MEMBER', scopeType: 'COMMITTEE', scopeId: 'grants-selection' }],
      // $510 received of a $1,000 pledge: more than $500 → voting member (portal.dc.html)
      votingEligible: true,
    },
    twoFactorEnrolled: false,
  },
  {
    key: 'hub',
    roleKey: 'hub',
    user: {
      id: 'u-hub',
      email: 'hub.demo@example.com',
      fullName: 'Hub co-Ambassador (demo)',
      platformRole: 'USER',
      roles: [{ role: 'HUB_CO_AMBASSADOR', scopeType: 'HUB', scopeId: 'atlanta' }],
      votingEligible: false,
    },
    twoFactorEnrolled: false,
  },
  {
    key: 'editor',
    roleKey: 'editor',
    user: { id: 'u-editor', email: 'editor.demo@example.com', fullName: 'Content Editor (demo)', platformRole: 'USER', roles: [{ role: 'CONTENT_EDITOR' }], votingEligible: false },
    twoFactorEnrolled: false,
  },
  {
    key: 'aisha',
    roleKey: 'finance',
    user: { id: 'u-aisha', email: 'aisha@example.com', fullName: 'Aisha Diallo', platformRole: 'USER', roles: [{ role: 'USAFI_FINANCE' }], votingEligible: false },
    twoFactorEnrolled: true,
  },
  {
    key: 'kofi',
    roleKey: 'admin',
    user: {
      id: 'u-kofi',
      email: 'kofi@example.com',
      fullName: 'Kofi Boateng',
      platformRole: 'ADMIN',
      roles: [{ role: 'MEMBER' }, { role: 'CHAPTER_ADMIN' }, { role: 'HUB_CO_AMBASSADOR', scopeType: 'HUB', scopeId: 'atlanta' }],
      votingEligible: true,
    },
    twoFactorEnrolled: true,
  },
  {
    key: 'super',
    roleKey: 'super',
    user: { id: 'u-super', email: 'super.demo@example.com', fullName: 'Super admin (demo)', platformRole: 'SUPER_ADMIN', roles: [], votingEligible: false },
    twoFactorEnrolled: false,
  },
  {
    key: 'grace',
    roleKey: 'supporter',
    user: { id: 'u-grace', email: 'grace@example.com', fullName: 'Grace Mwale', platformRole: 'USER', roles: [], votingEligible: false },
    twoFactorEnrolled: false,
  },
];
