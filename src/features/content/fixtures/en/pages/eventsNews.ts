import { PATHS } from '@/app/routes/paths';
import { para } from '../../builders';
import { link, page, section } from '../build';
import { banner } from './banner';

// Events, hubs and news pages (event / event_details / hubs / blogs / blog_details .dc.html), copy
// verbatim. Event and story bodies come from their collections (C:events, C:news).
const P = PATHS.public;
const hubLink = (name: string) => `${P.hubs}?hub=${encodeURIComponent(name)}`;

export const eventsPageEn = page('events', P.events, { title: 'Impact100 — Events' }, [
  banner('Events', ['Events']),
  section('event_slider', 'events', {
    settings: { layout: 'grid', source: { collection: 'events', limit: 9, paginate: true } },
    fields: {
      kicker: 'Upcoming',
      title: 'Gather with us',
      lead: 'Open to members and anyone curious about joining. Most events run in person with a live online option for members across the US.',
    },
  }),
  section('hub_plan', 'launch_plan', {
    fields: {
      kicker: 'US regional hubs',
      title: '2026–27 launch plan',
      lead: 'Five regional chapters kick off the project in 2026–27. Each is led by co-Ambassadors and a team that drives outreach, marketing, member recruitment and its own fundraising campaign.',
    },
    items: (
      [
        ['Hub', 'ok', 'Northern California', 'San Francisco / Bay Area', 'Lead hub'],
        ['Satellite hub', 'warn', 'Southern California', 'San Diego / Los Angeles', 'Oct 23, 2026'],
        ['Regional chapter', 'info', 'Northwest', 'Seattle', 'Nov – Dec 2026'],
        ['Regional chapter', 'info', 'Southeast', 'Atlanta', 'Dec 2026 – Jan 2027'],
        ['Regional chapter', 'info', 'East Coast', 'DC / Maryland / Virginia (DMV)', 'Feb – Mar 2027'],
      ] as const
    ).map(([badge, badge_kind, name, area, launch]) => ({
      settings: { badge_kind },
      fields: { badge, name, area, note: 'Co-Ambassadors to be confirmed', launch_label: 'Launch', launch, cta: link('Join this hub', hubLink(name)) },
    })),
  }),
]);

export const eventDetailPageEn = page('event_detail', P.events, { title: 'Impact100 — Event details' }, [
  banner('Event details', [['event', P.events], 'Event details']),
  section('event_detail', 'event', {
    settings: { source: { collection: 'events' } },
    fields: {
      rsvp_kicker: 'RSVP',
      rsvp_title: 'Save your place',
      rsvp_submit: 'rsvp',
      rsvp_login: link('Log in instead', PATHS.auth.signIn),
      rsvp_note: 'Your confirmation email includes a calendar file. One RSVP per email; if the event is full you join the waitlist.',
      rsvp_done_title: 'You’re going',
      rsvp_done_body: 'Check your inbox for the confirmation and calendar file (.ics).',
      hub_kicker: 'Hosted by a US regional hub',
      hub_title: 'Join this hub to hear about local events first',
      hub_cta: link('join this hub', hubLink('Atlanta')),
      schedule_title: 'Event Schedule',
      label_date: 'Date',
      label_time: 'Time',
      label_location: 'Location',
      label_link: 'Event link',
      organizer_title: 'organizer details',
      label_name: 'name',
      label_email: 'email',
      label_phone: 'phone',
      map_title: 'Map Location',
    },
  }),
]);

export const hubsPageEn = page('hubs', P.hubs, { title: 'Impact100 — US regional hubs' }, [
  banner('Regional hubs', [['Events', P.events], 'US regional hubs']),
  section('form_block', 'hubs', {
    settings: { form_key: 'hub_join', source: { collection: 'us_hubs' }, default_key: 'atlanta' },
    fields: {
      kicker: 'Events · Hubs',
      title: 'Five US regional hubs',
      lead: 'Each hub is run by two co-Ambassadors and hosts local events. Join the hub nearest you — your sign-up goes straight to its team.',
      card_kicker: 'US regional hub',
      card_body: 'Two co-Ambassadors · local events and member sign-ups.',
      card_cta: 'join this hub',
      side_kicker: 'African hubs',
      side_title: 'Sub-Saharan Africa',
      side_body: para('Every Sub-Saharan country is a USAFI hub, and that is where grants go. Explore them on the map.'),
      actions: [link('open the map', P.grants)],
      form_kicker: 'Join a hub',
      form_title: 'Join the {name} hub',
      submit_label: 'join hub',
      note: [{ type: 'note', children: [{ type: 'text', text: 'Only US regional hubs can be joined. If you don’t have a hub yet, this becomes your home hub.' }] }],
      success_title: 'Welcome to the {name} hub',
      success_body: 'The co-Ambassadors have your details and will invite you to the next local event.',
    },
  }),
]);

const SHARE = [
  ['Facebook', 'fab fa-facebook-f', 'https://www.facebook.com/sharer/sharer.php?u={url}'],
  ['LinkedIn', 'fab fa-linkedin-in', 'https://www.linkedin.com/sharing/share-offsite/?url={url}'],
  ['Twitter', 'fab fa-twitter', 'https://twitter.com/intent/tweet?url={url}'],
  ['Pinterest', 'fab fa-pinterest-p', 'https://pinterest.com/pin/create/button/?url={url}'],
] as const;

export const newsPageEn = page('news', P.news, { title: 'Impact100 — Blogs' }, [
  banner('News & updates', ['News & stories']),
  section('news_list', 'news', { settings: { layout: 'page', source: { collection: 'news', limit: 9, paginate: true } } }),
  section('band', 'share', {
    settings: { split: '8_4', title_size: '38' },
    fields: {
      title: 'Have a story to share?',
      body: 'Members can send us a story about a partner, a hub event or why they joined. An editor reviews it before it is published here.',
      actions: [link('share a story', P.shareStory)],
    },
  }),
]);

export const newsDetailPageEn = page('news_detail', P.news, { title: 'Impact100 — Blog details' }, [
  banner('Blog details', [['blog', P.news], 'Blog details']),
  section('news_detail', 'story', {
    settings: { source: { collection: 'news' }, comments: { collection: 'blog_comments' }, recent_limit: 3 },
    fields: {
      comments_label: 'Comments',
      tags_label: 'Tags:',
      share_label: 'share:',
      comments_title: 'Comments',
      form_title: 'Post a Comment',
      form_note: 'Your email address will not be published. Required fields are marked *',
      form_remember: 'Save my name, email, and website in this browser for the next time I comment.',
      form_submit: 'Post Comment',
      search_title: 'Search',
      recent_title: 'Recent Posts',
      categories_title: 'Categories',
      sidebar_tags_title: 'Tags',
    },
    items: SHARE.map(([label, icon, href]) => ({ fields: { label }, settings: { icon, href } })),
  }),
]);

// Cancel gift and the three thanks pages (cancel_gift / *_thanks .dc.html).
export const donateCancelPageEn = page('donate_cancel', P.donateCancel, { title: 'Impact100 — Cancel monthly gift' }, [
  banner('Cancel a monthly gift', [['Donate', P.donate], 'Cancel monthly gift']),
  section('form_block', 'cancel', {
    settings: { form_key: 'cancel_gift' },
    fields: {
      kicker: 'From your receipt email',
      title: 'Cancel your monthly gift',
      submit_label: 'cancel monthly gift',
      actions: [link('keep giving', P.donate, 'dark')],
      success_title: 'Your monthly gift is cancelled',
      success_body: 'No further charges will be made. Thank you for everything you gave — past receipts stay valid.',
    },
    items: [
      { settings: { key: 'gift' }, fields: { title: 'Gift' } },
      { settings: { key: 'started' }, fields: { title: 'Started' } },
      { settings: { key: 'next' }, fields: { title: 'Next charge' } },
      { settings: { key: 'receipts' }, fields: { title: 'Receipts', value: 'Issued by USAFI Impact' } },
    ],
  }),
]);

const thanks = (key: string, path: string, seoTitle: string, title: string, trail: Array<string | [string, string]>, card: Record<string, unknown>) =>
  page(key, path, { title: `Impact100 — ${seoTitle}` }, [banner(title, trail), section('status_card', 'status', card)]);

export const contactThanksPageEn = thanks('contact_thanks', P.contactThanks, 'Contact — thank you', 'Message received', [['Contact', P.contact], 'Thank you'], {
  settings: { icon: 'far fa-paper-plane' },
  fields: {
    title: 'Thanks — we have your message',
    body: 'Your message went to the right team for the topic you chose. An automatic reply is on its way to your inbox, and someone will get back to you soon.',
    actions: [link('back to home', PATHS.home), link('read the news', P.news, 'dark')],
  },
});

export const donateThanksPageEn = thanks('donate_thanks', P.donateThanks, 'Donate — thank you', 'Thank you for your gift', [['Donate', P.donate], 'Thank you'], {
  settings: { icon: 'fas fa-heart', summary_key: 'donate' },
  fields: {
    title: 'Thank you for giving',
    body: 'We are waiting for WAZIImpact.org to confirm your payment. Your receipt comes from USAFI Impact, our fiscal sponsor. If you chose monthly, you can cancel from the receipt email at any time.',
    result_title: '{amount} · {frequency} · {portfolio} · {country}',
    result_body: 'Direct donation — not linked to any campaign. Newsletter: you will be subscribed once the gift is confirmed. Donations don’t count toward membership or voting.',
    actions: [link('become a member', P.join), link('see our grants', P.grants, 'dark')],
  },
});

export const volunteerThanksPageEn = thanks('volunteer_thanks', P.volunteerThanks, 'Volunteer — thank you', 'Thank you for volunteering', [['Volunteer', P.volunteer], 'Thank you'], {
  settings: { icon: 'fas fa-hands-helping', summary_key: 'volunteer' },
  fields: {
    title: 'Your sign-up is on its way',
    body: 'We sent each team that owns one of your roles a note with your details. They will get back to you by email. A confirmation is on its way to your inbox.',
    result_title: 'Sent to {count} teams',
    result_body: '{teams}',
    actions: [link('see events', P.events), link('back to roles', P.volunteer, 'dark')],
  },
});
