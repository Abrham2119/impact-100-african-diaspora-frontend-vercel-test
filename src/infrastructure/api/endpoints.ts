// All endpoint strings live here — never inline them in services.
// Paths are relative to API_CONFIG.baseURL ("/api" → Express gateway),
// which prefixes the gateway's "/v1/..." routing.
export const API_ENDPOINTS = {
  auth: {
    register: 'v1/auth/register',
    login: 'v1/auth/login',
    verifyOtp: 'v1/auth/otp/verify',
    resendOtp: 'v1/auth/otp/resend',
    forgotPassword: 'v1/auth/forgot-password',
    resetPassword: 'v1/auth/reset-password',
    refresh: 'v1/auth/refresh',
    logout: 'v1/auth/logout',
    twoFactorSetup: 'v1/auth/2fa/setup',
    twoFactorVerify: 'v1/auth/2fa/verify',
    twoFactorDisable: 'v1/auth/2fa/disable',
  },
  users: {
    me: 'v1/users/me',
    settings: 'v1/users/me/settings',
    notificationSettings: 'v1/users/me/notification-settings',
    avatar: 'v1/users/me/avatar',
    list: 'v1/users',
    byId: (id: string) => `v1/users/${id}`,
    suspend: (id: string) => `v1/users/${id}/suspend`,
    activate: (id: string) => `v1/users/${id}/activate`,
  },
  permissions: {
    check: 'v1/permissions/check',
    roles: 'v1/permissions/roles',
    permissions: 'v1/permissions/permissions',
    userPermissions: (id: string) => `v1/permissions/users/${id}/permissions`,
  },
  notifications: {
    list: 'v1/notifications',
    unreadCount: 'v1/notifications/unread-count',
    markAllRead: 'v1/notifications/read-all',
    byId: (id: string) => `v1/notifications/${id}`,
    markRead: (id: string) => `v1/notifications/${id}/read`,
  },
} as const;
