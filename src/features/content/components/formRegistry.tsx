import type { ComponentType } from 'react';
import {
  CheckEmailScreen,
  ForgotScreen,
  SignInScreen,
  SignUpScreen,
  TwoStepScreen,
  TwoStepSetupScreen,
} from '@/features/auth/components/AuthScreens';
import { ContactForm } from '@/features/engagement/components/ContactForm';
import { EligibilityCheck } from '@/features/engagement/components/EligibilityCheck';
import { HubJoin } from '@/features/engagement/components/HubJoin';
import { RoleBrowser } from '@/features/engagement/components/RoleBrowser';
import { ShareStoryForm } from '@/features/engagement/components/ShareStoryForm';
import { CancelGift } from '@/features/membership/components/CancelGift';
import { DonateForm } from '@/features/membership/components/DonateForm';
import { JoinWizard } from '@/features/membership/components/JoinWizard';
import type { SectionData } from '../schemas/defineSection';
import type { FORM_KEYS, formBlock } from '../schemas/sectionTypes';

// form_block → interactive feature component (ARCHITECTURE.md §7.2 `formRegistry`). The component
// gets the whole validated section: its CMS copy (fields), side content (items) and settings.
export type FormBlockData = SectionData<typeof formBlock>;
export type FormBlockComponent = ComponentType<{ section: FormBlockData }>;

export const FORM_REGISTRY: Partial<Record<(typeof FORM_KEYS)[number], FormBlockComponent>> = {
  eligibility: EligibilityCheck,
  hub_join: HubJoin,
  cancel_gift: CancelGift,
  contact: ContactForm,
  volunteer: RoleBrowser,
  share_story: ShareStoryForm,
  join: JoinWizard,
  donate: DonateForm,
  sign_in: SignInScreen,
  sign_up: SignUpScreen,
  forgot: ForgotScreen,
  check_email: CheckEmailScreen,
  two_step: TwoStepScreen,
  two_step_setup: TwoStepSetupScreen,
};
