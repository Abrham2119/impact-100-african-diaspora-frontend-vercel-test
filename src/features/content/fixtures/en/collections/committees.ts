import { bullets } from '../../builders';
import { entry } from '../build';

// C:committees — /about/committees cards and the About page accordion (one source).
// Copied verbatim from design-reference/pages/committees.dc.html (`C`).
const C: Array<[key: string, name: string, seats: string, duties: string[]]> = [
  ['co-chairs', 'Co-Chairs', '2', ['Provide overall leadership and direction', 'Serve as primary liaison with Impact 100 Global and USAFI', 'Keep the Chapter aligned with authenticity, equity and diaspora representation']],
  ['diaspora-advisory-council', 'Diaspora Advisory Council', '5–10', ['Provide strategic guidance', 'Ensure representation across gender, age, profession and region', 'Uphold authenticity, legacy and equity']],
  ['membership-donor-recruitment', 'Membership & Donor Recruitment', '3–5', ['Drive outreach to diaspora donors', 'Run recruitment campaigns, info sessions and onboarding', 'Track membership commitments and renewals']],
  ['fundraising', 'Fundraising', '3–5', ['Cultivate philanthropic allies, corporate partners and community groups', 'Support resource mobilization', 'Help secure matching funds or sponsorships']],
  ['events-management', 'Events Management', '3–5', ['Plan virtual and in-person events — launches, mixers, briefings, celebrations', 'Manage logistics, invitations and follow-up', 'Support storytelling moments at events']],
  ['communications-storytelling', 'Communications & Storytelling', '2–3', ['Manage email updates, newsletters and social media', 'Collect stories from members, partners and funded organizations', 'Create simple visual assets with consistent branding']],
  ['grants-selection', 'Grants Selection', '3–5', ['Oversee the grantmaking process', 'Manage volunteer reviewers', 'Keep rubrics, scoring and selection transparent and equitable']],
  ['finance-compliance', 'Finance Compliance', '2–3', ['Work with USAFI as fiscal sponsor on transparent accounting', 'Prepare simple financial summaries for members', 'Ensure adherence to Impact 100 Global standards']],
  ['regional-hub-leadership', 'Regional Hub Leadership & Teams', 'By region', ['Roles being defined']],
  ['project-admin-support', 'Project Admin Support', 'TBD', ['Roles being defined']],
  ['stewardship', 'Stewardship', 'TBD', ['Roles being defined']],
];

export const committeesEn = C.map(([key, name, seats, duties]) => entry(key, { fields: { name, seats, duties: bullets(...duties) } }));
