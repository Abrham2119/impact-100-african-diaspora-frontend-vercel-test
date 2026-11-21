import { PATHS } from '@/app/routes/paths';
import { para, rich } from '../../builders';
import { link, page, section } from '../build';
import { banner } from './banner';

// GET content/pages/our_model — design-reference/pages/our_model.dc.html, copy verbatim.
const P = PATHS.public;

const level = (kicker: string, title: string, price: string, body: string, badge: string, votes: boolean, key: string, dark = false) => ({
  type: 'level',
  settings: { tone: dark ? 'dark' : 'default', badge_kind: votes ? 'ok' : 'info' },
  fields: { kicker, title, price, body: para(body), badge, actions: [link(`choose ${title}`, `${P.join}?level=${key}`)] },
});

export const ourModelEn = page('our_model', P.ourModel, { title: 'Impact100 — Our model' }, [
  banner('Our model', ['Our model']),
  section('card_grid', 'steps', {
    settings: { columns: 'lg4' },
    fields: {
      kicker: 'Our model',
      title: 'Pool our gifts. Decide together.',
      lead: 'Members give in one campaign cycle, pool their money into grants, and vote on where it goes. Levels, thresholds and dates are charter settings — they come from one source and appear the same on every page.',
    },
    items: [
      {
        type: 'num',
        fields: {
          num: '1',
          title: 'Give in the cycle',
          body: [rich.p('The campaign cycle runs ', rich.b('October 1 – March 31'), '. Pledges, payments and eligibility are tracked per cycle.')],
        },
      },
      {
        type: 'num',
        fields: {
          num: '2',
          title: 'Review together',
          body: para('Volunteer committees review proposals and score them on five criteria — community need, organizational capacity, impact, sustainability and alignment.'),
        },
      },
      {
        type: 'num',
        fields: {
          num: '3',
          title: 'Vote and fund',
          body: para('Voting members decide. One member, one vote per ballot, whatever the member’s level. Grants go to partners in USAFI hubs across Sub-Saharan Africa.'),
        },
      },
    ],
  }),
  section('card_grid', 'levels', {
    settings: { columns: 'xl3' },
    fields: {
      kicker: 'Membership levels',
      title: 'Four levels, one vote each',
      lead: 'Your level is the highest one whose amount has been received. If what you have paid falls between two levels, you stay at the lower one.',
    },
    items: [
      level('Member', 'Initiator', '$250', 'Portal access, attend, suggest, comment and propose amendments.', 'No vote yet', false, 'initiator'),
      level('Member', 'Incubator', '$500', 'Everything an Initiator can do. $500 is not yet above the voting line.', 'No vote yet', false, 'incubator'),
      level('Voting member', 'Innovator', '$750', 'More than $500 received in the cycle: vote and approve.', 'Votes', true, 'innovator'),
      level('Voting member', 'Investor', '$1,000', 'More than $500 received in the cycle: vote and approve.', 'Votes', true, 'investor', true),
      { type: 'note', fields: { title: 'Membership starts at $250', body: para('You become a member once at least $250 has been received in the current cycle.') } },
      {
        type: 'note',
        fields: {
          title: 'Voting starts above $500',
          body: para('More than $500 received in the cycle makes you a voting member. $500 does not qualify — $501 does. Pledged but unpaid amounts don’t count.'),
        },
      },
      { type: 'note', fields: { title: 'Donations are separate', body: para('Donations don’t count toward membership, level or voting. Anyone can donate without joining.') } },
    ],
  }),
  section('decision_table', 'who_decides', {
    fields: {
      kicker: 'Our model',
      title: 'Who decides what',
      col_activity: 'Decision or activity',
      col_low: '$250–$500',
      col_high: '$501–$1,000',
    },
    items: [
      ['Attend meetings and receive information', 'Yes', 'Yes'],
      ['Suggest priorities, nominees and proposals', 'Yes', 'Yes'],
      ['Discuss proposals and advise before a vote', 'Yes', 'Yes'],
      ['Vote for preferred projects and Chapter decisions', 'No', 'Yes, one vote per member'],
      ['Approve the outcome of a formal vote', 'No', 'Yes, by applicable majority'],
    ].map(([activity, low, high]) => ({
      settings: { low_kind: low === 'No' ? 'bad' : 'ok', high_kind: 'ok' },
      fields: { activity, low, high },
    })),
  }),
  section('card_grid', 'facts', {
    settings: { columns: 'lg4', spacing: 'continued' },
    items: [
      { type: 'icon', settings: { icon: 'far fa-calendar-alt' }, fields: { title: 'Campaign cycle', body: para('October 1 – March 31. Gifts received April through September count toward the next cycle.') } },
      { type: 'icon', settings: { icon: 'far fa-calendar-check' }, fields: { title: 'Installments', body: para('Spread your pledge across the six-month cycle. Your level and vote follow what has actually been received.') } },
      { type: 'icon', settings: { icon: 'far fa-vote-yea', tone: 'dark' }, fields: { title: 'One member, one vote', body: para('Voting members cast a single vote each, whatever they contributed. No proxy votes.') } },
    ],
  }),
  section('card_grid', 'rules', {
    settings: { columns: 'lg6', stretch: true },
    items: [
      {
        type: 'rich',
        fields: {
          kicker: 'Paying your pledge',
          title: 'Pay in full or in up to 6 installments',
          body: [
            rich.p('A pledge may be split into up to six monthly payments, each rounded up to the nearest $5. All payments must be complete by March 31.'),
            rich.table(
              ['Level', 'In full', '6 installments'],
              [
                ['Initiator', '$250', '5 × $45 + $25'],
                ['Incubator', '$500', '5 × $85 + $75'],
                ['Innovator', '$750', '6 × $125'],
                ['Investor', '$1,000', '5 × $170 + $150'],
              ],
            ),
            rich.note('Example from the rules: a $250 pledge in 6 installments is 5 × $45 and a last installment of $25.'),
          ],
        },
      },
      {
        type: 'rich',
        fields: {
          kicker: 'How decisions are made',
          title: 'Clear rules, applied the same way everywhere',
          body: [
            rich.ul(
              ['A voter confirms they have no conflict of interest before voting. A member who declares a conflict may abstain.'],
              ['Quorum: at least 50% of eligible voters (rounded up) must cast a Yes or No vote. Abstentions are recorded but don’t count.'],
              ['If quorum isn’t met the motion fails; a tie fails; otherwise a simple majority of votes cast decides.'],
              ['Charter amendments are shared with all members before any vote.'],
              ['Members sign the charter once at least $250 has been received and the pledge is paid in full.'],
            ),
          ],
          actions: [link('read the charter', P.charter, 'dark')],
        },
      },
    ],
  }),
  section('band', 'money', {
    settings: { split: '7_5' },
    fields: {
      title: 'Where the money goes',
      body: 'USAFI Impact is our fiscal sponsor: it issues every receipt and keeps the official financial records. Payments are processed by WAZIImpact.org — no card details ever touch our site. Grants support partners in USAFI hubs across Sub-Saharan Africa, in four funding portfolios.',
      actions: [link('become a member', P.join), link('see our grants', P.grants, 'ghost_light')],
    },
  }),
]);
