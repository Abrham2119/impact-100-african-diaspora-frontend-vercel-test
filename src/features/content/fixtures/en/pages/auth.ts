import { PATHS } from '@/app/routes/paths';
import type { PageTreeDto, RichInline } from '@/types/content.dto';
import { rich } from '../../builders';
import { img, link, page, section } from '../build';
import { banner } from './banner';

// The auth screens 34–39 (sign_in / sign_up / forgot_password / check_email / two_step /
// two_step_enrol .dc.html), copy verbatim; banners and SEO titles as each snapshot shows them.
// Sign-up and forgot password drop the template's password fields and Google button (FQ5, FE-7).
const A = PATHS.auth;
const P = PATHS.public;
const signInCrumb: [string, string] = ['Member login', A.signIn];
const a = (text: string, href: string): RichInline => ({ type: 'link', href, children: [{ type: 'text', text }] });
const card = (file: string, alt: string) => ({ image: img(file, alt) });

const authPage = (key: string, path: string, seoTitle: string, title: string, trail: Array<string | [string, string]>, body: ReturnType<typeof section>): [string, PageTreeDto] => [
  key,
  page(key, path, { title: `Impact100 — ${seoTitle}` }, [banner(title, trail), body]),
];

export const authPagesEn: Record<string, PageTreeDto> = Object.fromEntries([
  authPage(
    'auth_sign_in',
    A.signIn,
    'Sign in',
    'Member login',
    ['Member login'],
    section('form_block', 'sign_in', {
      settings: { form_key: 'sign_in' },
      media: card('registration_img_2.webp', 'login'),
      fields: {
        title: 'Member login',
        lead: 'We’ll email you a single-use login link — no password needed.',
        submit_label: 'email me a login link',
        alt_label: 'Or',
        sso_label: 'Continue with WAZIImpact.org',
        after_form: [rich.p('Not a member yet? ', a('Become a member', P.join))],
        note: [
          rich.note(
            'Admins, finance and editors also confirm a 6-digit code — ',
            a('two-step verification', A.twoStep),
            '. ',
            a('Trouble logging in?', A.forgotPassword),
          ),
        ],
      },
    }),
  ),
  authPage(
    'auth_sign_up',
    A.signUp,
    'Sign up',
    'sign up',
    ['sign up'],
    section('form_block', 'sign_up', {
      settings: { form_key: 'sign_up' },
      media: card('registration_img.webp', 'login'),
      fields: {
        title: 'Sign up',
        lead: 'Stay with us. Help the needy.',
        submit_label: 'sign up',
        after_form: [rich.p('Haven’t Account ? ', a('sign in', A.signIn))],
      },
    }),
  ),
  authPage(
    'auth_forgot',
    A.forgotPassword,
    'Forgot password',
    'forgot password',
    ['forgot password'],
    section('form_block', 'forgot', {
      settings: { form_key: 'forgot' },
      media: card('registration_img.webp', 'login'),
      fields: { title: 'forgot password ?', lead: 'Stay with us. Help the needy.', submit_label: 'send' },
    }),
  ),
  authPage(
    'auth_check_email',
    A.checkEmail,
    'Check your email',
    'Check your email',
    [signInCrumb, 'Check your email'],
    section('form_block', 'check_email', {
      settings: { form_key: 'check_email', icon: 'far fa-envelope' },
      fields: {
        title: 'We sent you a login link',
        lead: 'If that address belongs to a member, a single-use link is on its way. It works once and expires soon. You can ask for up to 5 links an hour.',
        fail_title: 'Link expired?',
        fail_body: 'Expired or already-used links show this message — just ask for a new one.',
        actions: [link('open the portal', PATHS.portal.dashboard), link('send a new link', A.signIn, 'dark')],
      },
    }),
  ),
  authPage(
    'auth_two_step',
    A.twoStep,
    'Two-step verification',
    'Two-step verification',
    [signInCrumb, 'Two-step verification'],
    section('form_block', 'two_step', {
      settings: { form_key: 'two_step' },
      media: card('registration_img_2.webp', ''),
      fields: {
        kicker: 'Admins, finance and editors',
        title: 'Enter your 6-digit code',
        lead: 'Open your authenticator app and type the current code for Impact100.',
        submit_label: 'verify and continue',
        after_form: [rich.p('Lost your device? ', a('Contact a Chapter admin', P.contact))],
        note: [rich.note('Admin pages stay locked until two-step verification passes.')],
      },
    }),
  ),
  authPage(
    'auth_two_step_setup',
    A.twoStepSetup,
    'Set up two-step verification',
    'Set up two-step',
    [signInCrumb, 'Set up two-step verification'],
    section('form_block', 'two_step_setup', {
      settings: { form_key: 'two_step_setup' },
      media: card('registration_img_2.webp', ''),
      fields: {
        kicker: 'Required for your role',
        title: 'Protect your account',
        lead: 'Your role (Chapter admin, USAFI finance or Content Editor) needs two-step verification. Scan the code with an authenticator app, then enter the 6-digit code it shows.',
        submit_label: 'turn on two-step verification',
        note: [rich.note('You will need a code each time you sign in to admin pages.')],
      },
    }),
  ),
]);
