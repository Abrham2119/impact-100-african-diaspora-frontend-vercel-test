import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ButtonLink, CheckField, Field, Input, KeyValueList, Panel } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { typedNameMatches } from '@/domain/rules/governance';
import { GovernanceError } from '@/features/governance/api/governanceRepository';
import { useSignature, useSignCharter } from '@/features/governance/hooks/usePortalGovernance';
import { usePublicSettings } from '@/features/membership/hooks/useMembership';
import { useMyMembership } from '@/features/membership/hooks/useMyMembership';
import { levelName } from '@/features/membership/lib/levelName';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import { PortalState } from './PortalState';

// Sign the charter (portal_sign.dc.html): locked until the pledge is paid in full (and at least the
// membership minimum received); then the member ticks "I have read…" and types their account name
// (case and spacing ignored) to sign. Signed members go to the signature record. The design's
// "Your status / Preview when unlocked" review toggle is not rendered (FQ1).
export function SignPage() {
  const t = useT('portal');
  const ts = useT('site');
  const { locale } = useLocale();
  const membership = useMyMembership();
  const signature = useSignature();
  const { data: settings } = usePublicSettings();
  const m = membership.data;
  const version = signature.data?.version ?? '';
  const money = (cents: number) => formatMoney(cents, locale);

  if (signature.data?.signature) return <Navigate to={PATHS.portal.signed} replace />;

  return (
    <PortalState
      isPending={membership.isPending || signature.isPending}
      isError={membership.isError || signature.isError}
      onRetry={() => void Promise.all([membership.refetch(), signature.refetch()])}
    >
      <Panel title={t('sign.title')} lead={t('sign.version', { version })}>
        {m?.charterUnlocked ? (
          <SignForm version={version} level={levelName(ts, m.record.pledgeLevelKey)} />
        ) : (
          <div className="ix_lock">
            <i className="far fa-lock" aria-hidden="true" />
            <h3 className="ixd_lock_title">{t('sign.lockedTitle')}</h3>
            {m ? (
              <p className="ixd_lock_text">
                {`${t('sign.lockedBefore', { minimum: money(settings.membershipMinimumCents) })} `}
                <b>{t('sign.lockedAnd')}</b>
                {` ${t('sign.lockedAfter', { received: money(m.receivedCents), pledge: money(m.record.pledgeCents), left: money(m.toGoCents) })}`}
              </p>
            ) : (
              <p className="ixd_lock_text">{t('dash.noMembershipBody')}</p>
            )}
            <div className="ix_btn_row ixd_row_center">
              {m ? <ButtonLink to={PATHS.portal.dashboard}>{t('sign.pay')}</ButtonLink> : <ButtonLink to={PATHS.public.join}>{t('dash.join')}</ButtonLink>}
              <ButtonLink variant="dark" to={PATHS.public.charter}>
                {t('sign.read')}
              </ButtonLink>
            </div>
          </div>
        )}
      </Panel>
    </PortalState>
  );
}

function SignForm({ version, level }: { version: string; level: string }) {
  const t = useT('portal');
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const sign = useSignCharter();
  const fullName = profile?.fullName ?? '';
  const schema = useMemo(
    () =>
      z.object({
        ack: z.boolean().refine(Boolean, t('sign.ackError')),
        typed: z.string().refine((v) => typedNameMatches(v, fullName), t('sign.nameError', { name: fullName })),
      }),
    [t, fullName],
  );
  const form = useDesignForm(schema, { ack: false, typed: '' });
  const errors = form.formState.errors;
  const submit = form.handleSubmit(({ typed }) =>
    sign
      .mutateAsync({ typedName: typed })
      .then(() => navigate(PATHS.portal.signed))
      .catch((error: unknown) => {
        if (error instanceof GovernanceError && error.code === 'NAME_MISMATCH') form.setError('typed', { message: t('sign.nameError', { name: fullName }) });
      }),
  );

  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <KeyValueList
        rows={[
          { key: 'name', label: t('sign.name'), value: fullName },
          { key: 'email', label: t('sign.email'), value: profile?.email ?? '' },
          { key: 'level', label: t('sign.level'), value: t('sign.levelValue', { level }) },
          { key: 'version', label: t('sign.charterVersion'), value: version },
        ]}
      />
      <CheckField
        id="sg_ack"
        label={t('sign.ack', { version: version.split(' ')[0] ?? version })}
        aria-invalid={errors.ack ? true : undefined}
        aria-describedby={errors.ack ? 'sg_ack-error' : undefined}
        {...form.register('ack')}
      />
      {errors.ack?.message && (
        <span id="sg_ack-error" className="ix_err" role="alert">
          {errors.ack.message}
        </span>
      )}
      <Field id="sg_name" label={t('sign.typeName')} error={errors.typed?.message}>
        <Input type="text" className="ixd_sign_input" autoComplete="name" {...form.register('typed')} />
      </Field>
      <div className="ix_btn_row">
        <button type="submit" className="common_btn" disabled={sign.isPending}>
          {t('sign.submit')}
        </button>
      </div>
      <p className="ix_note">{t('sign.note')}</p>
    </form>
  );
}
