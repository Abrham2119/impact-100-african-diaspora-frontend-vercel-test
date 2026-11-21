import { PATHS } from '@/app/routes/paths';
import type { PageTreeDto } from '@/types/content.dto';
import { page } from '../build';
import { banner } from './banner';

// The auth screens (bodies in Step 14): for now their page tree holds only the breadcrumb banner and
// the SEO title, copied verbatim from each snapshot. Every public page has its full tree (Steps 5–6).
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
  only('auth_sign_in', A.signIn, 'Sign in', 'Member login', ['Member login']),
  only('auth_sign_up', A.signUp, 'Sign up', 'sign up', ['sign up']),
  only('auth_forgot', A.forgotPassword, 'Forgot password', 'forgot password', ['forgot password']),
  only('auth_check_email', A.checkEmail, 'Check your email', 'Check your email', [signIn, 'Check your email']),
  only('auth_two_step', A.twoStep, 'Two-step verification', 'Two-step verification', [signIn, 'Two-step verification']),
  only('auth_two_step_setup', A.twoStepSetup, 'Set up two-step verification', 'Set up two-step', [signIn, 'Set up two-step verification']),
]);
