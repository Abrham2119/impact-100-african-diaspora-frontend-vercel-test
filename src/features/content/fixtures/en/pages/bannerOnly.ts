import { PATHS } from '@/app/routes/paths';
import type { PageTreeDto } from '@/types/content.dto';
import { page } from '../build';
import { banner } from './banner';

// Pages whose body lands in a later step (public pages B in Step 6, auth screens): for now their
// page tree holds only the breadcrumb banner and the SEO title, copied verbatim from each snapshot.
const P = PATHS.public;
const A = PATHS.auth;
const signIn: [string, string] = ['Member login', A.signIn];

const only = (
  key: string,
  path: string,
  seoTitle: string,
  title: string,
  trail: Array<string | [string, string]>,
): [string, PageTreeDto] => [key, page(key, path, { title: `Impact100 — ${seoTitle}` }, [banner(title, trail)])];

export const bannerOnlyPagesEn: Record<string, PageTreeDto> = Object.fromEntries([
  only('contact', P.contact, 'Contact', 'Contact Us', ['Contact Us']),
  only('contact_thanks', P.contactThanks, 'Contact — thank you', 'Message received', [['Contact', P.contact], 'Thank you']),
  only('join', P.join, 'Become a member', 'Become a member', [['Opportunities', P.volunteer], 'Become a member']),
  only('donate', P.donate, 'Donate', 'Donate', [['Opportunities', P.volunteer], 'Donate']),
  only('donate_thanks', P.donateThanks, 'Donate — thank you', 'Thank you for your gift', [['Donate', P.donate], 'Thank you']),
  only('donate_cancel', P.donateCancel, 'Cancel monthly gift', 'Cancel a monthly gift', [['Donate', P.donate], 'Cancel monthly gift']),
  only('volunteer', P.volunteer, 'Volunteer', 'Volunteer with us', [['Opportunities', P.volunteer], 'Volunteer']),
  only('volunteer_thanks', P.volunteerThanks, 'Volunteer — thank you', 'Thank you for volunteering', [['Volunteer', P.volunteer], 'Thank you']),
  only('grants', P.grants, 'Grants', 'Grants & the Africa map', ['Grants']),
  only('campaigns', P.campaigns, 'Campaigns', 'campaigns', ['campaigns']),
  only('campaign_detail', P.campaigns, 'Campaign details', 'campaign details', [['campaign', P.campaigns], 'campaign details']),
  only('campaign_category', P.campaignCategory(), 'Category', 'Category', ['Category']),
  only('nonprofits', P.nonprofits, 'Nonprofits', 'Nonprofit partners', ['Nonprofits']),
  only('events', P.events, 'Events', 'Events', ['Events']),
  only('event_detail', P.events, 'Event details', 'Event details', [['event', P.events], 'Event details']),
  only('hubs', P.hubs, 'US regional hubs', 'Regional hubs', [['Events', P.events], 'US regional hubs']),
  only('news', P.news, 'Blogs', 'News & updates', ['News & stories']),
  only('news_detail', P.news, 'Blog details', 'Blog details', [['blog', P.news], 'Blog details']),
  only('share_story', P.shareStory, 'Share a story', 'Share a story', [['News', P.news], 'Share a story']),
  only('auth_sign_in', A.signIn, 'Sign in', 'Member login', ['Member login']),
  only('auth_sign_up', A.signUp, 'Sign up', 'sign up', ['sign up']),
  only('auth_forgot', A.forgotPassword, 'Forgot password', 'forgot password', ['forgot password']),
  only('auth_check_email', A.checkEmail, 'Check your email', 'Check your email', [signIn, 'Check your email']),
  only('auth_two_step', A.twoStep, 'Two-step verification', 'Two-step verification', [signIn, 'Two-step verification']),
  only('auth_two_step_setup', A.twoStepSetup, 'Set up two-step verification', 'Set up two-step', [signIn, 'Set up two-step verification']),
]);
