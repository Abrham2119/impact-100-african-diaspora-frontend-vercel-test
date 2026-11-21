import { useMemo } from 'react';
import type { ShellNamespace } from '@/config/navigation/types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { imageUrl } from '@/features/content/fixtures/builders';
import { useBallot, useDecisions, useReviews } from '@/features/governance/hooks/usePortalGovernance';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { useMyMembership } from '@/features/membership/hooks/useMyMembership';
import { levelName } from '@/features/membership/lib/levelName';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';

// What the portal / admin shell shows about the signed-in person and the moment (portal.dc.html,
// admin.dc.html): name + avatar + status line in the sidebar, the campaign pill, the bell and the
// sidebar counts (proposals to vote on, open decisions, reviews to do). From the repositories.
const ADMIN_ROLE_ORDER = ['CHAPTER_ADMIN', 'USAFI_FINANCE', 'CONTENT_EDITOR', 'HUB_CO_AMBASSADOR'] as const satisfies readonly ChapterRoleName[];

export function useShellIdentity(namespace: ShellNamespace) {
  const session = useAuthStore((s) => s.session);
  const mfa = useAuthStore((s) => s.mfa);
  const email = useAuthStore((s) => s.user?.email ?? '');
  const ts = useT('site');
  const tp = useT('portal');
  const ta = useT('admin');
  const { data: profile } = useMyProfile();
  const { data: membership } = useMyMembership();
  const { data: active } = useCampaigns('active');
  const { data: ballot } = useBallot();
  const { data: decisions } = useDecisions();
  const { data: reviews } = useReviews();

  return useMemo(() => {
    const name = profile?.fullName || session?.fullName || email;
    let detail: string | undefined;
    if (namespace === 'portal') {
      if (membership?.levelKey) {
        const level = levelName(ts, membership.levelKey);
        detail = membership.votingEligible ? tp('status.voting', { level }) : tp('status.member', { level });
      } else if (session) detail = tp('status.supporter');
    } else if (session) {
      const role = session.platformRole === 'SUPER_ADMIN' ? ('SUPER_ADMIN' as const) : ADMIN_ROLE_ORDER.find((r) => session.roles.some((x) => x.role === r));
      if (role) {
        const label = ta(`role.${role}`);
        detail = mfa ? ta('status.mfa', { role: label }) : label;
      }
    }
    const toVote = ballot ? ballot.proposals.filter((p) => !ballot.mine[p.id]).length : undefined;
    const campaign = active?.[0];
    return {
      name,
      detail,
      avatarUrl: profile?.avatarFile ? imageUrl(profile.avatarFile) : undefined,
      pill: namespace === 'portal' && campaign ? { label: tp('pill.renew', { campaign: campaign.name }), to: PATHS.public.campaigns } : undefined,
      bellCount: toVote,
      counts: {
        vote: toVote,
        decisions: decisions?.length,
        reviews: reviews?.assignments.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'NOT_STARTED').length,
      } as Record<string, number | undefined>,
    };
  }, [profile, session, email, namespace, membership, ts, tp, ta, mfa, ballot, active, decisions, reviews]);
}
