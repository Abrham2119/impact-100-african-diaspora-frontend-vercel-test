import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RsvpRequestDto } from '@/types/engagement.dto';
import { engagementService } from '../api/engagementService';

// Mutations of the public forms and the RSVP availability read. A stored form shows in the admin
// console's Submissions / Volunteer sign-ups, so each one refreshes the admin cache.
function useFormMutation<V, R>(fn: (value: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }) });
}

export const useSubmitContact = () => useFormMutation(engagementService.contact);
export const useSubmitVolunteerSignup = () => useFormMutation(engagementService.volunteerSignup);
export const useJoinHub = () => useFormMutation(engagementService.hubMembership);
export const useSubmitCommitteeInterest = () => useFormMutation(engagementService.committeeInterest);
export const useSubmitStory = () => useFormMutation(engagementService.story);
export const useCheckEligibility = () => useFormMutation(engagementService.eligibility);

export function useRsvp(eventKey: string) {
  return useFormMutation((request: RsvpRequestDto) => engagementService.rsvp(eventKey, request));
}

export function useEventAvailability(eventKeys: string[]) {
  return useQuery({
    queryKey: ['engagement', 'availability', [...eventKeys].sort()],
    queryFn: () => engagementService.eventAvailability(eventKeys),
    enabled: eventKeys.length > 0,
    staleTime: 30_000,
  });
}
