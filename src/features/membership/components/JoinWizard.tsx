import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  Badge,
  Button,
  ButtonRow,
  Card,
  CheckField,
  Field,
  Input,
  KeyValueList,
  OptionButton,
  OptionGroup,
  ResultBox,
  Select,
  Stepper,
} from '@/components/design';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { CmsButtons } from '@/features/content/components/CmsButton';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { fillRich } from '@/features/content/lib/fillRich';
import { usHubs } from '@/features/content/schemas/sectionTypes';
import { findLevel, installmentPlan } from '@/domain/rules/membership';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { submissionStorage } from '@/infrastructure/storage/submission.storage';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { formatDate, formatMoney, formatMonthDay } from '@/lib/format';
import { isEmail, isName } from '@/lib/validation';
import { useJoinIntent, usePublicSettings, useStartJoin } from '../hooks/useMembership';
import { levelName } from '../lib/levelName';

// form_block `join` — /join (join.dc.html): Level → Details → Payment → Done.
//   • level from `?level=` (home / campaign cards, legacy `#level=`), else `default_key`;
//   • details validated with the design's messages; city OR a US hub (C:us_hubs);
//   • payment plans 1…max installments from the charter settings (domain/rules/membership);
//   • "continue to WAZIImpact.org" → `POST membership/join` (mocked) → checkout URL; coming back
//     with `?intent=&status_token=` shows "Done" with the payment status (`GET join/intents/:id`).
// Items: the four steps (key level | details | payment | done; `title` = progress label, `value` =
// heading, `body` = intro with {campaign} {start} {end} {threshold} {level} {pledge} {max}
// {rounding} {end_of_cycle} {first_name} tokens).
const STEPS = ['level', 'details', 'payment', 'done'] as const;

export function JoinWizard({ section }: { section: FormBlockData }) {
  const { fields, items } = section;
  const t = useT('site');
  const tf = useT('forms');
  const { locale, toPath } = useLocale();
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const { data: active } = useCampaigns('active');
  const hubs = useSectionEntries(usHubs, { collection: 'us_hubs' });
  const [levelParam, setLevelParam] = useSearchParamState('level');
  const [intentParam] = useSearchParamState('intent');
  const [planParam] = useSearchParamState('plan');
  const intent = useJoinIntent(intentParam);
  const start = useStartJoin();
  const [step, setStep] = useState(intentParam ? 4 : 1);
  const [plan, setPlan] = useState(() => Math.max(1, Number(planParam) || 1));

  const level = findLevel(settings, levelParam) ?? findLevel(settings, section.settings.default_key) ?? settings.levels[0];
  const quote = installmentPlan(level.amountCents, plan, settings.installmentRoundingCents);
  const money = (cents: number) => formatMoney(cents, locale);
  const campaign = active?.[0];
  const stored = submissionStorage.read('join');

  const tokens: Record<string, string> = {
    campaign: campaign?.name ?? '',
    start: campaign ? formatDate(campaign.startsOn, locale) : '',
    end: campaign ? formatDate(campaign.endsOn, locale) : '',
    threshold: money(settings.votingThresholdCents),
    level: levelName(t, level.key),
    pledge: money(level.amountCents),
    max: String(settings.maxInstallments),
    rounding: money(settings.installmentRoundingCents),
    end_of_cycle: formatMonthDay(settings.cycle.ends, locale),
    first_name: stored?.first_name ?? tf('join.friend'),
  };
  const stepItem = (key: (typeof STEPS)[number]) => items.find((item) => item.settings.key === key);
  const current = stepItem(STEPS[step - 1]);
  const intro = current?.fields.body ? fillRich(current.fields.body, tokens) : undefined;

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().refine(isName, tf('error.nameMin')),
          email: z.string().refine(isEmail, tf('error.emailFormat')),
          city: z.string(),
          hub: z.string(),
          newsletter: z.boolean(),
        })
        .refine((v) => v.city.trim().length > 0 || v.hub !== '', { path: ['city'], message: tf('error.cityOrHub') }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '', city: '', hub: '', newsletter: false });
  const { errors } = form.formState;

  const planOption = (n: number) => {
    const p = installmentPlan(level.amountCents, n, settings.installmentRoundingCents);
    if (n === 1) return { label: tf('join.plan.full'), sub: tf('join.plan.today', { amount: money(level.amountCents) }) };
    const sub =
      p.eachCents === p.lastCents
        ? tf('join.plan.equal', { n, each: money(p.eachCents) })
        : tf('join.plan.split', { n: n - 1, each: money(p.eachCents), last: money(p.lastCents) });
    return { label: tf('join.plan.installments', { n }), sub };
  };
  const schedule =
    plan === 1
      ? tf('join.schedule.full', { pledge: money(level.amountCents) })
      : tf('join.schedule.split', { n: plan - 1, each: money(quote.eachCents), last: money(quote.lastCents), end: tokens.end_of_cycle });
  const planLabel = plan === 1 ? tf('join.planLabel.full') : tf('join.planLabel.split', { n: plan });

  const checkout = () => {
    const values = form.getValues();
    submissionStorage.save('join', { first_name: values.name.trim().split(/\s+/)[0] ?? '' });
    start.mutate(
      {
        level_key: level.key,
        installments: plan,
        full_name: values.name.trim(),
        email: values.email.trim(),
        ...(values.city.trim() ? { city: values.city.trim() } : {}),
        ...(values.hub ? { us_hub_key: values.hub } : {}),
        newsletter_opt_in: values.newsletter,
        locale,
      },
      {
        onSuccess: (response) => {
          if (/^https?:/.test(response.checkout_url)) window.location.assign(response.checkout_url);
          else {
            navigate(toPath(response.checkout_url), { replace: true });
            setStep(4);
          }
        },
      },
    );
  };
  const next = () => {
    if (step === 2) void form.handleSubmit(() => setStep(3))();
    else if (step === 3) checkout();
    else setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const kicker = <p className={cx('ix_kicker', step === 4 && 'ixd_mt20')}>{tf('join.stepOf', { n: step, total: STEPS.length })}</p>;
  const heading = <h2 className="ixd_title_34 ixd_mt8">{current?.fields.value}</h2>;

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-10 m-auto">
            <Stepper label={tf('join.progress')} steps={STEPS.map((key) => stepItem(key)?.fields.title ?? key)} current={step} />
            <Card>
              {step === 1 && (
                <>
                  {kicker}
                  {heading}
                  {intro && <RichText value={intro} />}
                  <OptionGroup className="mt_30">
                    {settings.levels.map((option) => {
                      const voting = option.amountCents > settings.votingThresholdCents;
                      return (
                        <OptionButton
                          key={option.key}
                          on={option.key === level.key}
                          title={levelName(t, option.key)}
                          sub={tf('join.levelAmount', { amount: money(option.amountCents) })}
                          badge={
                            <Badge as="em" kind={voting ? 'ok' : 'info'}>
                              {voting ? tf('join.badge.voting') : tf('join.badge.member')}
                            </Badge>
                          }
                          onClick={() => setLevelParam(option.key)}
                        />
                      );
                    })}
                  </OptionGroup>
                </>
              )}
              {step === 2 && (
                <>
                  {kicker}
                  {heading}
                  <div className="row">
                    <div className="col-md-6">
                      <Field id="j_name" label={tf('join.fullName')} error={errors.name?.message}>
                        <Input type="text" autoComplete="name" {...form.register('name')} />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field id="j_email" label={tf('join.email')} error={errors.email?.message}>
                        <Input type="email" autoComplete="email" {...form.register('email')} />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field id="j_city" label={tf('join.city')}>
                        <Input
                          type="text"
                          autoComplete="address-level2"
                          className={cx(errors.city && 'ix_input_bad')}
                          aria-invalid={errors.city ? true : undefined}
                          aria-describedby={errors.city ? 'j_city-error' : undefined}
                          {...form.register('city')}
                        />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field id="j_hub" label={tf('join.hub')}>
                        <Select {...form.register('hub')}>
                          <option value="">{tf('join.hubPlaceholder')}</option>
                          {hubs.entries.map((hub) => (
                            <option key={hub.key} value={hub.key}>
                              {hub.fields.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <div className="col-12">
                      {errors.city && (
                        <span id="j_city-error" className="ix_err" role="alert">
                          {errors.city.message}
                        </span>
                      )}
                    </div>
                  </div>
                  {fields.consent_label !== undefined && <CheckField id="j_nl" label={fields.consent_label} {...form.register('newsletter')} />}
                </>
              )}
              {step === 3 && (
                <>
                  {kicker}
                  {heading}
                  {intro && <RichText value={intro} />}
                  <OptionGroup className="mt_30">
                    {Array.from({ length: settings.maxInstallments }, (_, i) => i + 1).map((n) => {
                      const option = planOption(n);
                      return <OptionButton key={n} on={n === plan} title={option.label} sub={option.sub} onClick={() => setPlan(n)} />;
                    })}
                  </OptionGroup>
                  <ResultBox kind="wait" title={tf('join.dueToday', { amount: money(quote.eachCents) })}>
                    {schedule}
                  </ResultBox>
                  {fields.secure_note !== undefined && (
                    <p className="ix_note">
                      <i className="far fa-lock" aria-hidden="true" />
                      {` ${fields.secure_note}`}
                    </p>
                  )}
                  {start.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                </>
              )}
              {step === 4 && (
                <div className="ixd_text_center">
                  <div className="ix_num ixd_num_xl">
                    <i className="far fa-hourglass-half" aria-hidden="true" />
                  </div>
                  {kicker}
                  {heading}
                  {intro && <RichText value={intro} paragraphClassName="ixd_center_text" />}
                  <KeyValueList
                    className="mt_30 ixd_text_left"
                    rows={[
                      { key: 'level', label: tf('join.kv.level'), value: tf('join.kv.levelValue', { level: tokens.level, pledge: tokens.pledge }) },
                      { key: 'plan', label: tf('join.kv.plan'), value: planLabel },
                      { key: 'paid', label: tf('join.kv.paid'), value: money(quote.eachCents) },
                      {
                        key: 'status',
                        label: tf('join.kv.status'),
                        value: <Badge kind={intent.data?.status === 'SUCCEEDED' ? 'ok' : 'warn'}>{tf('join.pending')}</Badge>,
                      },
                    ]}
                  />
                  {fields.actions && (
                    <ButtonRow className="ixd_row_center">
                      <CmsButtons links={fields.actions} />
                    </ButtonRow>
                  )}
                </div>
              )}
              {step < 4 && (
                <ButtonRow className="ixd_wizard_nav">
                  <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>
                    {tf('join.back')}
                  </Button>
                  <Button disabled={start.isPending} onClick={next}>
                    {step === 3 ? tf('join.continueWazi') : tf('join.continue')}
                  </Button>
                </ButtonRow>
              )}
            </Card>
            {fields.note && (
              <div className="ixd_text_center">
                <RichText value={fields.note} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
