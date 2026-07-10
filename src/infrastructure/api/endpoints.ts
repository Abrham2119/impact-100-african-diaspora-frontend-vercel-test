// All endpoint strings live here — never inline them in services.
// Paths are relative to API_CONFIG.baseURL ("/api" → Express gateway),
// which prefixes the gateway's "/v1/..." routing.
export const API_ENDPOINTS = {
  auth: {
    register: 'v1/auth/register',
    adminCreateUser: 'v1/auth/admin/users',
    login: 'v1/auth/login',
    verifyOtp: 'v1/auth/otp/verify',
    resendOtp: 'v1/auth/otp/resend',
    verifyEmail: 'v1/auth/verify-email',
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
    remove: (id: string) => `v1/users/${id}`,
  },
  permissions: {
    check: 'v1/permissions/check',
    // Roles CRUD
    roles: 'v1/permissions/roles',
    roleById: (id: string) => `v1/permissions/roles/${id}`,
    rolePermissions: (roleId: string) => `v1/permissions/roles/${roleId}/permissions`,
    // Permissions CRUD
    permissions: 'v1/permissions/permissions',
    permissionById: (id: string) => `v1/permissions/permissions/${id}`,
    // User ↔ role/permission assignment
    userRoles: (userId: string) => `v1/permissions/users/${userId}/roles`,
    userRolesBulk: (userId: string) => `v1/permissions/users/${userId}/roles/bulk`,
    userRoleById: (userId: string, roleId: string) =>
      `v1/permissions/users/${userId}/roles/${roleId}`,
    userPermissions: (id: string) => `v1/permissions/users/${id}/permissions`,
    userPermissionsBulk: (userId: string) => `v1/permissions/users/${userId}/permissions/bulk`,
    userDirectPermissions: (userId: string) =>
      `v1/permissions/users/${userId}/permissions/direct`,
  },
  notifications: {
    list: 'v1/notifications',
    unreadCount: 'v1/notifications/unread-count',
    markAllRead: 'v1/notifications/read-all',
    markManyRead: 'v1/notifications/read',
    byId: (id: string) => `v1/notifications/${id}`,
    markRead: (id: string) => `v1/notifications/${id}/read`,
    // Web Push
    vapidKey: 'v1/notifications/push/vapid-key',
    pushSubscribe: 'v1/notifications/push/subscribe',
    pushUnsubscribe: 'v1/notifications/push/unsubscribe',
  },
} as const;
