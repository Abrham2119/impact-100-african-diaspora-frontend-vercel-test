import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Field, Input, Panel, QueryState, ResultBox } from '@/components/design';
import type { CharterValues } from '@/domain/entities/admin.types';
import { AdminError } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import { useCharterSettings, useProposeSettings } from '../hooks/useAdmin';

// Charter settings (admin_settings.dc.html): every number is a versioned setting. Submitting
// proposes a change from an effective date; it applies only once another admin approves it.
type Field = Exclude<keyof CharterValues, 'nonGrantQuorumPct'>;
const FIELDS: Field[] = ['initiatorCents', 'incubatorCents', 'innovatorCents', 'investorCents', 'minimumCents', 'votingThresholdCents', 'maxInstallments', 'roundingCents', 'quorumPct', 'circulationDays'];
const isMoney = (f: Field) => f.endsWith('Cents');
/** "$1,000" → 100000 (cents); "50%" → 50; "6" → 6; NaN when it isn't a number */
const parse = (f: Field, text: string) => {
  const n = Number(text.replace(/[^0-9.]/g, ''));
  return text.trim() === '' || Number.isNaN(n) ? Number.NaN : isMoney(f) ? Math.round(n * 100) : n;
};

export function SettingsPage() {
  const t = useT('admin');
  const query = useCharterSettings();
  return (
    <>
      <ResultBox kind="wait" title={t('settings.secondTitle')} className="ixd_mt0">
        {t('settings.secondBody')}
      </ResultBox>
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        {query.data && <SettingsForm key={query.data.version.id} version={query.data.version.version ?? ''} values={query.data.values} />}
      </QueryState>
    </>
  );
}

function SettingsForm({ version, values }: { version: string; values: CharterValues }) {
  const t = useT('admin');
  const { locale } = useLocale();
  const propose = useProposeSettings();
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const show = (f: Field) => (isMoney(f) ? formatMoney(values[f], locale) : f === 'quorumPct' ? `${values[f]}%` : String(values[f]));
  const defaults = Object.fromEntries([...FIELDS.map((f) => [f, show(f)]), ['effectiveFrom', '']]) as Record<Field | 'effectiveFrom', string>;

  const schema = useMemo(() => {
    const number = z.string().refine((v) => v.trim() !== '' && !Number.isNaN(Number(v.replace(/[^0-9.]/g, ''))), t('settings.invalidNumber'));
    return z.object({
      ...(Object.fromEntries(FIELDS.map((f) => [f, number])) as Record<Field, typeof number>),
      effectiveFrom: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), t('settings.effectiveRequired')),
    });
  }, [t]);
  const form = useDesignForm(schema, defaults);
  const errors = form.formState.errors;
  const submit = form.handleSubmit((input) => {
    setSent(false);
    setFailed(null);
    const next = { ...values, ...Object.fromEntries(FIELDS.map((f) => [f, parse(f, input[f])])) } as CharterValues;
    return propose
      .mutateAsync({ values: next, effectiveFrom: input.effectiveFrom })
      .then(() => {
        setSent(true);
        form.reset(defaults);
      })
      .catch((e: unknown) => setFailed(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic')));
  });

  return (
    <Panel title={t('settings.title', { version })} lead={t('settings.lead')}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="row">
          {FIELDS.map((f, i) => (
            <div key={f} className="col-md-6">
              <Field id={`st${i}`} label={t(`settings.field.${f}`)} error={errors[f]?.message}>
                <Input type="text" inputMode={f === 'maxInstallments' || f === 'circulationDays' ? 'numeric' : undefined} {...form.register(f)} />
              </Field>
            </div>
          ))}
          <div className="col-md-6">
            <Field id="st_eff" label={t('settings.effective')} error={errors.effectiveFrom?.message}>
              <Input type="date" {...form.register('effectiveFrom')} />
            </Field>
          </div>
        </div>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <Can require="charter_settings:create">
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={propose.isPending}>
              {t('settings.submit')}
            </button>
          </div>
        </Can>
        {sent && (
          <ResultBox kind="ok" title={t('settings.sent')}>
            {t('settings.sentBody')}
          </ResultBox>
        )}
      </form>
    </Panel>
  );
}
