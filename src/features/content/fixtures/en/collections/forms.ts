import { entry } from '../build';

// C:volunteer_roles — the 19 roles of /volunteer (volunteer.dc.html `R`), copy verbatim. `area` is
// the filter group; `team` / `team_key` the owning team (a sign-up is routed to each distinct team);
// `interest_key` is the portfolio or African hub a role matches ("Matches your interests").
const R: Array<[key: string, area: string, title: string, team: string, teamKey: string, description: string, interest: string | null]> = [
  ['membership-outreach-volunteer', 'chapter', 'Membership outreach volunteer', 'Membership & Donor Recruitment committee', 'membership-donor-recruitment-committee', 'Welcome new members and follow up on pledges.', null],
  ['communications-social-media', 'chapter', 'Communications & social media', 'Communications & Storytelling committee', 'communications-storytelling-committee', 'Share Chapter news, stories and event updates.', null],
  ['events-coordinator', 'chapter', 'Events coordinator', 'Events Management committee', 'events-management-committee', 'Plan Chapter-wide gatherings and the grant celebration.', null],
  ['grants-selection-reviewer', 'chapter', 'Grants Selection reviewer', 'Grants Selection committee', 'grants-selection-committee', 'Score proposals on the five-criterion rubric.', null],
  ['newsletter-editor', 'chapter', 'Newsletter editor', 'Communications & Storytelling committee', 'communications-storytelling-committee', 'Assemble the monthly member newsletter.', null],
  ['website-content-editor', 'chapter', 'Website content editor', 'Project Admin Support', 'project-admin-support', 'Publish news, events and roles in the CMS.', null],
  ['northern-california-hub-volunteer', 'us', 'Northern California hub volunteer', 'Northern California hub', 'northern-california-hub', 'Support local events and member sign-ups.', null],
  ['southern-california-hub-volunteer', 'us', 'Southern California hub volunteer', 'Southern California hub', 'southern-california-hub', 'Help launch the hub and its first events.', null],
  ['atlanta-hub-launch-team', 'us', 'Atlanta hub launch team', 'Atlanta hub', 'atlanta-hub', 'Get the Atlanta hub ready for its December launch.', null],
  ['dmv-hub-launch-team', 'us', 'DMV hub launch team', 'DMV hub', 'dmv-hub', 'Prepare the DMV hub launch before the March cycle close.', null],
  ['fifth-hub-founding-volunteer', 'us', 'Fifth hub founding volunteer', 'Regional Hub Leadership & Teams', 'regional-hub-leadership-teams', 'Help scope and found the fifth US regional hub.', null],
  ['impact-100-portfolio-volunteer', 'usafi', 'Impact 100 portfolio volunteer', 'Diaspora Engagement · Impact 100', 'diaspora-engagement-impact-100', 'Support the Impact 100 flagship programme.', 'diaspora-engagement'],
  ['victoria-falls-summit-volunteer', 'usafi', 'Victoria Falls Summit volunteer', 'Academic Partnerships · Victoria Falls Summit', 'academic-partnerships-victoria-falls-summit', 'Help plan and run the summit.', 'academic-partnerships'],
  ['youth-women-entrepreneurship-volunteer', 'usafi', 'Youth & Women Entrepreneurship volunteer', 'Youth & Women Entrepreneurship · flagship to be announced', 'youth-women-entrepreneurship-flagship-to-be-announced', 'Join the team shaping the third flagship.', 'youth-women-entrepreneurship'],
  ['thrive-africa-network-volunteer', 'usafi', 'THRIVE Africa Network volunteer', 'Sustainable Development · THRIVE Africa Network', 'sustainable-development-thrive-africa-network', 'Connect partners across the THRIVE network.', 'sustainable-development'],
  ['ghana-hub-liaison', 'africa', 'Ghana hub liaison', 'Ghana hub', 'ghana-hub', 'Be the link between the Chapter and the Ghana hub.', 'ghana'],
  ['kenya-hub-liaison', 'africa', 'Kenya hub liaison', 'Kenya hub', 'kenya-hub', 'Be the link between the Chapter and the Kenya hub.', 'kenya'],
  ['zambia-hub-liaison', 'africa', 'Zambia hub liaison', 'Zambia hub', 'zambia-hub', 'Be the link between the Chapter and the Zambia hub.', 'zambia'],
  ['african-hubs-research-volunteer', 'africa', 'African hubs research volunteer', 'Regional Hub Leadership & Teams', 'regional-hub-leadership-teams', 'Research partner organisations across the three hubs.', null],
];

export const volunteerRolesEn = R.map(([key, area, title, team, team_key, description, interest_key]) =>
  entry(key, { fields: { title, team, description }, data: interest_key ? { area, team_key, interest_key } : { area, team_key } }),
);

// C:contact_topics — the 6 topics of the contact form (contact.dc.html), routed by key.
export const contactTopicsEn = (
  [
    ['membership', 'Membership'],
    ['partner', 'Partner organization'],
    ['volunteering', 'Volunteering'],
    ['sponsorship', 'Sponsorship'],
    ['story', 'Share a story'],
    ['press', 'Press'],
  ] as const
).map(([key, name]) => entry(key, { fields: { name } }));
