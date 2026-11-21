import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthCard, ButtonLink, Card, LoadingState, ResultBox } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { CmsButtons } from '@/features/content/components/CmsButton';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { toImage } from '@/features/content/components/sections/shared';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { isMockData } from '@/infrastructure/api/dataSource';
import { authFlowStorage } from '@/infrastructure/storage/authFlow.storage';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { isEmail, isName } from '@/lib/validation';
import { useAuthStore } from '@/store/authStore';
import { AuthError } from '../api';
import { mockAuthTools } from '../api/mockAuthRepository';
import {
  useCompleteSignIn,
  useConsumeLink,
  useExchangeSso,
  useRequestLoginLink,
  useSignUp,
  useStartSso,
  useTwoFactorLogin,
  useTwoFactorSetup,
  useTwoFactorVerify,
} from '../hooks/usePasswordlessAuth';
import { landingFor, safeNext } from '../lib/resolveLanding';

// The design auth screens 34–39 (sign_in, sign_up, forgot_password, check_email, two_step,
// two_step_enrol .dc.html) as form_block components: markup verbatim inside <AuthCard>, copy from
// the CMS section, labels and errors from UiStrings (`forms`). Sign-in is passwordless (decision
// D1): an emailed single-use link or WAZIImpact.org SSO, then TOTP two-step for the roles that need
// it. Sign-up and forgot password keep their layout without password fields (FQ5, decided in FE-7).

const withNext = (path: string, next: string | null) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

/**
 * Runs `action` once per distinct value (single-use tokens survive StrictMode's double effects).
 * Effect-started mutations continue from `mutateAsync`'s promise: per-call `mutate` callbacks are
 * dropped when StrictMode re-subscribes the observer.
 */
function useOnce(value: string | null, action: (value: string) => void) {
  const done = useRef<string | null>(null);
  useEffect(() => {
    if (!value || done.current === value) return;
    done.current = value;
    action(value);
  }, [value, action]);
}

function Heading({ section }: { section: FormBlockData }) {
  const { fields } = section;
  return (
    <>
      {fields.kicker !== undefined && <p className="ix_kicker">{fields.kicker}</p>}
      {fields.title !== undefined && <h2>{fields.title}</h2>}
      {fields.lead !== undefined && <p>{fields.lead}</p>}
    </>
  );
}

/** The lines under the form: `p.sign_up` (plain links) and the `ix_note`. */
function AfterForm({ section }: { section: FormBlockData }) {
  const { fields } = section;
  return (
    <>
      {fields.after_form && <RichText value={fields.after_form} plainLinks paragraphClassName="sign_up" />}
      {fields.note && <RichText value={fields.note} />}
    </>
  );
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <span id={id} className="ix_err" role="alert">
      {message}
    </span>
  );
}

const errorText = (error: unknown, tf: ReturnType<typeof useT<'forms'>>) =>
  error instanceof AuthError && error.code === 'INVALID_CODE' ? tf('error.code') : error instanceof AuthError && error.code === 'LINK_EXPIRED' ? tf('error.signInAgain') : tf('error.submit');

// sign_in — email me a login link, or continue with WAZIImpact.org (`?sso=` comes back here).
export function SignInScreen({ section }: { section: FormBlockData }) {
  const { fields, media } = section;
  const tf = useT('forms');
  const navigate = useNavigate();
  const [next] = useSearchParamState('next');
  const [ssoCode] = useSearchParamState('sso');
  const request = useRequestLoginLink();
  const startSso = useStartSso();
  const exchange = useExchangeSso();
  const complete = useCompleteSignIn();
  const schema = useMemo(() => z.object({ email: z.string().refine(isEmail, tf('error.email')) }), [tf]);
  const form = useDesignForm(schema, { email: '' });
  const error = form.formState.errors.email?.message;

  const [ssoFailure, setSsoFailure] = useState<unknown>(null);
  const { mutateAsync: exchangeCode } = exchange;
  const onSso = useMemo(
    () => (code: string) =>
      void exchangeCode(code)
        .then((result) => complete(result, next))
        .catch((error: unknown) => setSsoFailure(error)),
    [exchangeCode, complete, next],
  );
  useOnce(ssoCode, onSso);

  const send = form.handleSubmit(({ email }) =>
    request.mutate({ email: email.trim(), nextPath: safeNext(next) ?? undefined }, { onSuccess: () => navigate(withNext(PATHS.auth.checkEmail, next)) }),
  );
  const sso = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    startSso.mutate(safeNext(next) ?? undefined, {
      onSuccess: ({ redirectUrl }) => (/^https?:/.test(redirectUrl) ? window.location.assign(redirectUrl) : navigate(redirectUrl)),
    });
  };
  const failure = request.error ?? startSso.error ?? ssoFailure;

  return (
    <AuthCard image={media.image && toImage(media.image)}>
      <Heading section={section} />
      <form className="login_form" onSubmit={send} noValidate>
        <label htmlFor="li_email" className="ix_sr">
          {tf('auth.email')}
        </label>
        <input
          id="li_email"
          placeholder={tf('auth.email')}
          type="email"
          autoComplete="email"
          aria-label={tf('auth.email')}
          className={cx(error && 'ix_input_bad')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'li_email-error' : undefined}
          {...form.register('email')}
        />
        <FieldError id="li_email-error" message={error} />
        <button className="common_btn" type="submit" disabled={request.isPending}>
          {fields.submit_label}
        </button>
      </form>
      {failure !== null && failure !== undefined && <ResultBox kind="bad" title={errorText(failure, tf)} />}
      {fields.alt_label !== undefined && <b>{fields.alt_label}</b>}
      {fields.sso_label !== undefined && (
        <a className="sign_up_others_option" href={PATHS.auth.signIn} onClick={sso} aria-busy={startSso.isPending || exchange.isPending || undefined}>
          <i className="far fa-shield-check ixd_sso_icon" aria-hidden="true" />
          {` ${fields.sso_label}`}
        </a>
      )}
      <AfterForm section={section} />
    </AuthCard>
  );
}

// sign_up — name + email → account + login link (FQ5: no password fields, no Google button).
export function SignUpScreen({ section }: { section: FormBlockData }) {
  const { fields, media } = section;
  const tf = useT('forms');
  const navigate = useNavigate();
  const signUp = useSignUp();
  const schema = useMemo(
    () => z.object({ name: z.string().refine(isName, tf('error.name')), email: z.string().refine(isEmail, tf('error.email')) }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '' });
  const { errors } = form.formState;
  const send = form.handleSubmit(({ name, email }) =>
    signUp.mutate({ fullName: name.trim(), email: email.trim() }, { onSuccess: () => navigate(PATHS.auth.checkEmail) }),
  );

  return (
    <AuthCard image={media.image && toImage(media.image)}>
      <Heading section={section} />
      <form className="login_form" onSubmit={send} noValidate>
        <input
          placeholder={tf('auth.name')}
          type="text"
          autoComplete="name"
          aria-label={tf('auth.name')}
          className={cx(errors.name && 'ix_input_bad')}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'su_name-error' : undefined}
          {...form.register('name')}
        />
        <FieldError id="su_name-error" message={errors.name?.message} />
        <input
          placeholder={tf('auth.email')}
          type="email"
          autoComplete="email"
          aria-label={tf('auth.email')}
          className={cx(errors.email && 'ix_input_bad')}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'su_email-error' : undefined}
          {...form.register('email')}
        />
        <FieldError id="su_email-error" message={errors.email?.message} />
        <button className="common_btn" type="submit" disabled={signUp.isPending}>
          {fields.submit_label}
        </button>
      </form>
      {signUp.isError && <ResultBox kind="bad" title={errorText(signUp.error, tf)} />}
      <AfterForm section={section} />
    </AuthCard>
  );
}

// forgot_password — there is no password: it emails a login link (FQ5).
export function ForgotScreen({ section }: { section: FormBlockData }) {
  const { fields, media } = section;
  const tf = useT('forms');
  const navigate = useNavigate();
  const request = useRequestLoginLink();
  const schema = useMemo(() => z.object({ email: z.string().refine(isEmail, tf('error.email')) }), [tf]);
  const form = useDesignForm(schema, { email: '' });
  const error = form.formState.errors.email?.message;
  const send = form.handleSubmit(({ email }) => request.mutate({ email: email.trim() }, { onSuccess: () => navigate(PATHS.auth.checkEmail) }));

  return (
    <AuthCard image={media.image && toImage(media.image)}>
      <Heading section={section} />
      <form className="login_form" onSubmit={send} noValidate>
        <input
          placeholder={tf('auth.email')}
          type="email"
          autoComplete="email"
          aria-label={tf('auth.email')}
          className={cx(error && 'ix_input_bad')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'fp_email-error' : undefined}
          {...form.register('email')}
        />
        <FieldError id="fp_email-error" message={error} />
        <button className="common_btn" type="submit" disabled={request.isPending}>
          {fields.submit_label}
        </button>
      </form>
      {request.isError && <ResultBox kind="bad" title={errorText(request.error, tf)} />}
      <AfterForm section={section} />
    </AuthCard>
  );
}

// check_email — "We sent you a login link"; also the landing of the emailed link
// (`/auth/sign-in/link?token=`): consumed on arrival, an expired or used link shows this card.
// With mock data a demo inbox under the card stands in for the email.
export function CheckEmailScreen({ section }: { section: FormBlockData }) {
  const { fields, settings } = section;
  const t = useT('common');
  const [token] = useSearchParamState('token');
  const [next] = useSearchParamState('next');
  const consume = useConsumeLink();
  const complete = useCompleteSignIn();
  // an expired / used link: show this card (local state — see useOnce on mutation observers)
  const [failed, setFailed] = useState(false);
  const { mutateAsync } = consume;
  const onToken = useMemo(
    () => (value: string) =>
      void mutateAsync(value)
        .then((result) => complete(result, next))
        .catch(() => setFailed(true)),
    [mutateAsync, complete, next],
  );
  useOnce(token, onToken);

  if (token && !failed) {
    return (
      <section className="mt_100">
        <div className="container">
          <LoadingState label={t('states.loading')} />
        </div>
      </section>
    );
  }

  const inbox = isMockData && !token ? mockAuthTools.latestLink() : null;
  const exampleEmail = mockAuthTools.demoUsers[0]?.user.email ?? '';

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-9 m-auto">
            <Card className="ixd_status_card">
              <div className="ix_num ixd_num_xl">
                <i className={settings.icon} aria-hidden="true" />
              </div>
              <h2 className="ixd_title_38">{fields.title}</h2>
              {fields.lead !== undefined && <p className="ixd_band_text ixd_mt14">{fields.lead}</p>}
              {fields.fail_title !== undefined && (
                <ResultBox kind="bad" title={fields.fail_title} className="ixd_text_left">
                  {fields.fail_body}
                </ResultBox>
              )}
              {fields.actions && (
                <div className="ix_btn_row ixd_row_center">
                  <CmsButtons links={fields.actions} />
                </div>
              )}
            </Card>
            {inbox && (
              <ResultBox
                kind="wait"
                title={t('demo.inbox')}
                className="ixd_text_left ixd_mt18"
                extra={
                  inbox.url ? (
                    <ButtonLink size="sm" to={inbox.url}>
                      {t('demo.inboxLink', { email: inbox.email })}
                    </ButtonLink>
                  ) : undefined
                }
              >
                {inbox.url ? undefined : t('demo.inboxNone', { email: inbox.email, example: exampleEmail })}
              </ResultBox>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const CODE_LENGTH = 6;
const codeSchema = (message: string) => z.object({ code: z.string().refine((v) => new RegExp(`^\\d{${CODE_LENGTH}}$`).test(v.replace(/\s/g, '')), message) });

// two_step — the 6-digit code after the login link, for the roles that require it.
export function TwoStepScreen({ section }: { section: FormBlockData }) {
  const { fields, media } = section;
  const tf = useT('forms');
  const [next] = useSearchParamState('next');
  const verify = useTwoFactorLogin();
  const complete = useCompleteSignIn();
  const challenge = authFlowStorage.read().challengeToken;
  const schema = useMemo(() => codeSchema(tf('error.code')), [tf]);
  const form = useDesignForm(schema, { code: '' });
  const error = form.formState.errors.code?.message ?? (verify.error ? errorText(verify.error, tf) : undefined);

  if (!challenge) return <Navigate to={withNext(PATHS.auth.signIn, next)} replace />;
  const send = form.handleSubmit(({ code }) =>
    verify.mutate(
      { challengeToken: challenge, code: code.replace(/\s/g, '') },
      {
        onSuccess: (result) => {
          authFlowStorage.clearChallenge();
          complete(result, next ?? authFlowStorage.read().next ?? null);
        },
      },
    ),
  );

  return (
    <AuthCard image={media.image && toImage(media.image)}>
      <Heading section={section} />
      <form className="login_form" onSubmit={send} noValidate>
        <label htmlFor="ts_code" className="ix_sr">
          {tf('auth.code')}
        </label>
        <input
          id="ts_code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH + 1}
          placeholder={tf('auth.codePlaceholder')}
          className={cx('ixd_code_input', error && 'ix_input_bad')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'ts_code-error' : undefined}
          {...form.register('code')}
        />
        <FieldError id="ts_code-error" message={error} />
        <button className="common_btn ixd_block_btn" type="submit" disabled={verify.isPending}>
          {fields.submit_label}
        </button>
      </form>
      <AfterForm section={section} />
    </AuthCard>
  );
}

// two_step_enrol — required for the role, not set up yet: scan / key, then confirm a code.
export function TwoStepSetupScreen({ section }: { section: FormBlockData }) {
  const { fields, media } = section;
  const tf = useT('forms');
  const navigate = useNavigate();
  const [next] = useSearchParamState('next');
  const session = useAuthStore((s) => s.session);
  const setup = useTwoFactorSetup(session !== null);
  const verify = useTwoFactorVerify();
  const schema = useMemo(() => codeSchema(tf('error.code')), [tf]);
  const form = useDesignForm(schema, { code: '' });
  const error = form.formState.errors.code?.message ?? (verify.error ? errorText(verify.error, tf) : undefined);
  const send = form.handleSubmit(({ code }) =>
    verify.mutate(code.replace(/\s/g, ''), { onSuccess: () => navigate(safeNext(next) ?? landingFor(session), { replace: true }) }),
  );

  return (
    <AuthCard image={media.image && toImage(media.image)}>
      <Heading section={section} />
      <Card tone="soft" className="ixd_enrol_card">
        {setup.data?.qrDataUrl ? (
          <img className="ixd_qr_image" src={setup.data.qrDataUrl} alt={tf('auth.qr')} />
        ) : (
          <div className="ixd_qr_placeholder" role="img" aria-label={tf('auth.qr')} />
        )}
        <div>
          <b className="ixd_text_black">{tf('auth.cantScan')}</b>
          <p className="ix_note">
            {`${tf('auth.enterKey')} `}
            <span className="ix_code">{setup.data?.manualKey}</span>
          </p>
        </div>
      </Card>
      <form className="login_form" onSubmit={send} noValidate>
        <label htmlFor="te_code" className="ix_sr">
          {tf('auth.code')}
        </label>
        <input
          id="te_code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH + 1}
          placeholder={tf('auth.code')}
          className={cx(error && 'ix_input_bad')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'te_code-error' : undefined}
          {...form.register('code')}
        />
        <FieldError id="te_code-error" message={error} />
        <button className="common_btn ixd_block_btn" type="submit" disabled={verify.isPending}>
          {fields.submit_label}
        </button>
      </form>
      <AfterForm section={section} />
    </AuthCard>
  );
}
