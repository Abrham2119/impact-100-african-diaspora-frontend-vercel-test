import type { SessionUser } from '@/domain/entities/session.types';
import { requiresTwoFactor } from '@/domain/rules/access';
import { PATHS } from '@/app/routes/paths';
import { mockReference, mockResponse } from '@/infrastructure/api/mock';
import { authStorage } from '@/infrastructure/storage/auth.storage';
import { directoryAccount, directoryOnlyAccounts } from '@/features/admin/api/adminMockStore';
import '@/features/admin/api/permissionMatrix';
import { DEMO_USERS } from '../fixtures/demoUsers';
import { AuthError, type AuthRepository, type SignInResult, type TwoFactorSetup } from './authRepository';

// Mock auth (Part A): the demo users of fixtures/demoUsers.ts, login links "emailed" to a demo inbox,
// TOTP two-step where any 6-digit code passes except 000000 (to show the error state). State lives in
// localStorage (survives reloads) and `mockAuthTools.reset()` restores the demo defaults.
const KEY = 'ix_mock_auth';
const LINK_TTL_MS = 15 * 60 * 1000; // backend §1: 15-minute single-use links
/** the design's manual key (two_step_enrol.dc.html) */
const DEMO_TOTP_KEY = 'JBSW Y3DP EHPK 3PXP';
const SSO_CODE = 'wazi-mock-amara';
const SSO_USER = 'u-amara';

interface MockAuthState {
  accounts: SessionUser[];
  enrolled: string[];
  links: Record<string, { userId: string; expiresAt: number; used: boolean }>;
  challenges: Record<string, string>;
  lastLink: { email: string; url: string | null } | null;
}

const initial = (): MockAuthState => ({
  accounts: [],
  enrolled: DEMO_USERS.filter((d) => d.twoFactorEnrolled).map((d) => d.user.id),
  links: {},
  challenges: {},
  lastLink: null,
});

function load(): MockAuthState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial(), ...(JSON.parse(raw) as Partial<MockAuthState>) } : initial();
  } catch {
    return initial();
  }
}
function save(state: MockAuthState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: the demo state lasts for this page only
  }
}
function update(change: (state: MockAuthState) => void): MockAuthState {
  const state = load();
  change(state);
  save(state);
  return state;
}

/** Demo users as the admin directory has them now (granted roles, disabled access), people added
 * in the admin console, then accounts signed up during the demo. */
const allAccounts = (state: MockAuthState): SessionUser[] => {
  const demo = DEMO_USERS.map((d) => directoryAccount(d.user)).filter((u): u is SessionUser => u !== null);
  return [...demo, ...directoryOnlyAccounts(DEMO_USERS.map((d) => d.user.id)), ...state.accounts];
};
const byEmail = (state: MockAuthState, email: string) => allAccounts(state).find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
const byId = (state: MockAuthState, id: string) => allAccounts(state).find((u) => u.id === id);
const tokenFor = (user: SessionUser) => `mock.${user.id}.${mockReference('T')}`;
/** the signed-in mock user, from the token the store keeps (`mock.<userId>.<nonce>`) */
const currentUserId = (): string | null => authStorage.getToken()?.split('.')[1] ?? null;
const isValidCode = (code: string) => /^\d{6}$/.test(code.replace(/\s/g, '')) && code.replace(/\s/g, '') !== '000000';

/** After the first factor: a session, a two-step challenge, or a session that must enrol. */
function afterFirstFactor(state: MockAuthState, user: SessionUser): SignInResult {
  if (!requiresTwoFactor(user)) return { kind: 'session', session: user, token: tokenFor(user), mfa: false };
  if (state.enrolled.includes(user.id)) {
    const challengeToken = mockReference('CH');
    update((s) => {
      s.challenges[challengeToken] = user.id;
    });
    return { kind: 'challenge', challengeToken };
  }
  return { kind: 'setup', session: user, token: tokenFor(user) };
}

function issueLink(email: string, nextPath?: string): void {
  update((state) => {
    const user = byEmail(state, email);
    if (!user) {
      state.lastLink = { email, url: null };
      return;
    }
    const token = mockReference('LL');
    state.links[token] = { userId: user.id, expiresAt: Date.now() + LINK_TTL_MS, used: false };
    const params = new URLSearchParams({ token, ...(nextPath ? { next: nextPath } : {}) });
    state.lastLink = { email, url: `${PATHS.auth.signInLink}?${params.toString()}` };
  });
}

export const mockAuthRepository: AuthRepository = {
  requestLoginLink: ({ email, nextPath }) => mockResponse(() => issueLink(email, nextPath)),
  consumeLink: (token) =>
    mockResponse(() => {
      const state = load();
      const link = state.links[token];
      if (!link || link.used || link.expiresAt < Date.now()) throw new AuthError('LINK_EXPIRED');
      update((s) => {
        s.links[token].used = true;
      });
      const user = byId(state, link.userId);
      if (!user) throw new AuthError('LINK_EXPIRED');
      return afterFirstFactor(load(), user);
    }),
  startSso: (nextPath) =>
    mockResponse(() => {
      const params = new URLSearchParams({ sso: SSO_CODE, ...(nextPath ? { next: nextPath } : {}) });
      return { redirectUrl: `${PATHS.auth.signIn}?${params.toString()}` };
    }, 0),
  exchangeSso: (code) =>
    mockResponse(() => {
      const state = load();
      const user = code === SSO_CODE ? byId(state, SSO_USER) : undefined;
      if (!user) throw new AuthError('LINK_EXPIRED');
      return afterFirstFactor(state, user);
    }),
  signUp: ({ fullName, email }) =>
    mockResponse(() => {
      update((state) => {
        if (byEmail(state, email)) return;
        state.accounts.push({ id: mockReference('u'), email: email.trim(), fullName: fullName.trim(), platformRole: 'USER', roles: [], votingEligible: false });
      });
      issueLink(email);
    }),
  twoFactorLogin: ({ challengeToken, code }) =>
    mockResponse(() => {
      const state = load();
      const userId = state.challenges[challengeToken];
      const user = userId ? byId(state, userId) : undefined;
      if (!user) throw new AuthError('LINK_EXPIRED');
      if (!isValidCode(code)) throw new AuthError('INVALID_CODE');
      update((s) => {
        delete s.challenges[challengeToken];
      });
      return { kind: 'session' as const, session: user, token: tokenFor(user), mfa: true };
    }),
  twoFactorSetup: () =>
    mockResponse((): TwoFactorSetup => {
      const user = byId(load(), currentUserId() ?? '');
      const secret = DEMO_TOTP_KEY.replace(/\s/g, '');
      return {
        otpauthUrl: `otpauth://totp/Impact100:${encodeURIComponent(user?.email ?? '')}?secret=${secret}&issuer=Impact100`,
        qrDataUrl: null,
        manualKey: DEMO_TOTP_KEY,
      };
    }, 0),
  twoFactorVerify: (code) =>
    mockResponse(() => {
      if (!isValidCode(code)) throw new AuthError('INVALID_CODE');
      const userId = currentUserId();
      if (userId) update((s) => void (s.enrolled.includes(userId) || s.enrolled.push(userId)));
    }),
  logout: () => mockResponse(() => undefined, 0),
};

/** Demo-only tools (not part of the contract): the demo inbox, role switching, reset. */
export const mockAuthTools = {
  demoUsers: DEMO_USERS,
  /** the last link the mock "emailed" (`url` null when no account uses that email) */
  latestLink: () => load().lastLink,
  /** a full session for a demo user, two-step passed (the role switcher) */
  sessionFor: (key: string) => {
    const demo = DEMO_USERS.find((d) => d.key === key);
    const user = demo ? directoryAccount(demo.user) : null;
    return user ? { session: user, token: tokenFor(user), mfa: requiresTwoFactor(user) } : null;
  },
  reset: () => save(initial()),
};
