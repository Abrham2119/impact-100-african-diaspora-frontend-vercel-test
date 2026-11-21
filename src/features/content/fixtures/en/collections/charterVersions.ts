import { rich } from '../../builders';
import { entry } from '../build';

// C:charter_versions — the Chapter Charter (charter.dc.html), one entry per version; `?v=` picks one.
// The design has no separate text for v0.9, so it carries the same sections (sample, FQ8).
const SECTIONS: Array<[anchor: string, title: string, paragraphs: string[]]> = [
  ['purpose', 'Purpose', [
    'Impact 100 African Diaspora Chapter brings together members of the African diaspora and allies to pool charitable contributions, invest in local African organizations, and foster engagement among African diaspora communities in the United States.',
    'The Chapter supports community-identified priorities through collective giving, relationships, and informed grant decisions. USAFI Impact serves as host organization, subject to its applicable policies and fiduciary responsibilities.',
  ]],
  ['membership', 'Membership and annual contributions', [
    'Membership is open to individuals who support the Chapter’s purpose and contribute at one of four levels for a campaign cycle: Initiator ($250), Incubator ($500), Innovator ($750) or Investor ($1,000). Every member participates in discussion and decision making; authority to cast an approval vote depends on contributions credited to the applicable cycle.',
    'A member between listed amounts retains the lower named level. A paid contribution of $501–$749 carries voting eligibility even before the Innovator level is reached.',
  ]],
  ['contributions', 'Contributions and charter acknowledgment', [
    'Each campaign cycle runs from October 1 through March 31 of the following year, and pledges may be fulfilled in installments during those six months. Contributions received from April 1 through September 30 are credited to the next cycle.',
    'Once at least $250 has been credited to a cycle, the donor is recognized as an Initiator and automatically receives this charter for review and signature. A single contribution of $250 or more triggers the charter upon payment.',
    'Contributions and installments are made through WAZIImpact.org, where members track progress toward their selected level. If the platform is unavailable to a donor, USAFI Impact may arrange another payment method and record it in the member’s account.',
    'For installment pledges above $250, members sign the charter once the pledge is paid in full, no later than March 31. An unpaid pledge alone does not confer voting rights.',
  ]],
  ['matrix', 'Decision-making matrix', [
    'Members at $250–$500 attend meetings, receive information, suggest priorities, nominees and proposals, and advise before a vote.',
    'Members at $501–$1,000 do all of the above and also vote for preferred projects and Chapter decisions — one vote per member — and approve outcomes of formal votes by the applicable majority.',
  ]],
  ['process', 'Decision process', [
    'All members receive notice of proposed decisions and a reasonable opportunity to give input before voting. Chapter leaders summarize each proposal, relevant financial information, member feedback, and any conflicts of interest.',
    'Members with at least $501 credited when a vote opens cast one vote each, regardless of amount, through WAZIImpact.org. Proxy votes are not permitted.',
    'A proposal passes by simple majority of votes cast, provided at least half of eligible voting members participate. Abstentions do not count; a tie fails. Members with a material personal or financial interest must disclose it and refrain from voting on that matter.',
  ]],
  ['stewardship', 'Stewardship and administration', [
    'The Chapter documents contributions by cycle, meeting participation, recommendations, votes, grant approvals, and disbursements.',
    'USAFI Impact retains final responsibility for legal compliance, charitable use of funds, due diligence, and payment of approved grants. If a member decision cannot be implemented for legal or fiduciary reasons, USAFI Impact explains why and returns the matter for further consideration.',
  ]],
  ['review', 'Review and adoption', [
    'Members may propose amendments, circulated in advance and adopted by a majority vote of eligible voting members — subject to USAFI Impact’s approval where its legal or fiduciary responsibilities are affected.',
    'The charter takes effect upon adoption by the Chapter and acknowledgment by USAFI Impact.',
  ]],
];

const sections = SECTIONS.map(([anchor, title, paragraphs]) => ({
  settings: { anchor },
  fields: { title, body: paragraphs.map((text) => rich.p(text)) },
}));

export const charterVersionsEn = [
  entry('d2026', {
    fields: { label: 'Discussion draft · Sept 2026 — current', badge: 'Discussion draft · Sept 2026' },
    data: { is_current: true },
    items: sections,
  }),
  entry('v0.9', {
    fields: { label: 'v0.9 — earlier draft', badge: 'v0.9 · earlier draft' },
    data: { is_current: false },
    items: sections,
  }),
];
