import { entry, img } from '../build';
import { eventDetailBodyEn } from '../rich/detailBodies';

// C:events — one source for the home slider and /events (Step 6). Copied verbatim from
// design-reference/pages/index.dc.html (`data.evt`). Slugs replace the design's `#e=<index>`.
const E: Array<[slug: string, image: string, date: string, place: string, title: string, summary: string]> = [
  ['2026-27-campaign-cycle-opens', 'event_img_1.webp', 'Oct 1', 'WAZIImpact.org · Everyone', '2026–27 campaign cycle opens', 'Pledges and installments begin on WAZIImpact.org.'],
  ['southern-california-hub-launch', 'event_img_2.webp', 'Oct 23', 'San Diego / Los Angeles · Open to all', 'Southern California hub launch', 'Kickoff for the San Diego / Los Angeles satellite hub.'],
  ['advisory-meeting', 'event_img_3.webp', 'Monthly', 'Online · Leadership & advisors', 'Advisory meeting', 'Leadership and advisors review progress on the 2026–27 work plan.'],
  ['new-member-info-session', 'event_img_4.webp', 'Date TBC', 'Location to be confirmed · Open to all', 'New member info session', 'A walk-through of membership levels, installments, and WAZIImpact.org.'],
  ['community-priorities-workshop', 'event_img_5.webp', 'Date TBC', 'Location to be confirmed · Members', 'Community priorities workshop', 'Members share the needs they’re hearing from home and shape this year’s focus.'],
  ['campaign-cycle-closes', 'event_img_6.webp', 'Mar 31', 'WAZIImpact.org · Members', 'Campaign cycle closes', 'Last day for contributions to count toward this cycle’s membership and vote.'],
  ['grants-management-and-distribution', 'event_img_7.webp', 'Apr – Sep 2027', 'Online + hubs · Members', 'Grants management & distribution', 'Review, due diligence and member engagement in distributing the first grant.'],
  ['annual-meeting-vote-and-first-grant-2027', 'event_img_8.webp', 'Date TBC', 'Location to be confirmed · Members', 'Annual meeting, vote & first grant (2027)', 'Finalists present their projects, eligible members vote, and the Chapter celebrates its first major grant.'],
];

// The detail page's body, schedule, organizer and map are template sample data (event_details.dc.html,
// FQ8): the same for every event until the CMS has the real details.
const SAMPLE_DETAIL = {
  time_label: '15:16 - 21:36',
  link_url: 'https://meet.google.com/dek-litx-2fr',
  organizer_name: 'Md. Rayhan Hossain',
  organizer_email: 'example@gmail.com',
  organizer_phone: '+(446) 256 234 98',
  map_url: 'https://www.google.com/maps/place/Jackson+Heights,+Queens,+NY,+USA',
};

export const eventsEn = E.map(([slug, image, date_label, place, title, summary]) =>
  entry(slug, {
    slug,
    fields: { title, summary, date_label, place, body: eventDetailBodyEn, map_label: 'Jackson Heights, Queens, NY' },
    media: { image: img(image, 'event') },
    data: SAMPLE_DETAIL,
  }),
);
