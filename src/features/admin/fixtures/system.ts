import type { Delivery, EmailTemplate } from '@/domain/entities/admin.types';

// Email templates and the delivery log (admin_emails, admin_delivery .dc.html), verbatim. Only
// "Vote opening" shows its subject and variables in the design; the other templates' wording is
// sample until the client supplies it, and they offer the same variables.
const VARIABLES = ['first_name', 'ballot_title', 'closes_at', 'portal_link'];
const template = (id: string, name: string, category: EmailTemplate['category'], attachment: EmailTemplate['attachment'], editedOn: string, subject = ''): EmailTemplate => ({
  id,
  name,
  category,
  attachment,
  editedOn,
  subject,
  body: '',
  variables: VARIABLES,
});

export const TEMPLATES: EmailTemplate[] = [
  template('login-link', 'Login link', 'TRANSACTIONAL', null, '2026-11-02'),
  template('payment-confirmed', 'Payment confirmed', 'TRANSACTIONAL', null, '2026-11-02'),
  template('rsvp-confirmation', 'RSVP confirmation', 'TRANSACTIONAL', 'ICS', '2026-11-03'),
  template('vote-opening', 'Vote opening', 'VOTE_NOTICES', null, '2026-11-04', 'Voting is open: [ballot_title]'),
  template('vote-reminder', 'Vote reminder', 'VOTE_NOTICES', null, '2026-11-04'),
  template('results-published', 'Results published', 'VOTE_NOTICES', null, '2026-11-04'),
  template('charter-signed', 'Charter signed', 'TRANSACTIONAL', 'PDF', '2026-11-05'),
  template('form-auto-reply', 'Form auto-reply', 'TRANSACTIONAL', null, '2026-11-05'),
  template('amendment-circulating', 'Amendment circulating', 'VOTE_NOTICES', null, '2026-11-06'),
];

/** the template the editor opens on (admin_emails "Edit · Vote opening") */
export const DEFAULT_TEMPLATE_ID = 'vote-opening';

export const DELIVERIES: Delivery[] = [
  { id: 'dl-5', sentAt: '2026-11-18T09:02', templateId: 'vote-reminder', recipient: { type: 'MEMBER', ref: '1042' }, status: 'DELIVERED', attempts: 1 },
  { id: 'dl-4', sentAt: '2026-11-18T08:47', templateId: 'login-link', recipient: { type: 'MEMBER', ref: '0981' }, status: 'DELIVERED', attempts: 1 },
  { id: 'dl-3', sentAt: '2026-11-18T08:30', templateId: 'payment-confirmed', recipient: { type: 'MEMBER', ref: '1107' }, status: 'RETRYING', attempts: 2 },
  { id: 'dl-2', sentAt: '2026-11-17T22:10', templateId: 'form-auto-reply', recipient: { type: 'VISITOR', ref: '5521' }, status: 'BOUNCED', attempts: 3 },
  { id: 'dl-1', sentAt: '2026-11-17T19:05', templateId: 'rsvp-confirmation', recipient: { type: 'VISITOR', ref: '5518' }, status: 'DELIVERED', attempts: 1 },
];
