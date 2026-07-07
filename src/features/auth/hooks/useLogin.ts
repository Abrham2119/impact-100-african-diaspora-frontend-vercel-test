import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, type LoginPayload } from '../api/authService';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// Login mutation → persists the session and redirects to the intended page.
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ user, token, refreshToken, permissions }) => {
      setSession({ user, token, refreshToken, permissions });
      const from = (location.state as { from?: Location } | null)?.from?.pathname;
      navigate(from ?? PATHS.app.dashboard, { replace: true });
    },
  });
}
