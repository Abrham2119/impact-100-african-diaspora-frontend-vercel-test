import { PATHS } from '@/app/routes/paths';
import type { RichInline } from '@/types/content.dto';
import { para, rich } from '../../builders';
import { link, page, section } from '../build';
import { banner } from './banner';

// Join and donate (join / donate .dc.html), copy verbatim. Figures in the copy are tokens filled
// from the API — {campaign} {start} {end} from the active campaign, {threshold} {max} {rounding}
// {end_of_cycle} {pledge} from the charter settings — so they come from one source.
const P = PATHS.public;
const a = (text: string, href: string): RichInline => ({ type: 'link', href, children: [{ type: 'text', text }] });
const NEWSLETTER = 'Yes, send me the Impact100 African Diaspora Chapter newsletter. I can unsubscribe at any time.';

export const joinPageEn = page('join', P.join, { title: 'Impact100 — Become a member' }, [
  banner('Become a member', [['Opportunities', P.volunteer], 'Become a member']),
  section('form_block', 'join', {
    settings: { form_key: 'join', default_key: 'incubator' },
    fields: {
      consent_label: NEWSLETTER,
      secure_note: 'Next you’ll go to WAZIImpact.org to pay securely. Your membership starts only when WAZIImpact.org confirms the payment.',
      actions: [link('go to the member portal', PATHS.portal.dashboard), link('choose your interests', P.grants, 'dark')],
      note: [
        {
          type: 'note',
          children: [
            { type: 'text', text: 'Already a member? ' },
            a('Log in', PATHS.auth.signIn),
            { type: 'text', text: ' · Want to give without joining? ' },
            a('Donate', P.donate),
          ],
        },
      ],
    },
    items: [
      {
        settings: { key: 'level' },
        fields: {
          title: 'Level',
          value: 'Choose your level',
          body: [
            rich.p(
              'You are joining the {campaign} ({start} – {end}). A membership is for one campaign — already a member from the last one? ',
              a('Renew your membership', PATHS.portal.dashboard),
              '. Your level is set by what has been received; voting starts above {threshold}.',
            ),
          ],
        },
      },
      { settings: { key: 'details' }, fields: { title: 'Details', value: 'Your details' } },
      {
        settings: { key: 'payment' },
        fields: {
          title: 'Payment',
          value: 'Payment plan',
          body: [
            rich.p(
              'Pay your {level} pledge of ',
              rich.b('{pledge}'),
              ' in full, or split it into up to {max} monthly installments — each rounded up to the nearest {rounding} and all finished by {end_of_cycle}.',
            ),
          ],
        },
      },
      {
        settings: { key: 'done' },
        fields: {
          title: 'Done',
          value: 'Awaiting payment confirmation',
          body: para(
            'Thanks, {first_name}. As soon as WAZIImpact.org confirms your payment we will activate your membership and email your receipt from USAFI Impact. Coming back to this page doesn’t count as confirmation.',
          ),
        },
      },
    ],
  }),
]);

export const donatePageEn = page('donate', P.donate, { title: 'Impact100 — Donate' }, [
  banner('Donate', [['Opportunities', P.volunteer], 'Donate']),
  section('form_block', 'donate', {
    settings: { form_key: 'donate', amounts: [25, 50, 100, 250], default_amount: 100, default_key: 'kenya' },
    fields: {
      kicker: 'Direct donor',
      title: 'Make a donation',
      body: para(
        'Open to everyone — no account needed. Donations are not linked to any campaign: you choose the area of interest and the country your gift supports. Donations don’t count toward membership, level or voting.',
      ),
      consent_label: NEWSLETTER,
      note: [rich.note('You’ll be subscribed only after your gift is confirmed. We record your consent with the date and this exact wording.')],
      submit_label: 'continue to secure payment',
      secure_note: 'Payment happens on WAZIImpact.org. Your receipt comes from USAFI Impact, our fiscal sponsor. Monthly gifts can be cancelled from the receipt email.',
      summary: '{frequency} · {portfolio} · {country}. Not linked to any campaign. Your area and country are stored with your gift for USAFI reporting.',
    },
    items: [
      {
        settings: { key: 'vote' },
        fields: {
          title: 'Want a vote too?',
          body: para('Members pledge from $250 in the cycle and vote once they have given more than $500.'),
          link: link('become a member', P.join),
        },
      },
      {
        settings: { key: 'cancel' },
        fields: {
          title: 'Already giving monthly?',
          body: para('Use the link in your receipt email to stop a monthly gift.'),
          link: link('Cancel a monthly gift →', P.donateCancel),
        },
      },
    ],
  }),
]);
