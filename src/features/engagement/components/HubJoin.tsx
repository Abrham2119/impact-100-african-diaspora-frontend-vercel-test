import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Button, ButtonRow, Card, Field, Input, ResultBox, Select } from '@/components/design';
import { CmsButtons } from '@/features/content/components/CmsButton';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { CollectionState, SectionHeadingRow } from '@/features/content/components/sections/shared';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { usHubs } from '@/features/content/schemas/sectionTypes';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useT } from '@/i18n/useT';
import { isEmail, isName } from '@/lib/validation';
import { useJoinHub } from '../hooks/useEngagement';

// form_block `hub_join` — /hubs (hubs.dc.html): the five US hub cards (selected = ix_active), the
// African hubs card, and "Join the {hub} hub" → `POST engagement/hub-memberships` (mocked).
// `?hub=` preselects a hub by key or name (legacy `#hub=Atlanta`); unknown values keep the default.
const fill = (template: string | undefined, name: string) => template?.replace(/\{name\}/g, name);

export function HubJoin({ section }: { section: FormBlockData }) {
  const { fields } = section;
  const tf = useT('forms');
  const hubs = useSectionEntries(usHubs, section.settings.source ?? { collection: 'us_hubs' });
  const [param, setParam] = useSearchParamState('hub');
  const [done, setDone] = useState(false);
  const join = useJoinHub();

  const match = (value: string | null) =>
    value === null ? undefined : hubs.entries.find((hub) => hub.key === value || hub.fields.name.toLowerCase() === value.toLowerCase());
  const selected = match(param) ?? match(section.settings.default_key ?? null) ?? hubs.entries[0];
  const name = selected?.fields.name ?? '';

  const schema = useMemo(
    () => z.object({ name: z.string().refine(isName, tf('error.name')), email: z.string().refine(isEmail, tf('error.email')) }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '' });
  const { errors } = form.formState;

  const pick = (key: string) => {
    setParam(key);
    setDone(false);
    document.getElementById('join-hub')?.scrollIntoView({ behavior: 'smooth' });
  };
  const send = form.handleSubmit((values) => {
    if (!selected) return;
    join.mutate({ hub_key: selected.key, name: values.name.trim(), email: values.email.trim() }, { onSuccess: () => setDone(true) });
  });

  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <CollectionState isPending={hubs.isPending} isError={hubs.isError} isEmpty={hubs.entries.length === 0} onRetry={() => void hubs.refetch()}>
          <div className="row ix_gap mt_50">
            {hubs.entries.map((hub) => (
              <div key={hub.key} className="col-xl-4 col-md-6">
                <Card active={hub.key === selected?.key}>
                  <div className="d-flex justify-content-between ixd_gap10">
                    <span className="ix_kicker">{fields.card_kicker}</span>
                    <Badge kind={hub.data.badge_kind}>{hub.fields.status}</Badge>
                  </div>
                  <h3 className="ixd_mt10">{hub.fields.name}</h3>
                  {fields.card_body !== undefined && <p>{fields.card_body}</p>}
                  <div className="ix_card_foot">
                    <Button size="sm" onClick={() => pick(hub.key)}>
                      {fields.card_cta}
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
            {fields.side_title !== undefined && (
              <div className="col-xl-4 col-md-6">
                <Card tone="dark">
                  {fields.side_kicker !== undefined && <span className="ix_kicker">{fields.side_kicker}</span>}
                  <h3 className="ixd_mt10">{fields.side_title}</h3>
                  {fields.side_body && <RichText value={fields.side_body} />}
                  {fields.actions && (
                    <div className="ix_card_foot">
                      <CmsButtons links={fields.actions} size="sm" />
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
          <div className="row mt_50">
            <div className="col-xl-8 col-lg-10 m-auto">
              <Card id="join-hub" kicker={fields.form_kicker}>
                <h3 className="ixd_mt8">{fill(fields.form_title, name)}</h3>
                {done ? (
                  <ResultBox kind="ok" title={fill(fields.success_title, name)}>
                    {fields.success_body}
                  </ResultBox>
                ) : (
                  <form onSubmit={send} noValidate>
                    <div className="row">
                      <div className="col-md-4">
                        <Field id="h_hub" label={tf('hub.hub')}>
                          <Select
                            value={selected?.key ?? ''}
                            onChange={(event) => setParam(event.target.value)}
                            options={hubs.entries.map((hub) => ({ value: hub.key, label: hub.fields.name }))}
                          />
                        </Field>
                      </div>
                      <div className="col-md-4">
                        <Field id="h_name" label={tf('hub.name')} error={errors.name?.message}>
                          <Input type="text" autoComplete="name" {...form.register('name')} />
                        </Field>
                      </div>
                      <div className="col-md-4">
                        <Field id="h_email" label={tf('hub.email')} error={errors.email?.message}>
                          <Input type="email" autoComplete="email" {...form.register('email')} />
                        </Field>
                      </div>
                    </div>
                    {join.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                    <ButtonRow>
                      <Button type="submit" disabled={join.isPending}>
                        {fields.submit_label}
                      </Button>
                    </ButtonRow>
                    {fields.note && <RichText value={fields.note} />}
                  </form>
                )}
              </Card>
            </div>
          </div>
        </CollectionState>
      </div>
    </section>
  );
}
