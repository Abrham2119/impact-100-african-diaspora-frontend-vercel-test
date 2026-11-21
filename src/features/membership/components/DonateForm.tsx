import { useMemo, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button, ButtonRow, Card, CheckField, Chip, ChipGroup, Field, Input, OptionButton, OptionGroup, ResultBox, Select } from '@/components/design';
import { CmsButton } from '@/features/content/components/CmsButton';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { countries, portfolios } from '@/features/content/schemas/sectionTypes';
import type { DonationFrequency } from '@/domain/entities/membership.types';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { submissionStorage } from '@/infrastructure/storage/submission.storage';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { formatMoney } from '@/lib/format';
import { isEmail, isName } from '@/lib/validation';
import { useStartDonation } from '../hooks/useMembership';

// form_block `donate` — /donate (donate.dc.html): Direct donor. Frequency, preset or custom amount
// (`?amount=` from the home donate block), one of the 4 USAFI portfolios (`?area=` key, or the
// design's legacy p1–p4), any Sub-Saharan country (C:countries), name + email, newsletter consent.
// "continue to secure payment" → `POST membership/donations` (mocked) → checkout → /donate/thanks.
// Side cards = items: key `vote` (button) and `cancel` (text link).
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

export function DonateForm({ section }: { section: FormBlockData }) {
  const { fields, items, settings } = section;
  const tf = useT('forms');
  const { locale, toPath } = useLocale();
  const navigate = useNavigate();
  const pf = useSectionEntries(portfolios, { collection: 'portfolios' });
  const ct = useSectionEntries(countries, { collection: 'countries' });
  const [amountParam] = useSearchParamState('amount');
  const [areaParam] = useSearchParamState('area');
  const donation = useStartDonation();
  const presets = settings.amounts ?? [];

  const initialAmount = Number(amountParam);
  const fromUrl = Number.isFinite(initialAmount) && initialAmount > 0 ? initialAmount : null;
  const legacyArea = /^p(\d)$/.exec(areaParam ?? '');
  const initialFund =
    (legacyArea ? pf.entries[Number(legacyArea[1]) - 1]?.key : pf.entries.find((p) => p.key === areaParam)?.key) ?? pf.entries[0]?.key ?? '';

  const schema = useMemo(
    () =>
      z
        .object({
          frequency: z.enum(['once', 'monthly']),
          preset: z.number().nullable(),
          custom: z.string(),
          fund: z.string(),
          country: z.string(),
          name: z.string(),
          email: z.string(),
          newsletter: z.boolean(),
        })
        .superRefine((v, ctx) => {
          const amount = v.preset ?? Number.parseFloat(v.custom || '0');
          if (!(amount > 0)) ctx.addIssue({ code: 'custom', path: ['custom'], message: tf('error.amount') });
          if (!isName(v.name) || !isEmail(v.email)) ctx.addIssue({ code: 'custom', path: ['name'], message: tf('error.donor') });
        }),
    [tf],
  );
  const form = useDesignForm(schema, {
    frequency: 'once' as DonationFrequency,
    preset: fromUrl === null ? (settings.default_amount ?? null) : presets.includes(fromUrl) ? fromUrl : null,
    custom: fromUrl !== null && !presets.includes(fromUrl) ? String(fromUrl) : '',
    fund: initialFund,
    country: settings.default_key ?? '',
    name: '',
    email: '',
    newsletter: false,
  });
  const { errors, isSubmitted } = form.formState;
  const values = form.watch();
  const opts = { shouldValidate: isSubmitted };
  const setFrequency = (value: DonationFrequency) => form.setValue('frequency', value, opts);
  const setPreset = (value: number | null) => form.setValue('preset', value, opts);
  const setCustom = (value: string) => form.setValue('custom', value, opts);
  const setFund = (value: string) => form.setValue('fund', value, opts);
  const setCountry = (value: string) => form.setValue('country', value, opts);

  const amount = values.preset ?? Number.parseFloat(values.custom || '0');
  const fund = pf.entries.find((p) => p.key === (values.fund || initialFund));
  const country = ct.entries.find((c) => c.key === values.country);
  const monthly = values.frequency === 'monthly';
  const amountLabel = amount > 0 ? formatMoney(Math.round(amount * 100), locale) : formatMoney(0, locale);

  const pickPreset = (value: number) => {
    setPreset(value);
    setCustom('');
  };
  const onPresetKey = (event: KeyboardEvent<HTMLLIElement>, value: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pickPreset(value);
    }
  };

  const send = form.handleSubmit((v) => {
    const cents = Math.round((v.preset ?? Number.parseFloat(v.custom)) * 100);
    donation.mutate(
      {
        frequency: v.frequency === 'monthly' ? 'MONTHLY' : 'ONE_TIME',
        amount_cents: cents,
        portfolio_key: v.fund || initialFund,
        country_key: v.country,
        donor_name: v.name.trim(),
        donor_email: v.email.trim(),
        newsletter_opt_in: v.newsletter,
        locale,
      },
      {
        onSuccess: (response) => {
          submissionStorage.save('donate', {
            amount: formatMoney(cents, locale),
            frequency: tf(v.frequency === 'monthly' ? 'donate.frequencyMonthly' : 'donate.frequencyOnce'),
            portfolio: fund?.fields.name ?? '',
            country: country?.fields.name ?? '',
          });
          if (/^https?:/.test(response.checkout_url)) window.location.assign(response.checkout_url);
          else navigate(toPath(response.checkout_url));
        },
      },
    );
  });

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row ix_gap">
          <div className="col-lg-7">
            <Card kicker={fields.kicker}>
              {fields.title !== undefined && <h2 className="ixd_title_36 ixd_mt8">{fields.title}</h2>}
              {fields.body && <RichText value={fields.body} />}
              <form onSubmit={send} noValidate>
                <div className="contact_input">
                  <label id="d_freq_label">{tf('donate.frequency')}</label>
                  <ChipGroup>
                    <Chip on={!monthly} onClick={() => setFrequency('once')}>
                      {tf('donate.once')}
                    </Chip>
                    <Chip on={monthly} onClick={() => setFrequency('monthly')}>
                      {tf('donate.monthly')}
                    </Chip>
                  </ChipGroup>
                </div>
                <div className="contact_input">
                  <label id="d_amount_label">{tf('donate.amount')}</label>
                  <div className="video_donation_box">
                    <ul aria-labelledby="d_amount_label">
                      {presets.map((preset) => (
                        <li
                          key={preset}
                          className={cx(values.preset === preset && 'active')}
                          role="button"
                          tabIndex={0}
                          aria-pressed={values.preset === preset}
                          onClick={() => pickPreset(preset)}
                          onKeyDown={(event) => onPresetKey(event, preset)}
                        >
                          {formatMoney(preset * 100, locale)}
                        </li>
                      ))}
                    </ul>
                    <div className="input_box">
                      <label htmlFor="d_amt" className="ix_sr">
                        {tf('donate.customLabel')}
                      </label>
                      <input
                        id="d_amt"
                        type="text"
                        inputMode="decimal"
                        placeholder={tf('donate.customPlaceholder')}
                        value={values.custom}
                        aria-invalid={errors.custom ? true : undefined}
                        aria-describedby={errors.custom ? 'd_amt-error' : undefined}
                        onChange={(event) => {
                          setCustom(event.target.value.replace(/[^0-9.]/g, ''));
                          setPreset(null);
                        }}
                      />
                      <span>$</span>
                    </div>
                  </div>
                  {errors.custom && (
                    <span id="d_amt-error" className="ix_err" role="alert">
                      {errors.custom.message}
                    </span>
                  )}
                </div>
                <div className="contact_input">
                  <label id="d_area_label">{tf('donate.area')}</label>
                  <OptionGroup>
                    {pf.entries.map((option) => (
                      <OptionButton
                        key={option.key}
                        on={option.key === fund?.key}
                        title={option.fields.name}
                        sub={tf('donate.flagship', { name: option.fields.flagship })}
                        onClick={() => setFund(option.key)}
                      />
                    ))}
                  </OptionGroup>
                </div>
                <Field id="d_country" label={tf('donate.country')}>
                  <Select value={values.country} onChange={(event) => setCountry(event.target.value)}>
                    {ct.entries.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.fields.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="row">
                  <div className="col-md-6">
                    <Field id="d_name" label={tf('donate.name')}>
                      <Input type="text" autoComplete="name" placeholder="" aria-describedby={errors.name ? 'd_contact-error' : undefined} {...form.register('name')} />
                    </Field>
                  </div>
                  <div className="col-md-6">
                    <Field id="d_email" label={tf('donate.email')}>
                      <Input type="email" autoComplete="email" placeholder="" aria-describedby={errors.name ? 'd_contact-error' : undefined} {...form.register('email')} />
                    </Field>
                  </div>
                </div>
                {errors.name && (
                  <span id="d_contact-error" className="ix_err" role="alert">
                    {errors.name.message}
                  </span>
                )}
                {fields.consent_label !== undefined && <CheckField id="d_nl" label={fields.consent_label} {...form.register('newsletter')} />}
                {fields.note && <RichText value={fields.note} />}
                {donation.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                <ButtonRow>
                  <Button type="submit" disabled={donation.isPending}>
                    {fields.submit_label}
                  </Button>
                </ButtonRow>
                {fields.secure_note !== undefined && (
                  <p className="ix_note">
                    <i className="far fa-lock" aria-hidden="true" />
                    {` ${fields.secure_note}`}
                  </p>
                )}
              </form>
            </Card>
          </div>
          <div className="col-lg-5">
            <Card tone="dark" className="ixd_h_auto" kicker={tf('donate.summaryKicker')}>
              <h2 className="ixd_title_46">{monthly ? tf('donate.perMonth', { amount: amountLabel }) : amountLabel}</h2>
              {fields.summary !== undefined && (
                <p>
                  {fill(fields.summary, {
                    frequency: tf(monthly ? 'donate.monthlyGift' : 'donate.onceGift'),
                    portfolio: fund?.fields.name ?? '',
                    country: country?.fields.name ?? '',
                  })}
                </p>
              )}
            </Card>
            {items.map((item) => (
              <Card
                key={item.id}
                className="mt_30 ixd_h_auto"
                footer={
                  item.fields.link ? (
                    item.settings.key === 'cancel' ? (
                      <Link className="ix_link" to={toPath(item.fields.link.href)}>
                        {item.fields.link.label}
                      </Link>
                    ) : (
                      <CmsButton link={item.fields.link} size="sm" />
                    )
                  ) : undefined
                }
              >
                {item.fields.title !== undefined && <h4>{item.fields.title}</h4>}
                {item.fields.body && <RichText value={item.fields.body} />}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
