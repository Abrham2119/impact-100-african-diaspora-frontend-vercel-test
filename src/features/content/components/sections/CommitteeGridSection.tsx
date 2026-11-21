import { useState, type FormEvent } from 'react';
import { Button, ButtonRow, CommitteeCard, Field, Input, ResultBox, Textarea } from '@/components/design';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useT } from '@/i18n/useT';
import type { EntryData, SectionData } from '../../schemas/defineSection';
import { committees, type committeeGrid } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { RichText } from '../RichText';
import { CollectionState, SectionHeadingRow } from './shared';

// committee_grid — /about/committees (committees.dc.html): one card per committee; "i'd like to
// help" opens that card's interest form (one open at a time, the first by default). `?c=` deep-links
// a committee by key (the design's legacy `#c=<index>` is accepted too). Sending shows the design's
// "Sent" result; the request to the committee inbox is wired in Step 13 (engagement API).
type Committee = EntryData<typeof committees>;

function InterestForm({ committee, onSent }: { committee: Committee; onSent: () => void }) {
  const t = useT('site');
  const id = (field: string) => `cm_${committee.key}_${field}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSent();
  };
  return (
    <form onSubmit={submit}>
      <Field id={id('n')} label={t('committee.name')}>
        <Input type="text" name="name" autoComplete="name" />
      </Field>
      <Field id={id('e')} label={t('committee.email')}>
        <Input type="email" name="email" autoComplete="email" />
      </Field>
      <Field id={id('t')} label={t('committee.note')}>
        <Textarea name="note" rows={3} placeholder={t('committee.notePlaceholder')} />
      </Field>
      <ButtonRow>
        <Button type="submit" size="sm">
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
