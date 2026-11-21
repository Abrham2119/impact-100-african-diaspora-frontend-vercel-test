import { PATHS } from '@/app/routes/paths';
import { bullets } from '../../builders';
import { link, page, section } from '../build';
import { banner } from './banner';

// Privacy and the two newsletter status pages (privacy / newsletter_confirmed / unsubscribed .dc.html).
const P = PATHS.public;

export const privacyEn = page('privacy', P.privacy, { title: 'Impact100 — Privacy & cookies' }, [
  banner('Privacy & cookies', ['Privacy & cookies']),
  section('legal_text', 'privacy', {
    fields: {
      kicker: 'Privacy notice & cookie notice',
      title: 'Your data, explained simply',
      intro: 'We follow CAN-SPAM and the relevant US state privacy laws.',
      actions: [link('manage my data', PATHS.portal.privacy), link('ask a question', P.contact, 'dark')],
    },
    items: [
      ['What we collect', [
        'The minimum personal data we need: your name, email, city or hub, interests, and records of your pledges, donations, volunteering and form submissions.',
        'No card data ever passes through or is stored on our systems — all payments happen on WAZIImpact.org.',
      ]],
      ['How we use it', [
        'To run your membership, apply the Chapter Charter’s rules, send receipts and confirmations, and route your messages to the right team.',
        'Receipts are issued by USAFI Impact, our fiscal sponsor, which keeps the official financial records.',
      ]],
      ['Newsletter and consent', [
        'We subscribe you only when you tick the box yourself. We record the date and the exact wording you saw.',
        'Every email has a one-click unsubscribe link.',
      ]],
      ['Voting privacy', ['Who voted is stored separately from what they chose. Each voter gets a receipt code to confirm their ballot was counted.']],
      ['Your rights', ['You can export or delete your data from the member portal. Financial records we must keep by law are retained.']],
      ['Security', ['HTTPS everywhere, data encrypted in storage, role-based access checked on every request, and two-step verification for administrators.']],
      ['Cookies', [
        'We use only the cookies needed to keep you logged in. They are HttpOnly, Secure and SameSite.',
        'Our analytics are privacy-friendly and don’t use cookies.',
      ]],
    ].map(([title, points]) => ({ fields: { title: title as string, body: bullets(...(points as string[])) } })),
  }),
]);

export const newsletterConfirmedEn = page('newsletter_confirmed', P.newsletterConfirmed, { title: 'Impact100 — Subscription confirmed' }, [
  banner('You are subscribed', ['Newsletter']),
  section('status_card', 'status', {
    settings: { icon: 'far fa-envelope-open' },
    fields: {
      title: 'Welcome to the newsletter',
      body: 'You will hear about events, grants and Chapter news. Every email has a one-click unsubscribe link. We recorded your consent with the date and the wording you saw.',
      actions: [link('explore our grants', P.grants), link('back to home', PATHS.home, 'dark')],
    },
  }),
]);

export const newsletterUnsubscribedEn = page('newsletter_unsubscribed', P.newsletterUnsubscribed, { title: 'Impact100 — Unsubscribed' }, [
  banner('You are unsubscribed', ['Newsletter']),
  section('status_card', 'status', {
    settings: { icon: 'far fa-bell-slash' },
    fields: {
      title: 'You won’t get the newsletter any more',
      body: 'We removed you from the list everywhere — on our site and on the newsletter platform. Receipts and account emails, like login links, still reach you.',
      actions: [link('resubscribe', P.newsletterConfirmed), link('back to home', PATHS.home, 'dark')],
    },
  }),
]);
