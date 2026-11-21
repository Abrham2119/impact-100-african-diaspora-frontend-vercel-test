import type { MemberProfile } from '@/domain/entities/profile.types';

// Profiles of the demo people. Amara Mensah's is the design's (portal_profile / portal_privacy
// .dc.html, avatar from the portal sidebar); the others carry name, email, city / US hub from
// admin › People (admin_people.dc.html) and Kofi Boateng's admin-sidebar avatar (FE-8 decision:
// minimal derived records). Receipts and account emails can't be switched off.
const NEWSLETTER_WORDING = 'Yes, send me the Impact100 African Diaspora Chapter newsletter. I can unsubscribe at any time.';
const prefs = { receipts: true, votes: true, newsletter: true, hub: true, volunteer: false };

const minimal = (userId: string, fullName: string, email: string, city: string, usHubKey: string | null, avatarFile: string | null = null): MemberProfile => ({
  userId,
  fullName,
  email,
  city,
  usHubKey,
  africanHubKey: null,
  portfolioKey: null,
  avatarFile,
  emailPrefs: { ...prefs, newsletter: false },
  consents: [],
  dataRequests: [],
});

export const PROFILES: MemberProfile[] = [
  {
    userId: 'u-amara',
    fullName: 'Amara Mensah',
    email: 'amara@example.com',
    city: 'Atlanta, GA',
    usHubKey: 'atlanta',
    africanHubKey: 'kenya',
    portfolioKey: 'diaspora-engagement',
    avatarFile: 'volunteer_img_2.webp',
    emailPrefs: prefs,
    consents: [{ purpose: 'Newsletter', wording: NEWSLETTER_WORDING, grantedOn: '2026-10-01', withdrawnOn: null }],
    dataRequests: [],
  },
  minimal('u-kofi', 'Kofi Boateng', 'kofi@example.com', 'Atlanta', 'atlanta', 'volunteer_img_4.webp'),
  minimal('u-wanjiru', 'Wanjiru Kamau', 'wanjiru@example.com', 'N. California', 'northern-california'),
  minimal('u-david', 'David Otieno', 'david@example.com', 'DMV', 'dmv'),
  minimal('u-aisha', 'Aisha Diallo', 'aisha@example.com', '', null),
  minimal('u-grace', 'Grace Mwale', 'grace@example.com', 'Atlanta', 'atlanta'),
];
