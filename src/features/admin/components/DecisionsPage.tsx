import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Field, Input, Modal, Panel, QueryState, Table, Textarea, type BadgeKind, type TableColumn } from '@/components/design';
import type { Amendment, AmendmentStatus } from '@/domain/entities/governance.types';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import type { DecisionRow } from '../api/governanceAdminRepository';
import { useAdminDecisions, useCreateDecision, usePlaceOnBallot } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText, windowText } from './labels';

// Decisions (admin_decisions.dc.html): the chapter decisions on the next ballot (window and status by
// date) and charter amendments — one goes on a ballot only after its circulation notice has gone out.
const DECISION_BADGE: Record<DecisionRow['status'], BadgeKind> = { SCHEDULED: 'info', OPEN: 'warn', CLOSED: 'neutral' };
const AMENDMENT_BADGE: Record<AmendmentStatus, BadgeKind> = { CIRCULATING: 'info', ON_BALLOT: 'warn', ADOPTED: 'ok', REJECTED: 'bad' };

export function DecisionsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useAdminDecisions();
  const place = usePlaceOnBallot();
  const [adding, setAdding] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const decisionColumns: Array<TableColumn<DecisionRow>> = [
    { key: 'decision', header: t('decisions.decision'), cell: (d) => d.title, sortValue: (d) => d.title },
    { key: 'window', header: t('decisions.window'), cell: (d) => windowText(t, d.opensOn, d.closesOn, locale), sortValue: (d) => d.opensOn },
    { key: 'status', header: t('decisions.status'), cell: (d) => <Badge kind={DECISION_BADGE[d.status]}>{t(`ballots.status.${d.status}`)}</Badge>, sortValue: (d) => d.status },
  ];
  const action = (a: Amendment) => {
    if (a.status === 'ADOPTED') return a.adoptedIn ? t('decisions.charterVersion', { version: a.adoptedIn }) : t('people.none');
    if (a.status !== 'CIRCULATING') return t('people.none');
    if (!a.circulatedOn) return <span className="ix_note">{t('decisions.sendNoticeFirst')}</span>;
    return (
      <Can require="decisions:update" fallback={t('people.none')}>
        <button
          type="button"
          className="common_btn ix_btn_sm"
          disabled={place.isPending}
          onClick={() => {
            setFailed(null);
            place.mutateAsync(a.id).catch((e: unknown) => setFailed(adminErrorText(t, e)));
          }}
        >
          {t('decisions.placeOnBallot')}
        </button>
      </Can>
    );
  };
  const amendmentColumns: Array<TableColumn<Amendment>> = [
    { key: 'section', header: t('decisions.section'), cell: (a) => a.sectionShort ?? a.section },
    { key: 'change', header: t('decisions.change'), cell: (a) => a.changeShort ?? a.change.replace(/\.$/, '') },
    { key: 'circulated', header: t('decisions.circulated'), cell: (a) => (a.circulatedOn ? formatDate(a.circulatedOn, locale) : t('decisions.notYet')) },
    { key: 'status', header: t('decisions.status'), cell: (a) => <Badge kind={AMENDMENT_BADGE[a.status]}>{t(`decisions.amendment.${a.status}`)}</Badge> },
    { key: 'act', header: '', cell: action },
  ];
  // the URL's sort / page belong to the decisions; amendments keep their charter order (as approvals do)
  const decisions = useAdminList(query.data?.decisions, { columns: decisionColumns });

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <Panel
        title={t('decisions.title')}
        right={
          <Can require="decisions:update">
            <div className="ix_toolbar">
              <button type="button" className="common_btn ix_btn_sm" onClick={() => setAdding(true)}>
                {t('decisions.new')}
              </button>
            </div>
          </Can>
        }
      >
        <Table<DecisionRow> rows={decisions.rows} rowKey={(d) => d.id} columns={decisionColumns} sort={decisions.sort} onSort={decisions.onSort} empty={t('list.empty')} />
        <AdminPager page={decisions.page} totalPages={decisions.totalPages} />
      </Panel>
      <Panel title={t('decisions.amendments')} lead={t('decisions.amendmentsLead')}>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <Table<Amendment> rows={query.data?.amendments ?? []} rowKey={(a) => a.id} columns={amendmentColumns} empty={t('list.empty')} />
      </Panel>
      {adding && <NewDecisionDialog onClose={() => setAdding(false)} />}
    </QueryState>
  );
}

function NewDecisionDialog({ onClose }: { onClose: () => void }) {
  const t = useT('admin');
  const create = useCreateDecision();
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      z.object({
        title: z.string().refine((v) => v.trim().length >= 3, t('decisions.titleRequired')),
        description: z.string().refine((v) => v.trim().length > 0, t('decisions.descriptionRequired')),
      }),
    [t],
  );
  const form = useDesignForm(schema, { title: '', description: '' });
  const errors = form.formState.errors;
  const submit = form.handleSubmit((values) =>
    create
      .mutateAsync(values)
      .then(onClose)
      .catch((e: unknown) => setFailed(adminErrorText(t, e))),
  );

  return (
    <Modal labelledBy="nd_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="nd_h">{t('decisions.newTitle')}</h3>
        <p>{t('decisions.newBody')}</p>
        <form onSubmit={(e) => void submit(e)} noValidate>
          <Field id="nd_t" label={t('decisions.titleLabel')} error={errors.title?.message ?? failed ?? undefined}>
            <Input type="text" {...form.register('title')} />
          </Field>
          <Field id="nd_d" label={t('decisions.description')} error={errors.description?.message}>
            <Textarea rows={4} {...form.register('description')} />
          </Field>
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={create.isPending}>
              {t('decisions.create')}
            </button>
            <button type="button" className="common_btn ix_btn_ghost" onClick={onClose}>
              {t('people.cancel')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
