import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Field, Input, Panel, ResultBox, Select } from '@/components/design';
import type { EmailPrefKey, MemberProfile } from '@/domain/entities/profile.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useMyProfile, useSaveInterests, useSaveProfile, useSetEmailPref } from '@/features/profile/hooks/useMyProfile';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { isEmail, isName } from '@/lib/validation';
import { PortalState } from './PortalState';

// Profile (portal_profile.dc.html): details (a new email waits for confirmation), interests (saved
// as they change — they reorder and tag the site, never eligibility) and email preferences
// (receipts and account emails can't be switched off).
const PREFS: EmailPrefKey[] = ['receipts', 'votes', 'newsletter', 'hub', 'volunteer'];

export function ProfilePage() {
  const query = useMyProfile();
  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {query.data && (
        <>
          <DetailsForm key={query.data.userId} profile={query.data} />
          <Interests profile={query.data} />
          <EmailPrefs profile={query.data} />
        </>
      )}
    </PortalState>
  );
}

function DetailsForm({ profile }: { profile: MemberProfile }) {
  const t = useT('portal');
  const tf = useT('forms');
  const catalog = useCatalog();
  const save = useSaveProfile();
  const [result, setResult] = useState<{ pendingEmail: string | null } | null>(null);
  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().refine(isName, tf('error.name')),
        city: z.string(),
        usHubKey: z.string(),
        email: z.string().refine(isEmail, tf('error.email')),
      }),
    [tf],
  );
  const form = useDesignForm(schema, { fullName: profile.fullName, city: profile.city, usHubKey: profile.usHubKey ?? '', email: profile.email });
  const errors = form.formState.errors;
  const submit = form.handleSubmit(({ fullName, city, usHubKey, email }) => {
    const pendingEmail = email.trim().toLowerCase() !== profile.email.toLowerCase() ? email.trim() : null;
    // a new address only takes effect once confirmed from the link (sent by the server)
    return save
      .mutateAsync({ fullName: fullName.trim(), city: city.trim(), usHubKey: usHubKey || null, email: profile.email })
      .then(() => {
        form.reset({ fullName: fullName.trim(), city: city.trim(), usHubKey, email: profile.email });
        setResult({ pendingEmail });
      });
  });

  return (
    <Panel title={t('profile.title')} lead={t('profile.lead')}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="row">
          <div className="col-md-6">
            <Field id="pf_name" label={t('profile.name')} error={errors.fullName?.message}>
              <Input type="text" autoComplete="name" {...form.register('fullName')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pf_city" label={t('profile.city')}>
              <Input type="text" autoComplete="address-level2" {...form.register('city')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pf_hub" label={t('profile.usHub')}>
              <Select options={catalog.hubKeys.map((key) => ({ value: key, label: catalog.hub(key) }))} {...form.register('usHubKey')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pf_email" label={t('profile.email')} help={t('profile.emailHelp')} error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...form.register('email')} />
            </Field>
          </div>
        </div>
        <div className="ix_btn_row">
          <button type="submit" className="common_btn" disabled={save.isPending}>
            {t('profile.save')}
          </button>
        </div>
        {result && (
          <ResultBox kind={result.pendingEmail ? 'wait' : 'ok'} title={t('profile.saved')}>
            {result.pendingEmail ? t('profile.confirmEmail', { email: result.pendingEmail }) : t('profile.savedBody')}
          </ResultBox>
        )}
      </form>
    </Panel>
  );
}

function Interests({ profile }: { profile: MemberProfile }) {
  const t = useT('portal');
  const catalog = useCatalog();
  const save = useSaveInterests();
  const change = (patch: Partial<Pick<MemberProfile, 'africanHubKey' | 'portfolioKey'>>) =>
    save.mutate({ africanHubKey: profile.africanHubKey, portfolioKey: profile.portfolioKey, ...patch });

  return (
    <Panel title={t('profile.interests')} lead={t('profile.interestsLead')}>
      <div className="row">
        <div className="col-md-6">
          <Field id="pf_ahub" label={t('profile.africanHub')}>
            <Select
              value={profile.africanHubKey ?? ''}
              options={catalog.featuredCountryKeys.map((key) => ({ value: key, label: catalog.country(key) }))}
              onChange={(e) => change({ africanHubKey: e.target.value })}
            />
          </Field>
        </div>
        <div className="col-md-6">
          <Field id="pf_port" label={t('profile.portfolio')}>
            <Select
              value={profile.portfolioKey ?? ''}
              options={catalog.portfolioKeys.map((key) => ({ value: key, label: catalog.portfolio(key) }))}
              onChange={(e) => change({ portfolioKey: e.target.value })}
            />
          </Field>
        </div>
      </div>
      <p className="ix_note">{t('profile.interestsNote')}</p>
    </Panel>
  );
}

function EmailPrefs({ profile }: { profile: MemberProfile }) {
  const t = useT('portal');
  const setPref = useSetEmailPref();
  return (
    <Panel title={t('profile.prefs')} lead={t('profile.prefsLead')}>
      {PREFS.map((key) => {
        const locked = key === 'receipts';
        const on = locked || profile.emailPrefs[key];
        return (
          <div key={key} className="ix_toggle_row">
            <div>
              <b>{t(`pref.${key}`)}</b>
              <span className="ix_help">{t(`pref.${key}.sub`)}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={t(`pref.${key}`)}
              aria-disabled={locked || undefined}
              className={cx('ix_switch', on && 'ix_on', locked && 'ix_locked')}
              onClick={() => !locked && setPref.mutate({ key, on: !on })}
            />
          </div>
        );
      })}
    </Panel>
  );
}
