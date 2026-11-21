import { useMutation, useQuery } from '@tanstack/react-query';
import type { RsvpRequestDto } from '@/types/engagement.dto';
import { engagementService } from '../api/engagementService';

// Mutations of the public forms and the RSVP availability read.

export const useSubmitContact = () => useMutation({ mutationFn: engagementService.contact });
export const useSubmitVolunteerSignup = () => useMutation({ mutationFn: engagementService.volunteerSignup });
export const useJoinHub = () => useMutation({ mutationFn: engagementService.hubMembership });
export const useSubmitCommitteeInterest = () => useMutation({ mutationFn: engagementService.committeeInterest });
export const useSubmitStory = () => useMutation({ mutationFn: engagementService.story });
export const useCheckEligibility = () => useMutation({ mutationFn: engagementService.eligibility });

export function useRsvp(eventKey: string) {
  return useMutation({ mutationFn: (request: RsvpRequestDto) => engagementService.rsvp(eventKey, request) });
}

export function useEventAvailability(eventKeys: string[]) {
  return useQuery({
    queryKey: ['engagement', 'availability', [...eventKeys].sort()],
    queryFn: () => engagementService.eventAvailability(eventKeys),
    enabled: eventKeys.length > 0,
    staleTime: 30_000,
  });
}
