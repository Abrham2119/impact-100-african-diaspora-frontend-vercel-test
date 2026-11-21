import type { PublicChrome } from '@/domain/entities/navigation.types';
import { PATHS } from '@/app/routes/paths';
import logo from '@/assets/images/logo_impact100.webp';
import logoLight from '@/assets/images/logo_impact100_light.webp';

// English seed of the CMS global content: navigation menus, top bar and footer
// (CONTENT_AND_I18N.md §1 "Global content"). Copied verbatim from
// design-reference/snapshots/index.html — the client's approved copy.
// This is THE one navConfig: PublicHeader, its mega menus and the mobile menu all render from it.
// Shaped like `GET content/nav/:menu` + global content; Step 13 serves it from the API instead.
// Design hash links (contact.html#topic=…, volunteer.html#area=…) are search params here (ARCHITECTURE §5.1).
// The demo contact details and the footer counters are template sample content (README, FQ8), seeded as-is.

const P = PATHS.public;

export const chromeEn: PublicChrome = {
  topbar: {
    email: 'example@gmail.com',
    phone: '+965 088 6578 654 87',
    socials: [
      { icon: 'fab fa-facebook-f', label: 'Facebook', to: '#' },
      { icon: 'fab fa-twitter', label: 'Twitter', to: '#' },
      { icon: 'fab fa-linkedin-in', label: 'LinkedIn', to: '#' },
      { icon: 'fab fa-instagram', label: 'Instagram', to: '#' },
      { icon: 'fab fa-pinterest-p', label: 'Pinterest', to: '#' },
    ],
  },
  nav: {
    brand: { to: PATHS.home, logo: { src: logo, alt: 'Impact100 African Diaspora USA — home' } },
    items: [
      {
        id: 'about',
        label: 'About',
        to: P.about,
        menu: {
          kind: 'mega_2',
          columns: [
            {
              heading: 'Who we are',
              links: [
                { id: 'about.about', label: 'About Us', to: P.about, icon: 'far fa-info-circle' },
                { id: 'about.committees', label: 'Committees', to: P.committees, icon: 'far fa-users' },
                { id: 'about.charter', label: 'Charter', to: P.charter, icon: 'far fa-file-alt' },
                { id: 'about.volunteers', label: 'Our Volunteers', to: P.volunteers, icon: 'far fa-hands-helping' },
                { id: 'about.testimonials', label: 'Testimonials', to: P.testimonials, icon: 'far fa-comment-alt' },
              ],
            },
            {
              heading: 'Explore & connect',
              links: [
                { id: 'about.donors', label: 'Donor List', to: P.donors, icon: 'far fa-heart' },
                { id: 'about.photos', label: 'Photo Gallery', to: P.photoGallery, icon: 'far fa-images' },
                { id: 'about.videos', label: 'Video Gallery', to: P.videoGallery, icon: 'far fa-video' },
                { id: 'about.faq', label: "FAQ's", to: P.faq, icon: 'far fa-question-circle' },
                { id: 'about.contact', label: 'Contact', to: P.contact, icon: 'far fa-envelope' },
              ],
            },
          ],
        },
      },
      { id: 'model', label: 'Our model', to: P.ourModel },
      {
        id: 'opportunities',
        label: 'Opportunities',
        to: P.volunteer,
        ariaHasPopup: true,
        menu: {
          kind: 'mega',
          columns: [
            {
              heading: 'Ways to take part',
              links: [
                { id: 'opportunities.join', label: 'Become a member', sub: 'Individuals · from $250 a cycle', to: P.join },
                { id: 'opportunities.donate', label: 'Donate', sub: 'Everyone · no account needed', to: P.donate },
                { id: 'opportunities.volunteer', label: 'Volunteer', sub: 'Everyone · 19 open roles', to: P.volunteer },
                { id: 'opportunities.hubs', label: 'Join a US hub', sub: 'People living in the US', to: P.hubs },
                { id: 'opportunities.partner', label: 'Partner with us', sub: 'Nonprofit organizations', to: P.nonprofits },
                { id: 'opportunities.sponsor', label: 'Sponsor the Chapter', sub: 'Companies and funders', to: `${P.contact}?topic=sponsorship` },
                { id: 'opportunities.story', label: 'Share a story', sub: 'Members', to: P.shareStory },
              ],
            },
            {
              heading: 'Volunteer areas',
              links: [
                { id: 'opportunities.area_chapter', label: 'Chapter', count: '6', to: `${P.volunteer}?area=chapter` },
                { id: 'opportunities.area_us', label: 'US hubs', count: '5', to: `${P.volunteer}?area=us` },
                { id: 'opportunities.area_usafi', label: 'USAFI portfolios', count: '4', to: `${P.volunteer}?area=usafi` },
                { id: 'opportunities.area_africa', label: 'African hubs', count: '4', to: `${P.volunteer}?area=africa` },
                { id: 'opportunities.area_all', label: 'All open roles', count: '19', to: P.volunteer },
              ],
            },
          ],
        },
      },
      {
        id: 'grants',
        label: 'Grants',
        to: P.grants,
        menu: {
          kind: 'list',
          links: [
            { id: 'grants.map', label: 'Grants', to: P.grants },
            { id: 'grants.campaigns', label: 'Campaigns', to: P.campaigns },
            { id: 'grants.categories', label: 'Categories', to: P.campaignCategory() },
          ],
        },
      },
      { id: 'nonprofits', label: 'Nonprofits', to: P.nonprofits },
      {
        id: 'events',
        label: 'Events',
        to: P.events,
        menu: {
          kind: 'list',
          links: [
            { id: 'events.events', label: 'Events', to: P.events },
            { id: 'events.hubs', label: 'US Regional Hubs', to: P.hubs },
          ],
        },
      },
      {
        id: 'news',
        label: 'News',
        to: P.news,
        menu: {
          kind: 'list',
          links: [
            { id: 'news.news', label: 'News', to: P.news },
            { id: 'news.share', label: 'Share a Story', to: P.shareStory },
          ],
        },
      },
    ],
    ctas: [
      { label: 'donate', to: P.donate, variant: 'dark', hideMd: true },
      { label: 'become a member', to: P.join, variant: 'default' },
    ],
    account: {
      label: 'Member login',
      to: PATHS.auth.signIn,
      links: [
        { label: 'Member Login', to: PATHS.auth.signIn },
        { label: 'Become a Member', to: P.join },
        { label: 'Member Portal', to: PATHS.portal.dashboard },
        { label: 'Admin Console', to: PATHS.admin.dashboard },
      ],
    },
  },
  footer: {
    logo: { to: PATHS.home, image: { src: logoLight, alt: 'Logo' } },
    stats: [
      { icon: 'user', value: '29M', label: 'Number of supporters' },
      { icon: 'dollar', value: '$60000+', label: 'Fund raised of supporters' },
    ],
    columns: [
      {
        title: 'chapter',
        links: [
          { label: 'About Us', to: P.about },
          { label: 'Our Model', to: P.ourModel },
          { label: 'Charter', to: P.charter },
          { label: 'Grants', to: P.grants },
          { label: 'News', to: P.news },
        ],
      },
      {
        title: 'get involved',
        links: [
          { label: 'Become a Member', to: P.join },
          { label: 'Donate', to: P.donate },
          { label: 'Volunteer', to: P.volunteer },
          { label: 'Join a Hub', to: P.hubs },
          { label: 'Nonprofits', to: P.nonprofits },
        ],
      },
    ],
    contact: {
      title: 'contact us',
      items: [
        { icon: 'mail', text: 'example@gmail.com' },
        { icon: 'phone', text: '+(446) 256 234 98' },
        { icon: 'pin', text: 'Sleepy Hollow Street 68/210. New York 1423' },
      ],
    },
    newsletter: {
      title: 'newsletter',
      label: 'Email',
      placeholder: 'Your email for the newsletter',
      submitLabel: 'Subscribe to the newsletter',
      to: P.newsletterConfirmed,
    },
    socials: [
      { icon: 'fab fa-facebook-f', label: 'Facebook', to: '#' },
      { icon: 'fab fa-linkedin-in', label: 'LinkedIn', to: '#' },
      { icon: 'fab fa-pinterest-p', label: 'Pinterest', to: '#' },
      { icon: 'fab fa-behance', label: 'Behance', to: '#' },
      { icon: 'fab fa-google-plus-g', label: 'Google Plus', to: '#' },
    ],
    copyright: 'Copyright © 2026 All Rights Reserved by Impact100 African Diaspora USA',
    legal: [
      { label: 'Privacy & Cookies', to: P.privacy },
      { label: "FAQ's", to: P.faq },
      { label: 'Contact Us', to: P.contact },
    ],
  },
};
