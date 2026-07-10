import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';

// Begin 2FA setup — the backend emails a TWO_FACTOR OTP.
export function useSetupTwoFactor() {
  return useMutation({ mutationFn: () => authService.twoFactor.setup() });
}

// Confirm the emailed OTP to enable 2FA.
export function useVerifyTwoFactor() {
  return useMutation({ mutationFn: (code: string) => authService.twoFactor.verify(code) });
}

export function useDisableTwoFactor() {
  return useMutation({ mutationFn: () => authService.twoFactor.disable() });
}
