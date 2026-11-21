import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Field, Input, OptionButton, OptionGroup, Panel, Select, Table, Textarea, type BadgeKind } from '@/components/design';
import type { Nomination, NominationStatus, NominationType } from '@/domain/entities/governance.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useNominations, useSubmitNomination } from '@/features/governance/hooks/usePortalGovernance';
import { useMyProfile } from '@/features/profile/hooks/useMyProfile';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useT } from '@/i18n/useT';
import { PortalState } from './PortalState';

// Suggest and nominate (portal_suggest.dc.html): pick Priority / Nominee / Proposal (the title label
// and fields follow the type; the country is pre-filled from your interests), title + ≥ 20-character
// description, at most 10 per cycle; "Your suggestions" lists only your own.
const TYPES: NominationType[] = ['PRIORITY', 'NOMINEE', 'PROPOSAL'];
const STATUS_BADGE: Record<NominationStatus, BadgeKind> = { SUBMITTED: 'info', IN_REVIEW: 'warn', ACCEPTED: 'ok', DECLINED: 'bad' };
const MIN_DESCRIPTION = 20;
const MAX_DESCRIPTION = 3000;

export function SuggestPage() {
  const t = useT('portal');
  const catalog = useCatalog();
  const query = useNominations();
  const { data: profile } = useMyProfile();
  const submit = useSubmitNomination();
  const [type, setType] = useState<NominationType>('PROPOSAL');
  const mine = query.data?.mine ?? [];
  const limit = query.data?.limit ?? 0;
  const left = Math.max(0, limit - mine.length);

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().refine((v) => v.trim() !== '', t('suggest.titleError')),
        country: z.string(),
        contact: z.string(),
        description: z.string().refine((v) => v.trim().length >= MIN_DESCRIPTION, t('suggest.descriptionError')),
      }),
    [t],
  );
  const form = useDesignForm(schema, { title: '', country: '', contact: '', description: '' });
  const errors = form.formState.errors;
  const countryOptions = catalog.featuredCountryKeys.map((key) => ({ value: key, label: catalog.country(key) }));
  // the member's African hub when it is one of the featured countries (only once the profile is in)
  const defaultCountry = !profile
    ? ''
    : profile.africanHubKey && catalog.featuredCountryKeys.includes(profile.africanHubKey)
      ? profile.africanHubKey
      : (catalog.featuredCountryKeys[0] ?? '');

  // pre-fill the country from the member's interests once the catalog and profile are in
  useEffect(() => {
    if (defaultCountry && !form.getValues('country')) form.setValue('country', defaultCountry);
  }, [defaultCountry, form]);

  const send = form.handleSubmit(({ title, country, contact, description }) =>
    submit
      .mutateAsync({
        type,
        title,
        countryKey: type === 'PRIORITY' ? null : country || defaultCountry,
        description,
        ...(type === 'NOMINEE' && contact.trim() ? { contact: contact.trim() } : {}),
      })
      .then(() => form.reset({ title: '', country, contact: '', description: '' })),
  );

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <Panel title={t('suggest.title')} lead={t('suggest.lead')}>
        <OptionGroup>
          {TYPES.map((key) => (
            <OptionButton key={key} on={type === key} title={t(`suggest.type.${key}`)} sub={t(`suggest.type.${key}.sub`)} onClick={() => setType(key)} />
          ))}
        </OptionGroup>
        <form onSubmit={(e) => void send(e)} noValidate>
          <div className="row">
            <div className="col-md-8">
              <Field id="sg_t" label={t(`suggest.titleLabel.${type}`)} error={errors.title?.message}>
                <Input type="text" {...form.register('title')} />
              </Field>
            </div>
            {type !== 'PRIORITY' && (
              <div className="col-md-4">
                <Field id="sg_c" label={t('suggest.country')} help={t('suggest.countryHelp')}>
                  <Select options={countryOptions} {...form.register('country')} />
                </Field>
              </div>
            )}
            {type === 'NOMINEE' && (
              <div className="col-12">
                <Field id="sg_ct" label={t('suggest.contact')}>
                  <Input type="text" placeholder={t('suggest.contactPlaceholder')} {...form.register('contact')} />
                </Field>
              </div>
            )}
            <div className="col-12">
              <Field id="sg_d" label={t('suggest.description')} error={errors.description?.message}>
                <Textarea rows={4} maxLength={MAX_DESCRIPTION} placeholder={t('suggest.descriptionPlaceholder')} {...form.register('description')} />
              </Field>
            </div>
          </div>
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={submit.isPending || left === 0}>
              {t('suggest.submit')}
            </button>
            <span className="ix_note">{left === 0 ? t('suggest.limitReached') : t('suggest.left', { left, limit })}</span>
          </div>
        </form>
      </Panel>
      <Panel title={t('suggest.mine')} lead={t('suggest.mineLead')}>
        <Table<Nomination>
          rows={mine}
          rowKey={(row) => row.id}
          empty={t('suggest.empty')}
          columns={[
            { key: 'type', header: t('suggest.colType'), cell: (row) => t(`suggest.type.${row.type}`) },
            { key: 'title', header: t('suggest.colTitle'), cell: (row) => row.title },
            { key: 'country', header: t('suggest.colCountry'), cell: (row) => catalog.country(row.countryKey) || t('history.none') },
            { key: 'status', header: t('suggest.colStatus'), cell: (row) => <Badge kind={STATUS_BADGE[row.status]}>{t(`suggest.status.${row.status}`)}</Badge> },
            { key: 'note', header: t('suggest.colNote'), cell: (row) => row.reviewerNote ?? t('history.none') },
          ]}
        />
      </Panel>
    </PortalState>
  );
}
