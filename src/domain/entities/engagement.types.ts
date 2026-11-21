// What the public forms leave on record (backend §4.6 engagement, admin_submissions / admin_signups /
// admin_routing .dc.html). Framework-free. Every form is stored before it is routed, with its source page.

export type SubmissionKind = 'CONTACT' | 'VOLUNTEER' | 'HUB' | 'RSVP' | 'COMMITTEE' | 'STORY' | 'ELIGIBILITY';

/** An inbox a rule sends to: an address ("partners@") or the hub's / committee's own inbox. */
export type InboxTarget = { type: 'ADDRESS'; address: string } | { type: 'HUB' } | { type: 'COMMITTEE' };

export interface Submission {
  id: string;
  kind: SubmissionKind;
  /** the name given on the form (an organisation for eligibility checks); null when none was asked */
  fromName: string | null;
  email: string | null;
  /**
   * What the form was about, as a key of its collection: contact topic, committee, US hub, event,
   * volunteer roles (comma-separated). Null when the kind has no topic (story) or for seeded rows
   * whose topic is only known as text.
   */
  topicKey: string | null;
  /** the design's topic text for seeded rows ("Atlanta hub launch") */
  topicText: string | null;
  /** eligibility checks: yes answers and questions */
  answers?: { yes: number; total: number };
  /** the form's free text (message, note, story body) */
  message: string | null;
  /** a story's title */
  title?: string;
  sourcePath: string;
  /** the inbox it was routed to: an address, or "HUB" / "COMMITTEE" when the hub / committee is unknown */
  routedTo: string;
  /** ISO date */
  receivedOn: string;
  /** stories: approved as a news draft for an editor (FE-11 picks the drafts up) */
  status: 'NEW' | 'APPROVED';
}

export type PlacementStatus = 'NEW' | 'CONTACTED' | 'PLACED';
/** A volunteer sign-up: one sign-up with several roles goes to each role's team. */
export interface VolunteerSignup {
  id: string;
  name: string;
  email: string | null;
  /** keys of C:volunteer_roles */
  roleKeys: string[];
  location: string;
  note: string | null;
  receivedOn: string;
  status: PlacementStatus;
}

/** Rules are set per contact topic, for hub forms (join + RSVP) and for committee interests; stories and
 *  volunteer sign-ups follow the contact topic of the same name. */
export type RoutingKind = 'CONTACT' | 'HUB_RSVP' | 'COMMITTEE';
export interface RoutingRule {
  id: string;
  kind: RoutingKind;
  /** a contact topic key; null = any topic */
  topicKey: string | null;
  inbox: InboxTarget;
  autoReply: boolean;
}
