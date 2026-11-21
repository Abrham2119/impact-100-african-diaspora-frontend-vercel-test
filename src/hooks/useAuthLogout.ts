import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/api/authService';
import { authRepository } from '@/features/auth/api';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// Logout: tell the auth source (best-effort; a design session goes through the auth repository,
// a starter session through the starter API), clear the store + storage token,
// drop all cached server state, then redirect (home by default; the design shells
// send the user to the design sign-in, as their "Log out" link does).
export function useAuthLogout(redirectTo: string = PATHS.home) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const isDesignSession = useAuthStore((s) => s.session !== null);

  return async () => {
    try {
      await (isDesignSession ? authRepository.logout() : authService.logout());
    } catch {
      /* ignore network failure — we clear locally regardless */
    }
    clearSession();
    queryClient.clear();
    navigate(redirectTo, { replace: true });
  };
}
