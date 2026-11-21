import { entry, img } from '../build';

// C:volunteers — the /about/volunteers grid (12 per page) and the home slider (5 chosen by key).
// Template sample content copied verbatim from design-reference/pages/volunteers.dc.html; the
// design shows pages "01 02 03", so the 12 are seeded three times to make paging real (FQ8).
const V: Array<[image: string, name: string, role: string]> = [
  ['volunteer_img_1.webp', 'Jhon Smith', 'Volunteer'],
  ['volunteer_img_4.webp', 'David Davis', 'Campaign Volunteer'],
  ['volunteer_img_3.webp', 'Sarah Taylor', 'Co Funder'],
  ['volunteer_img_5.webp', 'Michael Smith', 'Campaign Volunteer'],
  ['volunteer_img_6.webp', 'Jhon Smith', 'Volunteer'],
  ['volunteer_img_7.webp', 'David Davis', 'Campaign Volunteer'],
  ['volunteer_img_8.webp', 'Sarah Taylor', 'Co Funder'],
  ['volunteer_img_9.webp', 'Joseph Anderson', 'CEO'],
  ['volunteer_img_10.webp', 'Michael Smith', 'Campaign Volunteer'],
  ['volunteer_img_11.webp', 'Michael Smith', 'Campaign Volunteer'],
  ['volunteer_img_12.webp', 'Jhon Smith', 'Volunteer'],
  ['volunteer_img_2.webp', 'Joseph Anderson', 'CEO'],
];

export const volunteersEn = [0, 1, 2].flatMap((round) =>
  V.map(([image, name, role], i) =>
    entry(`volunteer-${String(round * V.length + i + 1).padStart(2, '0')}`, {
      fields: { name, role },
      media: { photo: img(image, 'volunteer') },
    }),
  ),
);

/** The five volunteers of the home slider, in the design's order (index.dc.html `data.vol`). */
export const HOME_VOLUNTEER_KEYS = ['volunteer-01', 'volunteer-02', 'volunteer-03', 'volunteer-12', 'volunteer-04'];

// C:leadership — the About page slider (about_us.dc.html `data.vol`). Alt text = the person's name.
const L: Array<[name: string, role: string, image: string]> = [
  ['Dr. Carmen Ward-Sullivan', 'Impact 100 ADC Chair', 'volunteer_img_1.webp'],
  ['Prof. Solomon Belette', 'President/CEO, USAFI LLC and USAFI Impact', 'volunteer_img_9.webp'],
  ['Dr. Benisa Berry', 'USAFI Chief of Diaspora Engagement', 'volunteer_img_2.webp'],
  ['Susan Boreliz', 'Advisory Board Coordinator', 'volunteer_img_5.webp'],
];

export const leadershipEn = L.map(([name, role, image], i) =>
  entry(`leader-${i + 1}`, { fields: { name, role }, media: { photo: img(image, name) } }),
);
