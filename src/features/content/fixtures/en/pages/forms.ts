import { PATHS } from '@/app/routes/paths';
import { para } from '../../builders';
import { img, link, page, section } from '../build';
import { banner } from './banner';

// The form pages of Step 6 batch 3 (contact / volunteer / share_story .dc.html), copy verbatim.
// Field labels, placeholders and errors are UiStrings (`forms`); the topics and roles are collections.
const P = PATHS.public;

export const contactPageEn = page('contact', P.contact, { title: 'Impact100 — Contact' }, [
  banner('Contact Us', ['Contact Us']),
  section('form_block', 'contact', {
    settings: { form_key: 'contact', source: { collection: 'contact_topics' }, default_key: 'membership' },
    fields: {
      title: 'Stay connected with Us',
      lead: 'Each topic goes straight to the right team, and you get an automatic reply.',
      consent_label: 'I have read the {link} *',
      consent_link: link('privacy notice', P.privacy),
      submit_label: 'Submit Message',
    },
    media: { image: img('contact_img.webp', 'contact') },
    items: [
      { settings: { key: 'address' }, fields: { title: 'Office Address', value: 'Madison Ave, New York, NY 15612' } },
      { settings: { key: 'email' }, fields: { title: 'Contact Us', link: link('Example@gmail.com', 'mailto:example@gmail.com') } },
      { settings: { key: 'phone' }, fields: { title: 'Telephone', link: link('+(088) 123 657 6548', 'callto:1234567890') } },
      {
        settings: { key: 'map' },
        fields: {
          link: link(
            'International Convention City Bashundhara, Dhaka',
            'https://www.google.com/maps/search/?api=1&query=International+Convention+City+Bashundhara+Dhaka',
          ),
        },
      },
    ],
  }),
]);

export const volunteerPageEn = page('volunteer', P.volunteer, { title: 'Impact100 — Volunteer' }, [
  banner('Volunteer with us', [['Opportunities', P.volunteer], 'Volunteer']),
  section('form_block', 'roles', {
    settings: { form_key: 'volunteer', source: { collection: 'volunteer_roles' } },
    fields: {
      kicker: 'Volunteer',
      title: '19 roles in four areas',
      lead: 'Pick as many roles as you like — they go into your tray. Send them together and each team that owns a role hears from you.',
      submit_label: 'send sign-up',
    },
    items: [
      ['all', 'All roles'],
      ['chapter', 'Chapter'],
      ['us', 'US hubs'],
      ['usafi', 'USAFI portfolios'],
      ['africa', 'African hubs'],
    ].map(([key, title]) => ({ settings: { key }, fields: { title } })),
  }),
]);

export const shareStoryPageEn = page('share_story', P.shareStory, { title: 'Impact100 — Share a story' }, [
  banner('Share a story', [['News', P.news], 'Share a story']),
  section('form_block', 'story', {
    settings: { form_key: 'share_story' },
    fields: {
      kicker: 'For members',
      title: 'Share your story',
      body: para('Tell us about a grant partner, a hub event or why you joined. An editor reads every story before it is published in News.'),
      submit_label: 'send for review',
      success_title: 'Thanks — your story is with an editor',
      success_body: 'We will email you when it is approved and published, or if we need anything else.',
      side_title: 'What happens next',
      side_link: link('Read member stories →', P.news),
    },
    items: [
      { settings: { done: true }, fields: { title: 'Submitted', value: 'Stored safely, even if an email fails.' } },
      { fields: { title: 'Editor review', value: 'An editor checks the story and photo.' } },
      { fields: { title: 'Published', value: 'Approved stories become News posts.' } },
    ],
  }),
]);
