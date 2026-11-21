import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { authFlowStorage } from '@/infrastructure/storage/authFlow.storage';
import { useAuthStore } from '@/store/authStore';
import { authRepository, type SignInResult } from '../api';
import { landingFor, safeNext } from '../lib/resolveLanding';

// Hooks of the passwordless sign-in (design auth screens 34–39). Every step that can end the first
// factor goes through `useCompleteSignIn`, so the session / two-step / enrol routing is one rule.

const withNext = (path: string, next: string | null | undefined) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

/** Applies a sign-in result: store the session and go on, or continue with two-step. */
export function useCompleteSignIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setDesignSession = useAuthStore((s) => s.setDesignSession);

  return useCallback(
    (result: SignInResult, nextParam: string | null) => {
      const next = safeNext(nextParam);
      if (result.kind === 'challenge') {
        authFlowStorage.setChallenge(result.challengeToken, next ?? undefined);
        navigate(withNext(PATHS.auth.twoStep, next), { replace: true });
        return;
      }
      queryClient.clear();
      setDesignSession({ session: result.session, token: result.token, mfa: result.kind === 'session' && result.mfa });
      if (result.kind === 'setup') navigate(withNext(PATHS.auth.twoStepSetup, next), { replace: true });
      else navigate(next ?? landingFor(result.session), { replace: true });
    },
    [navigate, queryClient, setDesignSession],
  );
}

export function useRequestLoginLink() {
  return useMutation({
    mutationFn: (input: { email: string; nextPath?: string }) => {
      authFlowStorage.setEmail(input.email);
      return authRepository.requestLoginLink(input);
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (input: { fullName: string; email: string }) => {
      authFlowStorage.setEmail(input.email);
      return authRepository.signUp(input);
    },
  });
}

/** Consumes an emailed link (`/auth/sign-in/link?token=`). */
export function useConsumeLink() {
  return useMutation({ mutationFn: (token: string) => authRepository.consumeLink(token) });
}

export function useStartSso() {
  return useMutation({ mutationFn: (nextPath?: string) => authRepository.startSso(nextPath) });
}

export function useExchangeSso() {
  return useMutation({ mutationFn: (code: string) => authRepository.exchangeSso(code) });
}

export function useTwoFactorLogin() {
  return useMutation({ mutationFn: (input: { challengeToken: string; code: string }) => authRepository.twoFactorLogin(input) });
}

/** The enrolment secret / QR for the signed-in person (two_step_enrol). */
export function useTwoFactorSetup(enabled: boolean) {
  return useQuery({ queryKey: ['auth', '2fa', 'setup'], queryFn: authRepository.twoFactorSetup, enabled, staleTime: Infinity });
}

export function useTwoFactorVerify() {
  const markMfa = useAuthStore((s) => s.markMfa);
  return useMutation({ mutationFn: (code: string) => authRepository.twoFactorVerify(code), onSuccess: markMfa });
}
