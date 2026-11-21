import { authStorage } from '@/infrastructure/storage/auth.storage';

/** The signed-in demo user's id, from the mock token (`mock.<userId>.<nonce>`); null when signed out. */
export function currentMockUserId(): string | null {
  const token = authStorage.getToken();
  return token?.startsWith('mock.') ? (token.split('.')[1] ?? null) : null;
}
