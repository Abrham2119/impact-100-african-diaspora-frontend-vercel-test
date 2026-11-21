import { collectionsEn } from '@/features/content/fixtures/en/collections';
import { mockReference, mockResponse } from '@/infrastructure/api/mock';
import { storeSignup, storeSubmission } from './engagementStore';
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
// moves to apiClient + API_ENDPOINTS.engagement. Every form is stored (and routed) in the engagement
// mock store, so the admin console's Submissions and Volunteer sign-ups show it (FE-10).

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
      storeSubmission({
        kind: 'CONTACT',
        fromName: request.name.trim(),
        email: request.email.trim(),
        topicKey: request.topic_key,
        message: request.message.trim(),
        sourcePath: request.source_path,
        route: { topicKey: request.topic_key },
      });
      return { reference: mockReference('CT'), routed: true as const };
    }),
  volunteerSignup: (request: VolunteerSignupRequestDto): Promise<VolunteerSignupResponseDto> =>
    mockResponse(() => {
      const name = request.name.trim();
      const note = request.note?.trim() || null;
      storeSignup({ name, email: request.email.trim(), roleKeys: request.role_keys, location: request.location.trim(), note });
      storeSubmission({ kind: 'VOLUNTEER', fromName: name, email: request.email.trim(), topicKey: request.role_keys.join(','), message: note, sourcePath: request.source_path, route: {} });
      return { reference: mockReference('VS'), teams: teamsFor(request.role_keys) };
    }),
  hubMembership: (request: HubMembershipRequestDto): Promise<HubMembershipResponseDto> =>
    mockResponse(() => {
      storeSubmission({ kind: 'HUB', fromName: request.name.trim(), email: request.email.trim(), topicKey: request.hub_key, message: null, route: { hubKey: request.hub_key } });
      return { reference: mockReference('HM'), hub_key: request.hub_key };
    }),
  rsvp: (eventKey: string, request: RsvpRequestDto): Promise<RsvpResponseDto> =>
    mockResponse(() => {
      rsvps.add(eventKey);
      storeSubmission({ kind: 'RSVP', fromName: request.name?.trim() || null, email: request.email?.trim() || null, topicKey: eventKey, message: null, route: {} });
      return { status: 'GOING' as const, seats_left: null };
    }),
  eventAvailability: (eventKeys: string[]): Promise<EventAvailabilityDto> =>
    mockResponse(
      () => Object.fromEntries(eventKeys.map((key) => [key, { capacity: null, going: rsvps.has(key) ? 1 : 0, seats_left: null, rsvp_open: true }])),
      0,
    ),
  committeeInterest: (request: CommitteeInterestRequestDto): Promise<ReferenceDto> =>
    mockResponse(() => {
      storeSubmission({
        kind: 'COMMITTEE',
        fromName: request.name.trim(),
        email: request.email.trim(),
        topicKey: request.committee_key,
        message: request.note.trim() || null,
        route: { committeeKey: request.committee_key },
      });
      return { reference: mockReference('CI') };
    }),
  story: (request: StoryRequestDto): Promise<ReferenceDto> =>
    mockResponse(() => {
      // the photo stays with the API (multipart); the record keeps the text for the editor
      storeSubmission({ kind: 'STORY', fromName: request.name.trim(), email: request.email.trim(), topicKey: 'story', title: request.title.trim(), message: request.body.trim(), route: {} });
      return { reference: mockReference('ST') };
    }),
  eligibility: (request: EligibilityRequestDto): Promise<EligibilityResponseDto> =>
    mockResponse(() => {
      const answers = Object.values(request.answers);
      storeSubmission({
        kind: 'ELIGIBILITY',
        fromName: request.org_name?.trim() || null,
        email: null,
        topicKey: null,
        answers: { yes: answers.filter(Boolean).length, total: answers.length },
        message: null,
        route: {},
      });
      return { passed: answers.every(Boolean) };
    }, 0),
};
