import type { ChapterRole, PlatformRole } from '@/domain/enums/role.enum';

// The signed-in person as the design areas see them (portal, admin, header menu): identity,
// platform role, chapter roles (with scopes) and the computed voting eligibility. Framework-free.
export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  platformRole: PlatformRole;
  roles: ChapterRole[];
  /** more than the voting threshold received in the active cycle (computed by the server) */
  votingEligible: boolean;
}

/**
 * Who a header account-menu link is for (CMS nav data): signed-out visitors, anyone signed in,
 * people who are not members (and not admins), the admin-console roles.
 */
export type MenuAudience = 'signedOut' | 'signedIn' | 'nonMember' | 'admin';
