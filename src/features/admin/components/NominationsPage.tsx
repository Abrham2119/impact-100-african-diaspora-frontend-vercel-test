import { useId, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Panel, QueryState, Table, type BadgeKind, type TableColumn } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { NominationStatus } from '@/domain/entities/governance.types';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useT } from '@/i18n/useT';
import type { NominationRow } from '../api/governanceAdminRepository';
import { useConvertNomination, useNominationQueue, useSetNominationStatus } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText } from './labels';

// Nominations queue (admin_nominations.dc.html): members' priorities, nominees and proposal ideas
// from the portal. Submitted → start review → accept / decline (the submitter sees the status in the
// portal); an accepted priority is added to the work plan, an accepted proposal idea can become a
// proposal draft.
const STATUS_BADGE: Record<NominationStatus, BadgeKind> = { SUBMITTED: 'info', IN_REVIEW: 'warn', ACCEPTED: 'ok', DECLINED: 'bad' };
const STATUSES: NominationStatus[] = ['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'DECLINED'];
const draftHref = (id: string) => `${PATHS.admin.proposalNew}?draft=${encodeURIComponent(id)}`;

export function NominationsPage() {
  const t = useT('admin');
  const catalog = useCatalog();
  const navigate = useNavigate();
  const statusId = useId();
  const query = useNominationQueue();
  const setStatus = useSetNominationStatus();
  const convert = useConvertNomination();
  const [status, setStatusFilter] = useListFilter('status');
  const [failed, setFailed] = useState<string | null>(null);
  const busy = setStatus.isPending || convert.isPending;
  const move = (n: NominationRow, to: NominationStatus) => {
    setFailed(null);
    setStatus.mutateAsync({ id: n.id, status: to }).catch((e: unknown) => setFailed(adminErrorText(t, e)));
  };

  const action = (n: NominationRow) => {
    const canMove = (content: ReactNode) => (
      <Can require="nominations:update" fallback={t('people.none')}>
        {content}
      </Can>
    );
    if (n.status === 'SUBMITTED')
      return canMove(
        <button type="button" className="common_btn ix_btn_sm" disabled={busy} onClick={() => move(n, 'IN_REVIEW')}>
          {t('nominations.startReview')}
        </button>,
      );
    if (n.status === 'IN_REVIEW')
      return canMove(
        <>
          <button type="button" className="common_btn ix_btn_sm" disabled={busy} onClick={() => move(n, 'ACCEPTED')}>
            {t('nominations.accept')}
          </button>{' '}
          <button type="button" className="common_btn ix_btn_sm ix_btn_dark" disabled={busy} onClick={() => move(n, 'DECLINED')}>
            {t('nominations.decline')}
          </button>
        </>,
      );
    if (n.status === 'ACCEPTED' && n.type === 'PRIORITY') return t('nominations.addedToPlan');
    if (n.status === 'ACCEPTED' && n.type === 'PROPOSAL') {
      if (n.draftProposalId) return <Link to={draftHref(n.draftProposalId)}>{t('nominations.openDraft')}</Link>;
      return (
        <Can require="ballots:create" fallback={t('people.none')}>
          <button
            type="button"
            className="common_btn ix_btn_sm ix_btn_dark"
            disabled={busy}
            onClick={() => {
              setFailed(null);
              convert
                .mutateAsync(n.id)
                .then((draft) => navigate(draftHref(draft.id)))
                .catch((e: unknown) => setFailed(adminErrorText(t, e)));
            }}
          >
            {t('nominations.convert')}
          </button>
        </Can>
      );
    }
    return t('people.none');
  };
  const columns: Array<TableColumn<NominationRow>> = [
    { key: 'type', header: t('nominations.type'), cell: (n) => t(`nominations.type.${n.type}`), sortValue: (n) => n.type },
    { key: 'title', header: t('nominations.titleCol'), cell: (n) => n.title, sortValue: (n) => n.title },
    { key: 'country', header: t('nominations.country'), cell: (n) => (n.countryKey ? catalog.country(n.countryKey) : t('people.none')), sortValue: (n) => catalog.country(n.countryKey) },
    { key: 'from', header: t('nominations.from'), cell: (n) => n.fromName || t('people.none'), sortValue: (n) => n.fromName },
    { key: 'status', header: t('nominations.status'), cell: (n) => <Badge kind={STATUS_BADGE[n.status]}>{t(`nominations.status.${n.status}`)}</Badge>, sortValue: (n) => STATUSES.indexOf(n.status) },
    { key: 'act', header: '', cell: action },
  ];
  const list = useAdminList(query.data, { columns, filters: { status: (n, value) => n.status === value } });

  return (
    <Panel
      title={t('nominations.title')}
      lead={t('nominations.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={statusId}>
            {t('nominations.statusFilter')}
          </label>
          <select id={statusId} className="ix_select" value={status} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">{t('nominations.all')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`nominations.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {failed && (
        <span className="ix_err" role="alert">
          {failed}
        </span>
      )}
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<NominationRow> rows={list.rows} rowKey={(n) => n.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
