import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope } from '@/types/api';
import type { User } from '@/domain/entities/user.types';
import type { Permission } from '@/domain/enums/permission.enum';
import type { PlatformRole } from '@/domain/enums/role.enum';
import { ALL_PERMISSIONS } from '@/constant/permissions';

// ─── Request payloads ────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role?: PlatformRole;
}
export interface VerifyOtpPayload {
  email: string;
  code: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR';
}

// ─── Result the app consumes ─────────────────────────────────────────────────
export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  permissions: Permission[];
}

// Raw shape of the gateway's login `data` payload.
interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  expires_in: number;
  roles?: Array<{ permissions?: Array<{ name?: string }> }>;
  direct_permissions?: Array<{ name?: string }>;
}

// Flatten roles + direct permissions into a permission-string list.
// Admins get all known permissions for UX convenience — the API still
// enforces every request independently (client checks are UX only).
function derivePermissions(data: LoginData): Permission[] {
  const role = data.user.role;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return [...ALL_PERMISSIONS];
  }
  const fromRoles = (data.roles ?? []).flatMap((r) =>
    (r.permissions ?? []).map((p) => p.name).filter(Boolean),
  );
  const fromDirect = (data.direct_permissions ?? []).map((p) => p.name).filter(Boolean);
  return Array.from(new Set([...fromRoles, ...fromDirect])) as Permission[];
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<{ auth_id: string; message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ auth_id: string; message: string }>>(
      API_ENDPOINTS.auth.register,
      payload,
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const { data } = await apiClient.post<ApiEnvelope<LoginData>>(API_ENDPOINTS.auth.login, payload);
    const d = data.data;
    return {
      user: d.user,
      token: d.access_token,
      refreshToken: d.refresh_token,
      permissions: derivePermissions(d),
    };
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.verifyOtp,
      payload,
    );
    return data.data;
  },

  resendOtp: async (email: string, type: VerifyOtpPayload['type']): Promise<{ message: string }> => {
    const { data } = await apiClient.post<ApiEnvelope<{ message: string }>>(
      API_ENDPOINTS.auth.resendOtp,
      { email, type },
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },
};
