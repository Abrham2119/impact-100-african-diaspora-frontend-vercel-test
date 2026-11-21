import { collectionsEn } from '@/features/content/fixtures/en/collections';
import { mockReference, mockResponse } from '@/infrastructure/api/mock';
import type {
  CommitteeInterestRequestDto,
  ContactRequestDto,
  ContactResponseDto,
  EligibilityRequestDto,
  EligibilityResponseDto,
  EventAvailabilityDto,
  HubMembershipRequestDto,
  HubMembershipResponseDto,
  ReferenceDto,
  RsvpRequestDto,
  RsvpResponseDto,
  StoryRequestDto,
  VolunteerSignupRequestDto,
  VolunteerSignupResponseDto,
} from '@/types/engagement.dto';

// Public engagement API (backend §4.6, `/api/v1/engagement`): contact, volunteer sign-ups, hub
// memberships, RSVPs, committee interests, stories, the nonprofit eligibility check. Mocked until
// Step 13 — each function returns the documented response shape; only this file changes when it
// moves to apiClient + API_ENDPOINTS.engagement.

/** The teams that receive a volunteer sign-up: the distinct owners of the chosen roles. */
function teamsFor(roleKeys: string[]): VolunteerSignupResponseDto['teams'] {
  const roles = collectionsEn.volunteer_roles ?? [];
  const teams = new Map<string, string>();
  for (const key of roleKeys) {
    const role = roles.find((entry) => entry.key === key);
    const teamKey = role?.data.team_key;
    const label = role?.fields.team?.value;
    if (typeof teamKey === 'string' && typeof label === 'string') teams.set(teamKey, label);
  }
  return [...teams].map(([team_key, label]) => ({ team_key, label }));
}

const rsvps = new Set<string>();

export const engagementService = {
  contact: (request: ContactRequestDto): Promise<ContactResponseDto> =>
    mockResponse(() => {
      void request;
      return { reference: mockReference('CT'), routed: true as const };
    }),
  volunteerSignup: (request: VolunteerSignupRequestDto): Promise<VolunteerSignupResponseDto> =>
    mockResponse(() => ({ reference: mockReference('VS'), teams: teamsFor(request.role_keys) })),
  hubMembership: (request: HubMembershipRequestDto): Promise<HubMembershipResponseDto> =>
    mockResponse(() => ({ reference: mockReference('HM'), hub_key: request.hub_key })),
  rsvp: (eventKey: string, request: RsvpRequestDto): Promise<RsvpResponseDto> =>
    mockResponse(() => {
      void request;
      rsvps.add(eventKey);
      return { status: 'GOING' as const, seats_left: null };
    }),
  eventAvailability: (eventKeys: string[]): Promise<EventAvailabilityDto> =>
    mockResponse(
      () => Object.fromEntries(eventKeys.map((key) => [key, { capacity: null, going: rsvps.has(key) ? 1 : 0, seats_left: null, rsvp_open: true }])),
      0,
    ),
  committeeInterest: (request: CommitteeInterestRequestDto): Promise<ReferenceDto> =>
    mockResponse(() => {
      void request;
      return { reference: mockReference('CI') };
    }),
  story: (request: StoryRequestDto): Promise<ReferenceDto> =>
    mockResponse(() => {
      void request;
      return { reference: mockReference('ST') };
    }),
  eligibility: (request: EligibilityRequestDto): Promise<EligibilityResponseDto> =>
    mockResponse(() => ({ passed: Object.values(request.answers).every(Boolean) }), 0),
};
