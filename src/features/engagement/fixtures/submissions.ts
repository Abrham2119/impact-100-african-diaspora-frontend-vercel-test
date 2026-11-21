import type { RoutingRule, Submission, VolunteerSignup } from '@/domain/entities/engagement.types';

// What the public forms have left on record (admin_submissions, admin_signups, admin_routing
// .dc.html), verbatim. Forms sent in the demo are added on top. Topics are collection keys where
// the design's text is a collection entry; the design's own wording is kept as `topicText`.

export const SUBMISSIONS: Submission[] = [
  { id: 'sb-5', kind: 'CONTACT', fromName: 'J. Asante', email: null, topicKey: 'partner', topicText: null, message: null, sourcePath: '/nonprofits', routedTo: 'partners@', receivedOn: '2026-11-17', status: 'NEW' },
  { id: 'sb-4', kind: 'STORY', fromName: 'Amara Mensah', email: null, topicKey: 'story', topicText: null, message: null, sourcePath: '/share-story', routedTo: 'editors@', receivedOn: '2026-11-16', status: 'NEW' },
  {
    id: 'sb-3',
    kind: 'ELIGIBILITY',
    fromName: 'Kisumu youth trust',
    email: null,
    topicKey: null,
    topicText: null,
    answers: { yes: 4, total: 4 },
    message: null,
    sourcePath: '/nonprofits',
    routedTo: 'grants@',
    receivedOn: '2026-11-16',
    status: 'NEW',
  },
  { id: 'sb-2', kind: 'RSVP', fromName: 'T. Ade', email: null, topicKey: null, topicText: 'Atlanta hub launch', message: null, sourcePath: '/events/atlanta-launch', routedTo: 'atlanta@', receivedOn: '2026-11-15', status: 'NEW' },
  { id: 'sb-1', kind: 'COMMITTEE', fromName: 'R. Nkosi', email: null, topicKey: 'events-management', topicText: 'Events', message: null, sourcePath: '/committees', routedTo: 'events@', receivedOn: '2026-11-14', status: 'NEW' },
];

export const SIGNUPS: VolunteerSignup[] = [
  { id: 'vs-3', name: 'Grace Mwale', email: null, roleKeys: ['atlanta-hub-launch-team'], location: 'Atlanta, GA', note: null, receivedOn: '2026-11-15', status: 'CONTACTED' },
  { id: 'vs-2', name: 'Samuel Owusu', email: null, roleKeys: ['grants-selection-reviewer', 'ghana-hub-liaison'], location: 'Washington, DC', note: null, receivedOn: '2026-11-14', status: 'NEW' },
  { id: 'vs-1', name: 'Lindiwe Phiri', email: null, roleKeys: ['victoria-falls-summit-volunteer'], location: 'Oakland, CA', note: null, receivedOn: '2026-11-10', status: 'PLACED' },
];

const address = (a: string) => ({ type: 'ADDRESS' as const, address: a });
export const ROUTING_RULES: RoutingRule[] = [
  { id: 'rr-1', kind: 'CONTACT', topicKey: 'membership', inbox: address('membership@'), autoReply: true },
  { id: 'rr-2', kind: 'CONTACT', topicKey: 'partner', inbox: address('partners@'), autoReply: true },
  { id: 'rr-3', kind: 'CONTACT', topicKey: 'volunteering', inbox: address('volunteer@'), autoReply: true },
  { id: 'rr-4', kind: 'CONTACT', topicKey: 'sponsorship', inbox: address('sponsors@'), autoReply: true },
  { id: 'rr-5', kind: 'CONTACT', topicKey: 'story', inbox: address('editors@'), autoReply: true },
  { id: 'rr-6', kind: 'CONTACT', topicKey: 'press', inbox: address('press@'), autoReply: true },
  { id: 'rr-7', kind: 'HUB_RSVP', topicKey: null, inbox: { type: 'HUB' }, autoReply: true },
  { id: 'rr-8', kind: 'COMMITTEE', topicKey: null, inbox: { type: 'COMMITTEE' }, autoReply: true },
];

/** Eligibility checks have no routing rule; they go to the grants inbox (admin_submissions). */
export const ELIGIBILITY_INBOX = 'grants@';
