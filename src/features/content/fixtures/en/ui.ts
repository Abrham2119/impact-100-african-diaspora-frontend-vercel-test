import type { UiBundleDto } from '@/types/content.dto';
import { uiBundle } from './build';

// English seed of the UiStrings (component microcopy, CONTENT_AND_I18N.md §1), per namespace
// (ARCHITECTURE.md §8.4). Copied verbatim from the snapshots (labels, aria-labels, alt text).
// Served by `GET content/ui-strings?locale&namespace` from Step 13 as `{ key: LocalizedValue }`
// (the shape built below); editable in admin. Interpolation uses {name}.

const common = {
  'nav.toggle': 'Toggle navigation',
  'scroll.top': 'Back to top',
  'states.loading': 'Loading…',
  // Not in the design (it has no failure states); editable placeholders until the client words them.
  'states.errorTitle': 'Something went wrong',
  'states.errorBody': 'This content could not be loaded.',
  'states.retry': 'try again',
  'states.empty': 'Nothing to show yet.',
  'shell.logoAlt': 'Impact100 African Diaspora USA — website',
  'shell.rail': 'Main',
  'shell.sideMenu': '{group} menu',
  'shell.breadcrumb': 'Breadcrumb',
  'shell.home': 'Website home',
  'shell.donate': 'Donate',
  'shell.notifications': 'Notifications',
  'shell.account': 'Your account',
  'shell.logout': 'Log out',
  'shell.website': 'Website',
  'shell.portal': 'Portal',
};

const portal = {
  root: 'Member portal',
  // rail groups (rail label = sidebar title on the portal)
  'group.dashboard': 'Dashboard',
  'group.voting': 'Voting',
  'group.charter': 'Charter',
  'group.reviews': 'Reviews',
  'group.account': 'Account',
  // section sidebar items
  'item.summary': 'Summary',
  'item.history': 'Contribution history',
  'item.vote': 'Proposals and vote',
  'item.decisions': 'Chapter decisions',
  'item.results': 'Results',
  'item.suggest': 'Suggest and nominate',
  'item.sign': 'Sign charter',
  'item.reviews': 'My reviews',
  'item.profile': 'Profile & preferences',
  'item.privacy': 'Privacy & data',
  // page titles (h1)
  'title.dashboard': 'Dashboard',
  'title.history': 'Contribution history',
  'title.vote': 'Proposals & vote',
  'title.proposal': 'Proposal detail',
  'title.receipt': 'Vote receipt',
  'title.decisions': 'Chapter decisions',
  'title.amendment': 'Amendment detail',
  'title.results': 'Results',
  'title.result': 'Result detail',
  'title.suggest': 'Suggest & nominate',
  'title.sign': 'Sign the charter',
  'title.signed': 'Signature confirmation',
  'title.reviews': 'My reviews',
  'title.score': 'Score proposal',
  'title.profile': 'Profile & preferences',
  'title.privacy': 'Privacy & data',
  // last breadcrumb of detail pages
  'crumb.proposal': 'Proposal',
  'crumb.receipt': 'Receipt',
  'crumb.amendment': 'Amendment',
  'crumb.result': 'Result',
  'crumb.signed': 'Confirmation',
  'crumb.score': 'Score',
};

const admin = {
  root: 'Admin console',
  // rail labels
  'rail.dashboard': 'Dashboard',
  'rail.people': 'People',
  'rail.rules': 'Rules',
  'rail.payments': 'Payments',
  'rail.governance': 'Governance',
  'rail.engage': 'Engage',
  'rail.content': 'Content',
  'rail.system': 'System',
  // sidebar titles
  'group.overview': 'Overview',
  'group.people': 'People',
  'group.rules': 'Charter rules',
  'group.payments': 'Payments',
  'group.governance': 'Governance',
  'group.engagement': 'Engagement',
  'group.content': 'Content',
  'group.system': 'System',
  // section sidebar items (also the breadcrumb label of the page)
  'item.chapter': 'Chapter dashboard',
  'item.finance': 'Finance dashboard',
  'item.hub': 'Hub dashboard',
  'item.exports': 'Exports',
  'item.people': 'People',
  'item.roles': 'Roles',
  'item.permissions': 'Permission matrix',
  'item.campaigns': 'Campaigns',
  'item.settings': 'Charter settings',
  'item.approvals': 'Approval queue',
  'item.settingsHistory': 'Settings history',
  'item.ledger': 'Payments ledger',
  'item.offline': 'Record offline payment',
  'item.flags': 'Finance flags',
  'item.reconciliation': 'Reconciliation runs',
  'item.ballots': 'Ballots',
  'item.proposalNew': 'New proposal',
  'item.decisions': 'Decisions',
  'item.publish': 'Publish results',
  'item.nominations': 'Nominations queue',
  'item.signatures': 'Signature register',
  'item.rubric': 'Rubric settings',
  'item.reviewBoard': 'Review board',
  'item.signups': 'Volunteer sign-ups',
  'item.submissions': 'Submissions',
  'item.routing': 'Routing rules',
  'item.cms': 'CMS studio',
  'item.preview': 'Preview',
  'item.emails': 'Email templates',
  'item.delivery': 'Delivery log',
  'item.audit': 'Audit log',
  // page titles (h1) that differ from the sidebar label
  'title.dashboard': 'Dashboard',
  'title.person': 'Person detail',
  'title.auditEntry': 'Audit entry',
  'crumb.auditEntry': 'Entry',
};

// Public-site content blocks (Step 5): sliders, cards, forms and dialogs of the CMS sections.
// Copied verbatim from the .dc.html sources (aria-labels, button labels, form labels).
const site = {
  'slider.dot': '{page} of {pages}',
  'slider.previous': 'Previous',
  'slider.next': 'Next',
  readMore: 'Read more',
  'event.rsvp': 'RSVP',
  'campaign.progress': 'Raised',
  'campaign.raised': 'Raised {amount}',
  'campaign.goal': 'Goal {amount}',
  'campaign.title': '{name} · {start} – {end}',
  'campaign.status.active': 'Active',
  'campaign.status.completed': 'Completed',
  'campaign.cta.active': 'join this campaign',
  'campaign.cta.completed': 'view campaign',
  'video.play': 'Play video',
  'donate.amountLabel': 'Donation amount',
  'pagination.nav': 'Page navigation example',
  'pagination.previous': 'Previous',
  'pagination.next': 'Next',
  'gallery.open': 'Open photo {n}',
  'lightbox.label': 'Image viewer',
  'lightbox.close': 'Close',
  'lightbox.next': 'Next image',
  'lightbox.previous': 'Previous image',
  'lightbox.nextText': 'Next',
  'lightbox.previousText': 'Prev',
  'lightbox.count': '{n}/{total}',
  'committee.help': 'i’d like to help',
  'committee.size': 'Size: {seats}',
  'committee.name': 'Name',
  'committee.email': 'Email',
  'committee.note': 'Short note',
  'committee.notePlaceholder': 'How you’d like to help',
  'committee.send': 'send to committee',
  'committee.sentTitle': 'Sent',
  'committee.sentBody': 'Your note went to the {name} committee.',
  'charter.sections': 'Sections',
  'charter.version': 'Version',
  'charter.oldTitle': 'You are reading an earlier version',
  'charter.oldBody': 'This version is kept for reference. The current version is the {current}.',
};

const source = { common, portal, admin, site };

export type UiNamespace = keyof typeof source;
export type UiKey<N extends UiNamespace> = keyof (typeof source)[N] & string;
/** one namespace bundle after mapping: a flat key → text map */
export type UiBundle = Record<string, string>;

export const uiStringsEn = Object.fromEntries(
  Object.entries(source).map(([namespace, strings]) => [namespace, uiBundle(strings)]),
) as Record<UiNamespace, UiBundleDto>;
