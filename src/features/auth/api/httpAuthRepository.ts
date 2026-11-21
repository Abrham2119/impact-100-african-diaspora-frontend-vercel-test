import { AuthError, type AuthRepository } from './authRepository';

// Placeholder for the HTTP implementation (INT-3: `/api/v1/auth` login-link, consume, sso, 2fa).
// Until then the api data source has no passwordless auth: every call fails with NOT_AVAILABLE,
// which the screens show as their error state.
const unavailable = (): Promise<never> => Promise.reject(new AuthError('NOT_AVAILABLE'));

export const httpAuthRepository: AuthRepository = {
  requestLoginLink: unavailable,
  consumeLink: unavailable,
  startSso: unavailable,
  exchangeSso: unavailable,
  signUp: unavailable,
  twoFactorLogin: unavailable,
  twoFactorSetup: unavailable,
  twoFactorVerify: unavailable,
  logout: () => Promise.resolve(),
};
