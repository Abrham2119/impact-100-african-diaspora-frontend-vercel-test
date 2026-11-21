import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Field, Input, Panel, QueryState, ResultBox, Table, Textarea, type BadgeKind, type TableColumn } from '@/components/design';
import type { AdminCampaign, CampaignStatus } from '@/domain/entities/admin.types';
import { AdminError, CAMPAIGN_GOAL_CENTS, campaignEndFor } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatCount, formatDate, formatMoney } from '@/lib/format';
import { NEXT_CAMPAIGN_NAME } from '../fixtures/campaigns';
import { useAdminCampaigns, useCreateCampaign } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';

// Campaigns (admin_cycles.dc.html): one active campaign at a time, six months each, the goal
// always the $100,000 maximum; an ended campaign moves to history by itself. "Set up a campaign"
// plans the next one (its end date follows the start; it can't start before the active one ends).
const STATUS_BADGE: Record<CampaignStatus, BadgeKind> = { ACTIVE: 'ok', HISTORY: 'neutral', PLANNED: 'info' };

export function CampaignsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useAdminCampaigns();
  const money = (cents: number) => formatMoney(cents, locale);
  const columns: Array<TableColumn<AdminCampaign>> = [
    { key: 'name', header: t('campaigns.campaign'), cell: (c) => c.name, sortValue: (c) => c.name },
    { key: 'starts', header: t('campaigns.starts'), cell: (c) => formatDate(c.startsOn, locale), sortValue: (c) => c.startsOn },
    { key: 'ends', header: t('campaigns.ends'), cell: (c) => formatDate(c.endsOn, locale), sortValue: (c) => c.endsOn },
    { key: 'goal', header: t('campaigns.goal'), cell: (c) => money(c.goalCents) },
    { key: 'raised', header: t('campaigns.raised'), cell: (c) => money(c.raisedCents), sortValue: (c) => c.raisedCents },
    { key: 'grants', header: t('campaigns.grants'), cell: (c) => c.grants, sortValue: (c) => c.grants },
    { key: 'status', header: t('campaigns.status'), cell: (c) => <Badge kind={STATUS_BADGE[c.status]}>{t(`campaigns.status.${c.status}`)}</Badge>, sortValue: (c) => c.status },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <>
      <Panel
        title={t('campaigns.title')}
        lead={t('campaigns.lead', { goal: money(CAMPAIGN_GOAL_CENTS) })}
        right={
          <Can require="campaigns:create">
            <div className="ix_toolbar">
              <button type="button" className="common_btn ix_btn_sm" onClick={() => document.getElementById('cp_n')?.focus()}>
                {t('campaigns.new')}
              </button>
            </div>
          </Can>
        }
      >
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<AdminCampaign> rows={list.rows} rowKey={(c) => c.slug} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
          <AdminPager page={list.page} totalPages={list.totalPages} />
        </QueryState>
      </Panel>
      <SetUpCampaign />
    </>
  );
}

function SetUpCampaign() {
  const t = useT('admin');
  const { locale } = useLocale();
  const create = useCreateCampaign();
  const [saved, setSaved] = useState<AdminCampaign | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().refine((v) => v.trim().length >= 2, t('campaigns.nameRequired')),
        startsOn: z.string().refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), t('campaigns.startRequired')),
        grantsNote: z.string(),
      }),
    [t],
  );
  const form = useDesignForm(schema, { name: NEXT_CAMPAIGN_NAME, startsOn: '', grantsNote: '' });
  const errors = form.formState.errors;
  const startsOn = form.watch('startsOn');
  const endsOn = /^\d{4}-\d{2}-\d{2}$/.test(startsOn) ? campaignEndFor(startsOn) : '';
  const submit = form.handleSubmit((values) => {
    setFailed(null);
    setSaved(null);
    return create
      .mutateAsync(values)
      .then(setSaved)
      .catch((e: unknown) => setFailed(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic')));
  });

  return (
    <Panel title={t('campaigns.setup')} lead={t('campaigns.setupLead')}>
      <form onSubmit={(e) => void submit(e)} noValidate>
        <div className="row">
          <div className="col-md-6">
            <Field id="cp_n" label={t('campaigns.name')} error={errors.name?.message}>
              <Input type="text" {...form.register('name')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="cp_g" label={t('campaigns.goalLabel')} help={t('campaigns.goalHelp', { goal: formatMoney(CAMPAIGN_GOAL_CENTS, locale) })}>
              <Input type="text" value={formatCount(CAMPAIGN_GOAL_CENTS / 100, locale)} readOnly />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="cp_s" label={t('campaigns.start')} error={errors.startsOn?.message ?? failed ?? undefined}>
              <Input type="date" {...form.register('startsOn')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="cp_e" label={t('campaigns.end')} help={t('campaigns.endHelp')}>
              {/* the end always follows the start (six months); not `readOnly`, which would hide the
                  date picker icon the design shows */}
              <Input type="date" value={endsOn} aria-readonly="true" onChange={() => undefined} />
            </Field>
          </div>
          <div className="col-12">
            <Field id="cp_gr" label={t('campaigns.grantsLabel')}>
              <Textarea rows={5} placeholder={t('campaigns.grantsPlaceholder')} {...form.register('grantsNote')} />
            </Field>
          </div>
        </div>
        <Can require="campaigns:create">
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={create.isPending}>
              {t('campaigns.save')}
            </button>
          </div>
        </Can>
        {saved && (
          <ResultBox kind="ok" title={t('campaigns.saved')}>
            {t('campaigns.savedBody', { name: saved.name, date: formatDate(saved.startsOn, locale) })}
          </ResultBox>
        )}
        <p className="ix_note">{t('campaigns.note')}</p>
      </form>
    </Panel>
  );
}
