import type { DataRequest, EmailPrefKey, MemberProfile } from '@/domain/entities/profile.types';
import { mockResponse } from '@/infrastructure/api/mock';
import { currentMockUserId } from '@/infrastructure/mock/currentUser';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { useAuthStore } from '@/store/authStore';
import { PROFILES } from '../fixtures/profiles';

// The signed-in person's profile (backend §4.2 `me`, `me/interests`, `me/email-preferences`,
// `me/data-requests`, `me/consents`). Contract for INT-3 + the mock on the persisted mock store.
// People without a stored profile (e.g. new sign-ups) get one from their session on first read.
export interface ProfileRepository {
  me(): Promise<MemberProfile | null>;
  update(change: Pick<MemberProfile, 'fullName' | 'city' | 'usHubKey' | 'email'>): Promise<MemberProfile>;
  updateInterests(change: Pick<MemberProfile, 'africanHubKey' | 'portfolioKey'>): Promise<MemberProfile>;
  setEmailPref(key: EmailPrefKey, on: boolean): Promise<MemberProfile>;
  requestData(type: DataRequest['type']): Promise<MemberProfile>;
}

const store = createMockStore('profiles', () => ({ profiles: PROFILES }));

function ensure(userId: string): MemberProfile {
  const existing = store.read().profiles.find((p) => p.userId === userId);
  if (existing) return existing;
  const session = useAuthStore.getState().session;
  const created: MemberProfile = {
    userId,
    fullName: session?.fullName ?? '',
    email: session?.email ?? '',
    city: '',
    usHubKey: null,
    africanHubKey: null,
    portfolioKey: null,
    avatarFile: null,
    emailPrefs: { receipts: true, votes: true, newsletter: false, hub: true, volunteer: false },
    consents: [],
    dataRequests: [],
  };
  store.mutate((db) => void db.profiles.push(created));
  return created;
}

const change = (apply: (profile: MemberProfile) => void): MemberProfile => {
  const userId = currentMockUserId();
  if (!userId) throw new Error('not signed in');
  ensure(userId);
  const next = store.mutate((db) => {
    const profile = db.profiles.find((p) => p.userId === userId);
    if (profile) apply(profile);
  });
  return next.profiles.find((p) => p.userId === userId) as MemberProfile;
};

export const mockProfileRepository: ProfileRepository = {
  me: () =>
    mockResponse(() => {
      const userId = currentMockUserId();
      return userId ? ensure(userId) : null;
    }),
  update: (input) => mockResponse(() => change((p) => Object.assign(p, input))),
  updateInterests: (input) => mockResponse(() => change((p) => Object.assign(p, input))),
  setEmailPref: (key, on) => mockResponse(() => change((p) => void (key !== 'receipts' && (p.emailPrefs[key] = on)))),
  requestData: (type) =>
    mockResponse(() =>
      change((p) => {
        if (p.dataRequests.some((r) => r.type === type && r.status === 'OPEN')) return;
        p.dataRequests.push({ type, requestedOn: new Date().toISOString().slice(0, 10), status: 'OPEN' });
      }),
    ),
};

/** The profile repository of the configured data source (INT-3 adds the HTTP implementation). */
export const profileRepository: ProfileRepository = mockProfileRepository;
/** Read access for other slices' mocks (comment authors, admin People in FE-9). */
export const profileMockStore = store;
