import type { Submission, VolunteerSignup } from '@/domain/entities/engagement.types';
import { routeSubmission, type RouteInput } from '@/domain/rules/engagement';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { ELIGIBILITY_INBOX, ROUTING_RULES, SIGNUPS, SUBMISSIONS } from '../fixtures/submissions';

// The public forms' records (FE-10): every form is stored before it is routed, with its source page;
// volunteer sign-ups also go to each role's team; routing rules are edited in the admin console.
// The engagement service writes here, the admin console reads it. (Part B: engagement-service.)
export const engagementMockStore = createMockStore('engagement', () => ({
  submissions: SUBMISSIONS,
  signups: SIGNUPS,
  rules: ROUTING_RULES,
}));

const today = () => new Date().toISOString().slice(0, 10);
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
/** the page the form was sent from (the API reads it from the request) */
const currentPath = () => (typeof window === 'undefined' ? '' : window.location.pathname);

export interface NewSubmission extends Omit<Submission, 'id' | 'routedTo' | 'receivedOn' | 'status' | 'sourcePath' | 'topicText'> {
  sourcePath?: string;
  route: Omit<RouteInput, 'kind'>;
}

/** Stores a form, routed by the rules in force. */
export function storeSubmission({ route, sourcePath, ...submission }: NewSubmission): Submission {
  const rules = engagementMockStore.read().rules;
  const record: Submission = {
    ...submission,
    id: newId('sb'),
    topicText: null,
    sourcePath: sourcePath ?? currentPath(),
    routedTo: routeSubmission(rules, { kind: submission.kind, ...route }, ELIGIBILITY_INBOX),
    receivedOn: today(),
    status: 'NEW',
  };
  engagementMockStore.mutate((db) => void db.submissions.unshift(record));
  return record;
}

export function storeSignup(signup: Omit<VolunteerSignup, 'id' | 'receivedOn' | 'status'>): VolunteerSignup {
  const record: VolunteerSignup = { ...signup, id: newId('vs'), receivedOn: today(), status: 'NEW' };
  engagementMockStore.mutate((db) => void db.signups.unshift(record));
  return record;
}
