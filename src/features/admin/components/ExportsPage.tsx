import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Field, Input, Panel, QueryState, Select, Table } from '@/components/design';
import type { ExportDataset, ExportRecord } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadCsv } from '@/lib/download';
import { formatStamp } from '@/lib/format';
import { exportsRepository } from '../api/exportsRepository';
import { useAdminCampaigns, useCreateExport, useExports } from '../hooks/useAdmin';
import { AdminPager } from './AdminPager';
import { cycleOf } from './cycle';
import { useAdminList } from '../hooks/useAdminList';

// Exports (admin_exports.dc.html): a CSV of members, payments, donations, sign-ups or results for a
// cycle or date range (downloaded straight away and logged), and the recent exports.
const DATASETS: ExportDataset[] = ['MEMBERS', 'PAYMENTS', 'DONATIONS', 'SIGNUPS', 'RESULTS'];

export function ExportsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useExports();
  const { data: campaigns } = useAdminCampaigns();
  const create = useCreateExport();
  const [datasetParam] = useSearchParamState('dataset');
  const [downloadError, setDownloadError] = useState(false);
  const cycles = (campaigns ?? []).filter((c) => c.status !== 'PLANNED');
  const current = cycles.find((c) => c.status === 'ACTIVE');

  const schema = useMemo(
    () =>
      z
        .object({ dataset: z.string(), cycle: z.string(), from: z.string(), to: z.string() })
        .refine((v) => !v.from || !v.to || v.from <= v.to, { message: t('exports.datesInvalid'), path: ['to'] }),
    [t],
  );
  const initialDataset = DATASETS.includes(datasetParam as ExportDataset) ? (datasetParam as ExportDataset) : 'MEMBERS';
  const form = useDesignForm(schema, { dataset: initialDataset, cycle: '', from: '', to: '' });
  const submit = form.handleSubmit(({ dataset, cycle, from, to }) => {
    const campaign = cycles.find((c) => c.slug === (cycle || current?.slug));
    return create
      .mutateAsync({ dataset: dataset as ExportDataset, from: from || campaign?.startsOn || null, to: to || campaign?.endsOn || null })
      .then((record) => record.csv && downloadCsv(`${record.dataset.toLowerCase()}-${record.createdAt.slice(0, 10)}.csv`, record.csv));
  });
  const download = (record: ExportRecord) => {
    setDownloadError(false);
    exportsRepository
      .download(record.id)
      .then((csv) => downloadCsv(`${record.dataset.toLowerCase()}-${record.createdAt.slice(0, 10)}.csv`, csv))
      .catch(() => setDownloadError(true));
  };

  const columns = [
    { key: 'dataset', header: t('exports.dataset'), cell: (row: ExportRecord) => t(`exports.dataset.${row.dataset}`), sortValue: (row: ExportRecord) => row.dataset },
    { key: 'by', header: t('exports.requestedBy'), cell: (row: ExportRecord) => row.requestedBy, sortValue: (row: ExportRecord) => row.requestedBy },
    { key: 'rows', header: t('exports.rows'), cell: (row: ExportRecord) => row.rows, sortValue: (row: ExportRecord) => row.rows },
    { key: 'created', header: t('exports.created'), cell: (row: ExportRecord) => formatStamp(row.createdAt, locale), sortValue: (row: ExportRecord) => row.createdAt },
    {
      key: 'link',
      header: t('exports.link'),
      cell: (row: ExportRecord) =>
        row.expired ? (
          <Badge>{t('exports.expired')}</Badge>
        ) : (
          <a
            href="#"
            role="button"
            onClick={(e) => {
              e.preventDefault();
              download(row);
            }}
          >
            {t('exports.download')}
          </a>
        ),
    },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <>
      <Panel title={t('exports.create')} lead={t('exports.createLead')}>
        <form onSubmit={(e) => void submit(e)} noValidate>
          <div className="row">
            <div className="col-md-4">
              <Field id="ex_ds" label={t('exports.dataset')}>
                <Select options={DATASETS.map((d) => ({ value: d, label: t(`exports.dataset.${d}`) }))} {...form.register('dataset')} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field id="ex_c" label={t('exports.cycle')}>
                <Select
                  options={cycles.map((c) => ({ value: c.slug, label: c.status === 'ACTIVE' ? t('dash.cycleCurrent', { cycle: cycleOf(c.slug) }) : cycleOf(c.slug) }))}
                  {...form.register('cycle')}
                />
              </Field>
            </div>
            <div className="col-md-2">
              <Field id="ex_from" label={t('exports.from')}>
                <Input type="date" {...form.register('from')} />
              </Field>
            </div>
            <div className="col-md-2">
              <Field id="ex_to" label={t('exports.to')} error={form.formState.errors.to?.message}>
                <Input type="date" {...form.register('to')} />
              </Field>
            </div>
          </div>
          <Can require={['users:export', 'payments:export', 'donations:export', 'signups:export', 'results:export']} mode="any">
            <div className="ix_btn_row">
              <button type="submit" className="common_btn" disabled={create.isPending}>
                {t('exports.createCta')}
              </button>
            </div>
          </Can>
        </form>
      </Panel>
      <Panel title={t('exports.recent')} lead={t('exports.recentLead')}>
        {downloadError && (
          <span className="ix_err" role="alert">
            {t('exports.downloadFailed')}
          </span>
        )}
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<ExportRecord> rows={list.rows} rowKey={(row) => row.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
          <AdminPager page={list.page} totalPages={list.totalPages} />
        </QueryState>
      </Panel>
    </>
  );
}
