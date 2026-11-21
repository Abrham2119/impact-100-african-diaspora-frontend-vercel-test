import type { SessionUser } from '@/domain/entities/session.types';

// The passwordless auth contract of the design areas (backend docs/ARCHITECTURE.md §4.1, decision
// D1): email login link + WAZIImpact.org SSO, TOTP two-step for the roles that require it. The mock
// implementation serves Part A; the HTTP one (INT-3) implements the same interface.

/** What signing in can lead to (`POST login-link/consume`, `sso/exchange`, `2fa/login`). */
export type SignInResult =
  /** signed in; `mfa` = two-step passed this session */
  | { kind: 'session'; session: SessionUser; token: string; mfa: boolean }
  /** the role needs two-step and the person is enrolled: ask for the code */
  | { kind: 'challenge'; challengeToken: string }
  /** the role needs two-step and the person is not enrolled yet: signed in without mfa, enrol next */
  | { kind: 'setup'; session: SessionUser; token: string };

export interface TwoFactorSetup {
  otpauthUrl: string;
  /** QR image from the server; the design's placeholder tile shows while there is none */
  qrDataUrl: string | null;
  manualKey: string;
}

export type AuthErrorCode = 'LINK_EXPIRED' | 'INVALID_CODE' | 'NOT_AVAILABLE';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

export interface AuthRepository {
  /** always resolves (no account enumeration) */
  requestLoginLink(input: { email: string; nextPath?: string }): Promise<void>;
  /** rejects with LINK_EXPIRED for an expired or used link */
  consumeLink(token: string): Promise<SignInResult>;
  /** where the browser goes to sign in with WAZIImpact.org */
  startSso(nextPath?: string): Promise<{ redirectUrl: string }>;
  exchangeSso(code: string): Promise<SignInResult>;
  /** creates the account (or not, silently) and emails a login link */
  signUp(input: { fullName: string; email: string }): Promise<void>;
  /** rejects with INVALID_CODE */
  twoFactorLogin(input: { challengeToken: string; code: string }): Promise<SignInResult>;
  twoFactorSetup(): Promise<TwoFactorSetup>;
  /** rejects with INVALID_CODE; on success the session has passed two-step */
  twoFactorVerify(code: string): Promise<void>;
  logout(): Promise<void>;
}
