// Platform roles issued by auth-service. The very first registered user is
// force-promoted to SUPER_ADMIN by the backend.
export type PlatformRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export const PlatformRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

// Chapter roles (backend docs/ARCHITECTURE.md §6.1). "Voting member" is not a role: it is computed
// from what has been received in the cycle (BUSINESS_RULES "Voting and decisions").
export type ChapterRoleName =
  | 'MEMBER'
  | 'COMMITTEE_MEMBER'
  | 'HUB_CO_AMBASSADOR'
  | 'CONTENT_EDITOR'
  | 'USAFI_FINANCE'
  | 'CHAPTER_ADMIN';

/** A granted chapter role; committee and hub roles carry their scope. */
export interface ChapterRole {
  role: ChapterRoleName;
  scopeType?: 'COMMITTEE' | 'HUB';
  scopeId?: string;
}
