import { isMockData } from '@/infrastructure/api/dataSource';
import type { AuthRepository } from './authRepository';
import { httpAuthRepository } from './httpAuthRepository';
import { mockAuthRepository } from './mockAuthRepository';

/** The auth repository of the configured data source (VITE_DATA_SOURCE). */
export const authRepository: AuthRepository = isMockData ? mockAuthRepository : httpAuthRepository;
export { AuthError } from './authRepository';
export type { AuthErrorCode, SignInResult, TwoFactorSetup } from './authRepository';
