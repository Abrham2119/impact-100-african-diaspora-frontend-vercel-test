import { useState } from 'react';
import { Badge, Field, Modal, Panel, QueryState, Select, Table, type BadgeKind, type TableColumn } from '@/components/design';
import type { BoardRow, BoardStatus } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useT } from '@/i18n/useT';
import { useAssignReviewer, useMoveToBallot, useReviewBoard, useReviewerPool } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText } from './labels';

// Review board (admin_review_board.dc.html): each proposal's reviewers, submitted and recused
// reviews (live from the committee's reviews in the portal) and weighted total. Scored when every
// reviewer has submitted or recused; then it can move to the ballot. Under review: assign another
// Grants Selection committee member (their portal Reviews list gets it).
const STATUS_BADGE: Record<BoardStatus, BadgeKind> = { SCORED: 'ok', UNDER_REVIEW: 'warn', ON_BALLOT: 'info' };

export function ReviewBoardPage() {
  const t = useT('admin');
  const query = useReviewBoard();
  const move = useMoveToBallot();
  const [assigning, setAssigning] = useState<BoardRow | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const action = (r: BoardRow) =>
    r.status === 'SCORED' ? (
      <Can require="scoring:approve" fallback={t('people.none')}>
        <button
          type="button"
          className="common_btn ix_btn_sm"
          disabled={move.isPending}
          onClick={() => {
            setFailed(null);
            move.mutateAsync(r.proposalId).catch((e: unknown) => setFailed(adminErrorText(t, e)));
          }}
        >
          {t('board.moveToBallot')}
        </button>
      </Can>
    ) : r.status === 'UNDER_REVIEW' ? (
      <Can require="scoring:approve" fallback={t('people.none')}>
        <button type="button" className="common_btn ix_btn_sm ix_btn_dark" onClick={() => setAssigning(r)}>
          {t('board.assign')}
        </button>
      </Can>
    ) : (
      t('people.none')
    );
  const columns: Array<TableColumn<BoardRow>> = [
    { key: 'proposal', header: t('board.proposal'), cell: (r) => r.title, sortValue: (r) => r.title },
    { key: 'reviewers', header: t('board.reviewers'), cell: (r) => r.reviewers, sortValue: (r) => r.reviewers },
    { key: 'submitted', header: t('board.submitted'), cell: (r) => r.submitted, sortValue: (r) => r.submitted },
    { key: 'recused', header: t('board.recused'), cell: (r) => r.recused, sortValue: (r) => r.recused },
    { key: 'total', header: t('board.total'), cell: (r) => (r.weightedTotal === null ? t('people.none') : r.weightedTotal.toFixed(2)), sortValue: (r) => r.weightedTotal ?? -1 },
    { key: 'status', header: t('board.status'), cell: (r) => <Badge kind={STATUS_BADGE[r.status]}>{t(`board.status.${r.status}`)}</Badge>, sortValue: (r) => r.status },
    { key: 'act', header: '', cell: action },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <>
      <Panel title={t('board.title')} lead={t('board.lead')}>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<BoardRow> rows={list.rows} rowKey={(r) => r.proposalId} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
          <AdminPager page={list.page} totalPages={list.totalPages} />
        </QueryState>
      </Panel>
      {assigning && <AssignDialog row={assigning} onClose={() => setAssigning(null)} />}
    </>
  );
}

function AssignDialog({ row, onClose }: { row: BoardRow; onClose: () => void }) {
  const t = useT('admin');
  const pool = useReviewerPool();
  const assign = useAssignReviewer();
  const candidates = (pool.data ?? []).filter((p) => !row.assignedIds.includes(p.id));
  const [personId, setPersonId] = useState('');
  const [failed, setFailed] = useState<string | null>(null);
  const chosen = personId || candidates[0]?.id || '';

  return (
    <Modal labelledBy="ar_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="ar_h">{t('board.assignTitle')}</h3>
        <p>{t('board.assignBody', { title: row.title })}</p>
        <QueryState isPending={pool.isPending} isError={pool.isError} onRetry={() => void pool.refetch()}>
          {candidates.length ? (
            <Field id="ar_p" label={t('board.reviewer')} error={failed ?? undefined}>
              <Select value={chosen} onChange={(e) => setPersonId(e.target.value)} options={candidates.map((p) => ({ value: p.id, label: p.name }))} />
            </Field>
          ) : (
            <p className="ix_note">{t('board.noReviewers')}</p>
          )}
        </QueryState>
        <div className="ix_btn_row">
          {candidates.length > 0 && (
            <button
              type="button"
              className="common_btn"
              disabled={assign.isPending || !chosen}
              onClick={() =>
                assign
                  .mutateAsync({ proposalId: row.proposalId, personId: chosen })
                  .then(onClose)
                  .catch((e: unknown) => setFailed(adminErrorText(t, e)))
              }
            >
              {t('board.assignCta')}
            </button>
          )}
          <button type="button" className="common_btn ix_btn_ghost" onClick={onClose}>
            {t('people.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
