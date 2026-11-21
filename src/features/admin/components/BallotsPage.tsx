import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Badge, ButtonLink, Field, Input, Modal, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { AdminBallotRow, AdminBallotStatus } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import { useAdminBallots, useEditBallotWindow, useOpenBallot } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText } from './labels';

// Ballots (admin_ballots.dc.html): every ballot window. Opening one starts voting now; a scheduled
// decision / amendment window can be moved; closing freezes the eligible-voter count used for quorum
// ("84 (live)" until then). Published ballots link to their results.
const STATUS_BADGE: Record<AdminBallotStatus, BadgeKind> = { SCHEDULED: 'info', OPEN: 'warn', CLOSED: 'neutral', PUBLISHED: 'ok' };

export function BallotsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useAdminBallots();
  const open = useOpenBallot();
  const [editing, setEditing] = useState<AdminBallotRow | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const subject = (b: AdminBallotRow) => (b.subject === 'PROPOSALS' ? t('ballots.proposals', { count: b.proposals }) : t(`ballots.subject.${b.subject}`));
  const action = (b: AdminBallotRow) => {
    if (b.status === 'PUBLISHED' || b.status === 'CLOSED') return <Link to={PATHS.admin.publish}>{t('ballots.view')}</Link>;
    if (b.status !== 'SCHEDULED') return t('people.none');
    return (
      <Can require="ballots:update" fallback={t('people.none')}>
        {b.subject === 'PROPOSALS' ? (
          <button
            type="button"
            className="common_btn ix_btn_sm"
            disabled={open.isPending}
            onClick={() => {
              setFailed(null);
              open.mutateAsync(b.id).catch((e: unknown) => setFailed(adminErrorText(t, e)));
            }}
          >
            {t('ballots.openNow')}
          </button>
        ) : (
          <button type="button" className="common_btn ix_btn_sm ix_btn_dark" onClick={() => setEditing(b)}>
            {t('ballots.editWindow')}
          </button>
        )}
      </Can>
    );
  };
  const columns: Array<TableColumn<AdminBallotRow>> = [
    { key: 'ballot', header: t('ballots.ballot'), cell: (b) => b.title, sortValue: (b) => b.title },
    { key: 'subject', header: t('ballots.subject'), cell: subject, sortValue: subject },
    { key: 'opens', header: t('ballots.opens'), cell: (b) => formatDate(b.opensOn, locale), sortValue: (b) => b.opensOn },
    { key: 'closes', header: t('ballots.closes'), cell: (b) => formatDate(b.closesOn, locale), sortValue: (b) => b.closesOn },
    { key: 'eligible', header: t('ballots.eligible'), cell: (b) => t(b.frozenEligible === null ? 'ballots.live' : 'ballots.frozen', { count: b.eligible }), sortValue: (b) => b.eligible },
    { key: 'status', header: t('ballots.status'), cell: (b) => <Badge kind={STATUS_BADGE[b.status]}>{t(`ballots.status.${b.status}`)}</Badge>, sortValue: (b) => b.status },
    { key: 'act', header: '', cell: action },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <>
      <Panel
        title={t('ballots.title')}
        lead={t('ballots.lead')}
        right={
          <Can require="ballots:create">
            <div className="ix_toolbar">
              <ButtonLink size="sm" to={PATHS.admin.proposalNew}>
                {t('ballots.new')}
              </ButtonLink>
            </div>
          </Can>
        }
      >
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<AdminBallotRow> rows={list.rows} rowKey={(b) => b.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
          <AdminPager page={list.page} totalPages={list.totalPages} />
        </QueryState>
      </Panel>
      {editing && <WindowDialog ballot={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

/** Moves a scheduled ballot's window (dates in ET). */
function WindowDialog({ ballot, onClose }: { ballot: AdminBallotRow; onClose: () => void }) {
  const t = useT('admin');
  const edit = useEditBallotWindow();
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      z
        .object({ opensOn: z.string(), closesOn: z.string() })
        .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v.opensOn) && /^\d{4}-\d{2}-\d{2}$/.test(v.closesOn) && v.closesOn > v.opensOn, { message: t('error.WINDOW'), path: ['closesOn'] }),
    [t],
  );
  const form = useDesignForm(schema, { opensOn: ballot.opensOn, closesOn: ballot.closesOn });
  const submit = form.handleSubmit((values) =>
    edit
      .mutateAsync({ id: ballot.id, ...values })
      .then(onClose)
      .catch((e: unknown) => setFailed(adminErrorText(t, e))),
  );

  return (
    <Modal labelledBy="bw_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="bw_h">{t('ballots.windowTitle')}</h3>
        <p>{t('ballots.windowBody', { title: ballot.title })}</p>
        <form onSubmit={(e) => void submit(e)} noValidate>
          <Field id="bw_o" label={t('ballots.opens')}>
            <Input type="date" {...form.register('opensOn')} />
          </Field>
          <Field id="bw_c" label={t('ballots.closes')} error={form.formState.errors.closesOn?.message ?? failed ?? undefined}>
            <Input type="date" {...form.register('closesOn')} />
          </Field>
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={edit.isPending}>
              {t('ballots.saveWindow')}
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
