import { PATHS } from '@/app/routes/paths';
import { rich } from '../../builders';
import { link, page, section } from '../build';
import { banner } from './banner';

// GET content/pages/grants — design-reference/pages/grants.dc.html, copy verbatim. Country names,
// capitals and hub blurbs are C:countries; portfolios C:portfolios; proposals the governance API.
// `{name}` / `{capital}` = the selected hub, `{portfolio}` / `{flagship}` = the chosen interest area.
const P = PATHS.public;
const DEFAULT_HUB = 'kenya';

export const grantsPageEn = page('grants', P.grants, { title: 'Impact100 — Grants' }, [
  banner('Grants', ['Grants']),
  section('hub_map', 'map', {
    settings: { default_hub: DEFAULT_HUB },
    fields: {
      kicker: 'Where we fund',
      title: 'USAFI hubs across Africa',
      lead: 'Choose a hub on the map or with the buttons — both do the same thing. Pick an interest area too: we save it to your profile (or for this visit, until you join) and use it to tailor what you see.',
      map_label: 'Map of Africa showing North Africa, Sub-Saharan Africa and the USAFI hubs in Ghana, Kenya and Zambia',
      region_north: 'North Africa',
      region_sub_saharan: 'Sub-Saharan Africa',
      legend_north: 'North Africa',
      legend_hub: 'USAFI hub · click to select',
      legend_sub_saharan: 'Sub-Saharan Africa',
      list_kicker: 'Hubs — text list',
      country_title: '{name} hub · Sub-Saharan Africa',
      country_body: '{name} is a USAFI hub. Choose an interest area below to save it, nominate a partner here, or tell us about local work.',
      country_actions: [link('nominate a partner', PATHS.portal.suggest), link('contact us', `${P.contact}?topic=partner`, 'dark')],
      // Not in the design (North African countries selectable — requested change); editable placeholders.
      north_title: '{name} · not a USAFI hub yet',
      north_body: 'Our hubs are in Sub-Saharan Africa for now. Nominate a partner or tell us about local work in {name} — it helps us plan future hubs.',
      interest_label: 'Interest area (portfolio)',
      projects_kicker: 'Projects under review here',
      roles_kicker: 'Volunteer roles for you',
      role_title: '{name} hub support',
      role_where: '{name} · on the ground or remote',
      role_link: link('Volunteer roles for you', `${P.volunteer}?area=usafi`),
      saved_title: 'Interests saved for this visit',
      saved_body: '{name} · {portfolio} ({flagship}). We keep this for your visit and save it to your profile when you join.',
      unsaved_title: 'Choose a hub and an interest area',
      unsaved_body: 'Your choice orders proposals, tags volunteer roles and pre-fills nominations.',
      cta: link('join and save my interests', P.join),
    },
    // North African countries on the map (requested change): Natural Earth names, as for C:countries.
    items: (
      [
        ['c504', 'Morocco', 'Rabat'],
        ['c732', 'W. Sahara', null],
        ['c012', 'Algeria', 'Algiers'],
        ['c788', 'Tunisia', 'Tunis'],
        ['c434', 'Libya', 'Tripoli'],
        ['c818', 'Egypt', 'Cairo'],
      ] as const
    ).map(([map_key, name, capital]) => ({ fields: capital ? { name, capital } : { name }, settings: { map_key } })),
  }),
  section('split_feature', 'selection', {
    fields: {
      title: 'How grants are selected',
      lead: 'The Grants Selection committee oversees grantmaking and manages a team of volunteer reviewers. Proposals are scored against a shared rubric so selection stays transparent and equitable, then shortlisted projects go to an eligible-member vote.',
      actions: [link('Volunteer as a reviewer', P.volunteer)],
      card_kicker: 'Scoring rubric',
      card_note: 'Weightings to be set by the Grants Selection committee',
    },
    items: [
      ['Community-identified need', 'The project responds to a priority named by the community'],
      ['Organizational strength', 'Leadership, track record and financial health'],
      ['Impact & reach', 'Clear, measurable benefit for the people served'],
      ['Sustainability', 'A plan for results to last beyond the grant'],
      ['Alignment with our values', 'Authenticity, equity, legacy and representation'],
    ].map(([title, text]) => ({ fields: { title, text } })),
  }),
  section('flow_steps', 'ahead', {
    fields: { kicker: 'Looking ahead to 2027 & beyond', title: 'Roadmap' },
    items: [
      ['Launch the first grant cycle', 'With our inaugural members.'],
      ['Award the first major grant', 'To a high-impact USAFI partner organization.'],
      ['Deepen diaspora engagement', 'Through regional partnerships and hubs.'],
      ['Document & share learnings', 'So the model can be replicated in other regions.'],
      ['Scale & sustain', 'Maintain the viability and longevity of the initiative.'],
    ].map(([title, text], i) => ({ fields: { num: String(i + 1).padStart(2, '0'), title, text } })),
  }),
  section('portfolio_cards', 'portfolios', {
    settings: { source: { collection: 'portfolios' }, default_hub: DEFAULT_HUB },
    fields: { kicker: 'Portfolios', title: 'Each portfolio and its flagship', no_hub: 'choose a hub on the map' },
  }),
  section('plan_pair', 'plan', {
    fields: {
      left_kicker: '2026–27 work plan',
      left_title: 'This cycle at a glance',
      right_kicker: 'Selection process',
      right_title: 'How a proposal becomes a grant',
      badges_title: 'The five-criterion rubric',
      note: 'Weightings are set by the Grants Selection committee.',
    },
    items: [
      ...(
        [
          ['Oct 1, 2026', 'Campaign cycle opens. Pledges and payments start.', true],
          ['Nov 2026', 'Northern and Southern California hubs live or launching.', true],
          ['Dec 2026', 'New public site, map and donations — Atlanta hub launch.', false],
          ['Feb – Mar 2027', 'Proposals, voting, results and charter signing — DMV hub launch.', false],
          ['Mar 31, 2027', 'Cycle closes. All pledge payments complete.', false],
          ['Apr – Sep 2027', 'Committee scoring, first live grant vote, published results and review.', false],
        ] as const
      ).map(([title, text, done]) => ({ type: 'milestone', settings: { done }, fields: { title, text } })),
      ...[
        ['Nominate', 'Members suggest partners and proposals.'],
        ['Review', 'The Grants Selection committee scores each proposal.'],
        ['Publish', 'An admin publishes proposals for members to read.'],
        ['Vote', 'Voting members decide; quorum and majority rules apply.'],
      ].map(([title, text]) => ({ type: 'step', fields: { title, text } })),
      ...['Community need', 'Organizational capacity', 'Impact', 'Sustainability', 'Alignment'].map((title) => ({ type: 'badge', fields: { title } })),
    ],
  }),
  section('proposals_list', 'review', {
    settings: { default_hub: DEFAULT_HUB },
    fields: {
      kicker: 'Under review',
      title: 'Proposals members are reading now',
      lead: 'Only proposals an admin has published appear here. Your hub is listed first.',
      your_hub: 'Your hub',
      requested: [rich.p('Requested: ', rich.b('{amount}'), ' · Status: under committee review')],
      read_link: 'Read the proposal →',
    },
  }),
  section('flow_steps', 'roadmap', {
    fields: { kicker: 'Roadmap', title: 'From launch to the first grant vote' },
    items: (
      [
        ['Nov 2026', 'ok', 'Discovery', 'Payments API confirmed, technical design, content model.'],
        ['Dec 2026', 'warn', 'Public site', 'Pages, map, forms, donations and newsletter.'],
        ['Jan 2027', 'neutral', 'Membership', 'Join flow, accounts, payments ledger, portal, hub dashboards.'],
        ['Feb – Mar 2027', 'neutral', 'Governance', 'Proposals, voting, decisions, results, charter signing.'],
        ['Apr – Sep 2027', 'neutral', 'Grant cycle', 'Committee scoring and the first live grant vote.'],
      ] as const
    ).map(([num, badge_kind, title, text]) => ({ settings: { badge_kind }, fields: { num, title, text } })),
  }),
]);
