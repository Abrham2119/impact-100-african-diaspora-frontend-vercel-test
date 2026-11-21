import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/domain/entities/user.types';
import type { SessionUser } from '@/domain/entities/session.types';
import type { Permission } from '@/domain/enums/permission.enum';
import { permissionsFor } from '@/domain/rules/access';
import { ALL_PERMISSIONS } from '@/constant/permissions';
import { authStorage } from '@/infrastructure/storage/auth.storage';

interface SetSessionPayload {
  user: User;
  token: string;
  refreshToken?: string;
  permissions: Permission[];
}

/** A design-area session (passwordless sign-in): chapter roles, scopes and the two-step state. */
interface SetDesignSessionPayload {
  session: SessionUser;
  token: string;
  /** two-step passed this session */
  mfa: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isHydrating: boolean;
  /** the design session (null for a starter `/app` session) */
  session: SessionUser | null;
  /** two-step verification passed in this session (JWT `mfa` claim, backend §1) */
  mfa: boolean;
  setSession: (payload: SetSessionPayload) => void;
  setDesignSession: (payload: SetDesignSessionPayload) => void;
  /** two-step passed (enrolment verified) */
  markMfa: () => void;
  clearSession: () => void;
  // Permission checkers used by guards and the <Can> component.
  can: (permission: Permission) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canAny: (permissions: Permission[]) => boolean;
}

// Zustand is the primary client store (session + permissions). Server data
// (profile, notifications) lives in React Query, never here.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isHydrating: true,
      session: null,
      mfa: false,
      setSession: ({ user, token, refreshToken, permissions }) => {
        authStorage.setToken(token);
        if (refreshToken) authStorage.setRefreshToken(refreshToken);
        set({ user, token, permissions, isAuthenticated: true, session: null, mfa: false });
      },
      // Design sign-in: permissions come from the chapter roles (§6.3 matrix); the starter `user`
      // is filled too, so code that reads it keeps working.
      setDesignSession: ({ session, token, mfa }) => {
        authStorage.setToken(token);
        const now = new Date().toISOString();
        set({
          session,
          mfa,
          token,
          isAuthenticated: true,
          permissions: session.platformRole === 'SUPER_ADMIN' ? ALL_PERMISSIONS : permissionsFor(session.roles),
          user: { id: session.id, email: session.email, role: session.platformRole, is_verified: true, created_at: now, updated_at: now },
        });
      },
      markMfa: () => set({ mfa: true }),
      clearSession: () => {
        authStorage.clear();
        set({ user: null, token: null, permissions: [], isAuthenticated: false, session: null, mfa: false });
      },
      // SUPER_ADMIN bypasses permission checks (backend §6.3), as the API does.
      can: (permission) => get().session?.platformRole === 'SUPER_ADMIN' || get().permissions.includes(permission),
      canAll: (permissions) => get().session?.platformRole === 'SUPER_ADMIN' || permissions.every((p) => get().permissions.includes(p)),
      canAny: (permissions) => get().session?.platformRole === 'SUPER_ADMIN' || permissions.some((p) => get().permissions.includes(p)),
    }),
    {
      name: 'auth-store',
      // Persist only identity — the token itself lives in authStorage.
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        permissions: s.permissions,
        isAuthenticated: s.isAuthenticated,
        session: s.session,
        mfa: s.mfa,
      }),
      // Flip the hydration flag once persisted state is restored so guards wait.
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrating = false;
      },
    },
  ),
);
