// Wire shapes of the public engagement API (backend docs/ARCHITECTURE.md §4.6, `/api/v1/engagement`).
// Every public POST returns a reference and never echoes personal data back.

export interface ReferenceDto {
  reference: string;
}

export interface ContactRequestDto {
  name: string;
  email: string;
  phone?: string;
  topic_key: string;
  message: string;
  consent: boolean;
  source_path: string;
}
export interface ContactResponseDto extends ReferenceDto {
  routed: true;
}

export interface VolunteerSignupRequestDto {
  name: string;
  email: string;
  location: string;
  note?: string;
  role_keys: string[];
  source_path: string;
}
export interface VolunteerSignupResponseDto extends ReferenceDto {
  teams: Array<{ team_key: string; label: string }>;
}

export interface HubMembershipRequestDto {
  hub_key: string;
  name: string;
  email: string;
}
export interface HubMembershipResponseDto extends ReferenceDto {
  hub_key: string;
}

export interface RsvpRequestDto {
  name?: string;
  email?: string;
}
export interface RsvpResponseDto {
  status: 'GOING' | 'WAITLISTED';
  seats_left: number | null;
}
export type EventAvailabilityDto = Record<string, { capacity: number | null; going: number; seats_left: number | null; rsvp_open: boolean }>;

export interface CommitteeInterestRequestDto {
  committee_key: string;
  name: string;
  email: string;
  note: string;
}

/** multipart in the API; the photo travels as a File */
export interface StoryRequestDto {
  name: string;
  email: string;
  title: string;
  body: string;
  photo?: File;
  photo_alt?: string;
}

export interface EligibilityRequestDto {
  answers: Record<string, boolean>;
  org_name?: string;
}
export interface EligibilityResponseDto {
  passed: boolean;
}
