import { PATHS } from '@/app/routes/paths';
import { link, page, section } from '../build';
import { banner } from './banner';

// GET content/pages/nonprofits — design-reference/pages/nonprofits.dc.html, copy verbatim.
const P = PATHS.public;

export const nonprofitsEn = page('nonprofits', P.nonprofits, { title: 'Impact100 — Nonprofits' }, [
  banner('Nonprofit partners', ['Nonprofits']),
  section('flow_steps', 'how', {
    fields: {
      kicker: 'For organizations',
      title: 'Grantmaking through USAFI’s partner network.',
      lead: 'Grants go to high-impact organizations in Sub-Saharan Africa within USAFI’s partner network. If your organization isn’t a USAFI partner yet, start by expressing interest — members may also nominate organizations they know well.',
      list_kicker: 'How it works',
    },
    items: [
      ['Join the USAFI partner network', 'Grants go to USAFI partner organizations. Express interest and USAFI will guide you through partnership.'],
      ['Nomination & proposal summary', 'Members may nominate partners they know. Chapter leaders summarize each project, its budget, and any conflicts of interest.'],
      ['Volunteer review', 'The Grants Selection committee’s volunteer reviewers score proposals against a transparent rubric.'],
      ['Due diligence', 'USAFI Impact, as fiscal sponsor, confirms standing and charitable use of funds.'],
      ['Member vote', 'Eligible members vote on preferred projects. Approved grants are paid by USAFI Impact.'],
    ].map(([title, text], i) => ({ fields: { num: String(i + 1), title, text } })),
  }),
  section('form_block', 'eligibility', {
    settings: { form_key: 'eligibility', source: { collection: 'nonprofit_faqs' } },
    fields: {
      title: 'Quick eligibility check',
      lead: 'Draft criteria — final guidelines coming soon',
      success_title: 'You look eligible',
      success_body: 'Great — contact us with the “Partner organization” topic and we will send you the proposal form.',
      fail_title: 'Not eligible yet',
      fail_body: 'Your organisation does not meet every requirement right now. You can still contact us — we will keep your details for future cycles.',
      progress_note: 'Answer all four questions to see your result. ({answered} of {total} answered)',
      actions: [link('Express interest in partnering', `${P.contact}?topic=partner`)],
      side_kicker: 'Questions from organizations',
    },
    items: [
      ['sub_saharan', 'Is your organization based and working in Sub-Saharan Africa?'],
      ['usafi_partner', 'Are you a USAFI partner organization, or willing to become one?'],
      ['community_led', 'Is your organization led by people from the community it serves?'],
      ['financials', 'Can you share a budget and basic financial records for due diligence?'],
    ].map(([key, title]) => ({ settings: { key }, fields: { title } })),
  }),
]);
