import { useId, useMemo, useState } from 'react';
import { z } from 'zod';
import { Field, Input, Panel, ResultBox, Select, Textarea } from '@/components/design';
import { AdminError } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import { peopleRepository } from '../api/peopleRepository';
import { usePeople, useRecordOffline } from '../hooks/useAdmin';

// Record an offline payment (admin_offline.dc.html): a cheque or bank transfer for a member's
// pledge, inside a campaign cycle, with a reason. It counts toward level and voting like an online
// payment (portal, People, totals update), is recorded with your name and audited.
const amountCents = (text: string) => {
  const n = Number(text.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : Number.NaN;
};

export function OfflinePaymentPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const listId = useId();
  const { data: people } = usePeople();
  const record = useRecordOffline();
  const [saved, setSaved] = useState<{ name: string; received: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const match = (text: string) => {
    const needle = text.trim().toLowerCase();
    return (people ?? []).find((p) => needle !== '' && (p.email.toLowerCase() === needle || p.fullName.toLowerCase() === needle || `${p.fullName} · ${p.email}`.toLowerCase() === needle));
  };

  const schema = useMemo(
    () =>
      z.object({
        member: z.string().refine((v) => match(v) !== undefined, t('offline.memberRequired')),
        amount: z.string().refine((v) => !Number.isNaN(amountCents(v)), t('offline.amountInvalid')),
        method: z.enum(['CHEQUE', 'TRANSFER']),
        date: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), t('offline.dateRequired')),
        reason: z.string().refine((v) => v.trim().length >= 5, t('offline.reasonRequired')),
      }),
    // the member list is read when validating
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, people],
  );
  const form = useDesignForm(schema, { member: '', amount: '', method: 'CHEQUE' as const, date: '', reason: '' });
  const errors = form.formState.errors;
  const submit = form.handleSubmit(({ member, amount, method, date, reason }) => {
    const person = match(member);
    if (!person) return undefined;
    setSaved(null);
    setFailed(null);
    return record
      .mutateAsync({ personId: person.id, amountCents: amountCents(amount), method, date, reason })
      .then(() => peopleRepository.person(person.id))
      .then((detail) => {
        setSaved({ name: person.fullName, received: detail?.receivedCents ?? 0 });
        form.reset();
      })
      .catch((e: unknown) => setFailed(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic')));
  });

  return (
    <Panel title={t('offline.title')} lead={t('offline.lead')}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="row">
          <div className="col-md-6">
            <Field id="op_m" label={t('offline.member')} error={errors.member?.message}>
              <Input type="text" placeholder={t('offline.memberPlaceholder')} list={listId} autoComplete="off" {...form.register('member')} />
            </Field>
            <datalist id={listId}>
              {(people ?? []).map((p) => (
                <option key={p.id} value={`${p.fullName} · ${p.email}`} />
              ))}
            </datalist>
          </div>
          <div className="col-md-6">
            <Field id="op_a" label={t('offline.amount')} error={errors.amount?.message}>
              <Input type="text" inputMode="decimal" placeholder={t('offline.amountPlaceholder')} {...form.register('amount')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="op_meth" label={t('offline.method')}>
              <Select
                options={[
                  { value: 'CHEQUE', label: t('offline.method.CHEQUE') },
                  { value: 'TRANSFER', label: t('offline.method.TRANSFER') },
                ]}
                {...form.register('method')}
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="op_d" label={t('offline.date')} help={t('offline.dateHelp')} error={errors.date?.message}>
              <Input type="date" {...form.register('date')} />
            </Field>
          </div>
          <div className="col-12">
            <Field id="op_r" label={t('offline.reason')} error={errors.reason?.message ?? failed ?? undefined}>
              <Textarea rows={5} placeholder={t('offline.reasonPlaceholder')} {...form.register('reason')} />
            </Field>
          </div>
        </div>
        <Can require="payments:create">
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={record.isPending}>
              {t('offline.submit')}
            </button>
          </div>
        </Can>
        {saved && (
          <ResultBox kind="ok" title={t('offline.saved')}>
            {t('offline.savedBody', { name: saved.name, received: formatMoney(saved.received, locale) })}
          </ResultBox>
        )}
        <p className="ix_note">{t('offline.note')}</p>
      </form>
    </Panel>
  );
}
