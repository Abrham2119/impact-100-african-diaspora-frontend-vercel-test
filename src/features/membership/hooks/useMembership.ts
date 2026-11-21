import { useMutation, useQuery } from '@tanstack/react-query';
import { campaignService } from '../api/campaignService';
import { donationService } from '../api/donationService';
import { joinService } from '../api/joinService';
import { settingsService } from '../api/settingsService';
import { CAMPAIGNS_STALE_TIME, SETTINGS_STALE_TIME, membershipKeys } from '../lib/queryKeys';

// Public membership hooks: charter settings, one campaign, the join and donation checkouts.

/** Charter settings (levels, thresholds, installments) — one source for every page. */
export function usePublicSettings() {
  return useQuery({
    queryKey: membershipKeys.settings(),
    queryFn: settingsService.get,
    initialData: settingsService.seed,
    staleTime: SETTINGS_STALE_TIME,
  });
}

/** One campaign by slug (`null` = not found). */
export function useCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: membershipKeys.campaign(slug ?? ''),
    queryFn: () => campaignService.get(slug ?? ''),
    initialData: () => (slug ? campaignService.seedOne(slug) : undefined),
    enabled: slug !== undefined,
    staleTime: CAMPAIGNS_STALE_TIME,
  });
}

export function useStartJoin() {
  return useMutation({ mutationFn: joinService.start });
}

/** Payment status of a join checkout (the wizard's "Done" step). */
export function useJoinIntent(intentId: string | null) {
  return useQuery({
    queryKey: membershipKeys.joinIntent(intentId ?? ''),
    queryFn: () => joinService.intent(intentId ?? ''),
    enabled: intentId !== null,
  });
}

export function useStartDonation() {
  return useMutation({ mutationFn: donationService.start });
}

/** The monthly gift behind a receipt-email cancel link. */
export function useDonationCancelInfo(token: string) {
  return useQuery({
    queryKey: membershipKeys.donationCancel(token),
    queryFn: () => donationService.cancelInfo(token),
  });
}

export function useCancelDonation() {
  return useMutation({ mutationFn: donationService.cancel });
}
