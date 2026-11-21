import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Button, ButtonRow, CommitteeCard, Field, Input, ResultBox, Textarea } from '@/components/design';
import { useSubmitCommitteeInterest } from '@/features/engagement/hooks/useEngagement';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useT } from '@/i18n/useT';
import { isEmail, isName } from '@/lib/validation';
import type { EntryData, SectionData } from '../../schemas/defineSection';
import { committees, type committeeGrid } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { RichText } from '../RichText';
import { CollectionState, SectionHeadingRow } from './shared';

// committee_grid — /about/committees (committees.dc.html): one card per committee; "i'd like to
// help" opens that card's interest form (one open at a time, the first by default). `?c=` deep-links
// a committee by key (the design's legacy `#c=<index>` is accepted too). Sending shows the design's
// "Sent" result. The note goes to `POST engagement/committee-interests` (mocked until Step 13).
type Committee = EntryData<typeof committees>;

function InterestForm({ committee, onSent }: { committee: Committee; onSent: () => void }) {
  const t = useT('site');
  const tf = useT('forms');
  const id = (field: string) => `cm_${committee.key}_${field}`;
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().refine(isName, tf('error.name')),
        email: z.string().refine(isEmail, tf('error.email')),
        note: z.string(),
      }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '', note: '' });
  const submit = useSubmitCommitteeInterest();
  const { errors } = form.formState;
  const send = form.handleSubmit((values) =>
    submit.mutate({ committee_key: committee.key, ...values, name: values.name.trim(), email: values.email.trim() }, { onSuccess: onSent }),
  );
  return (
    <form onSubmit={send} noValidate>
      <Field id={id('n')} label={t('committee.name')} error={errors.name?.message}>
        <Input type="text" autoComplete="name" {...form.register('name')} />
      </Field>
      <Field id={id('e')} label={t('committee.email')} error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register('email')} />
      </Field>
      <Field id={id('t')} label={t('committee.note')}>
        <Textarea rows={3} placeholder={t('committee.notePlaceholder')} {...form.register('note')} />
      </Field>
      {submit.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
      <ButtonRow>
        <Button type="submit" size="sm" disabled={submit.isPending}>
          {t('committee.send')}
        </Button>
      </ButtonRow>
    </form>
  );
}

export function CommitteeGridSection({ section }: { section: SectionData<typeof committeeGrid> }) {
  const t = useT('site');
  const { entries, isPending, isError, refetch } = useSectionEntries(committees, section.settings.source);
  const [param, setParam] = useSearchParamState('c');
  const [sent, setSent] = useState<string[]>([]);
  const { kicker, title, lead } = section.fields;

  const byIndex = param !== null && /^\d+$/.test(param) ? entries[Number(param)]?.key : undefined;
  const openKey = byIndex ?? (entries.some((entry) => entry.key === param) ? param : entries[0]?.key);

  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} width="wide" />
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <div className="row ix_gap mt_50">
            {entries.map((entry) => {
              const open = entry.key === openKey;
              const done = sent.includes(entry.key);
              return (
                <div key={entry.key} className="col-xl-4 col-md-6">
                  <CommitteeCard name={entry.fields.name} seats={entry.fields.seats} active={open} duties={<RichText value={entry.fields.duties} />}>
                    {!open && (
                      <div className="ix_card_foot">
                        <Button size="sm" onClick={() => setParam(entry.key)}>
                          {t('committee.help')}
                        </Button>
                      </div>
                    )}
                    {open && !done && <InterestForm committee={entry} onSent={() => setSent((keys) => [...keys, entry.key])} />}
                    {open && done && (
                      <ResultBox kind="ok" title={t('committee.sentTitle')}>
                        {t('committee.sentBody', { name: entry.fields.name })}
                      </ResultBox>
                    )}
                  </CommitteeCard>
                </div>
              );
            })}
          </div>
        </CollectionState>
      </div>
    </section>
  );
}
