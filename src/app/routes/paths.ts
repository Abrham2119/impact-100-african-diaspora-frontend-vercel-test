// Single source of truth for route paths — never hardcode strings elsewhere.
export const PATHS = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyOtp: '/auth/verify-otp',
  },
  app: {
    dashboard: '/app/dashboard',
    profile: '/app/profile',
    settings: '/app/settings',
    notifications: '/app/notifications',
    users: '/app/users',
  },
} as const;
