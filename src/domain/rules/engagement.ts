import type { RoutingRule, SubmissionKind } from '@/domain/entities/engagement.types';

// Routing (admin_routing.dc.html): each form kind and topic goes to a set inbox; hub-related forms
// go to the hub's inbox, committee interests to the committee's. Stories and volunteer sign-ups
// follow the contact topic of the same name ("Share a story", "Volunteering"). Pure; the mock
// engagement service routes with it now, the API in Part B.

/** The contact topic a kind without its own rules follows. */
const FOLLOWS_TOPIC: Partial<Record<SubmissionKind, string>> = { STORY: 'story', VOLUNTEER: 'volunteering' };

export interface RouteInput {
  kind: SubmissionKind;
  /** contact topic */
  topicKey?: string | null;
  hubKey?: string | null;
  committeeKey?: string | null;
}

/**
 * The inbox a submission goes to: an address ("partners@", "atlanta@"), or "HUB" / "COMMITTEE"
 * when the rule names the hub's / committee's inbox and the form doesn't say which; `fallback`
 * when no rule matches (e.g. eligibility checks, which go to the grants inbox).
 */
export function routeSubmission(rules: RoutingRule[], input: RouteInput, fallback: string): string {
  const topic = FOLLOWS_TOPIC[input.kind] ?? input.topicKey ?? null;
  const kind = input.kind === 'HUB' || input.kind === 'RSVP' ? 'HUB_RSVP' : input.kind === 'COMMITTEE' ? 'COMMITTEE' : input.kind === 'ELIGIBILITY' ? null : 'CONTACT';
  if (!kind) return fallback;
  const candidates = rules.filter((r) => r.kind === kind);
  const rule = candidates.find((r) => r.topicKey !== null && r.topicKey === topic) ?? candidates.find((r) => r.topicKey === null);
  if (!rule) return fallback;
  if (rule.inbox.type === 'ADDRESS') return rule.inbox.address;
  if (rule.inbox.type === 'HUB') return input.hubKey ? `${input.hubKey}@` : 'HUB';
  return input.committeeKey ? `${input.committeeKey}@` : 'COMMITTEE';
}
