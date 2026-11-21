import { useState } from 'react';
import { Panel, QueryState, Table } from '@/components/design';
import { MATRIX_ACTIONS, type MatrixAction, type MatrixRow } from '@/domain/entities/admin.types';
import { Can } from '@/features/auth/components/Can';
import { useT } from '@/i18n/useT';
import { usePermissionMatrix, useUpdateMatrix } from '../hooks/useAdmin';

// Permission matrix (admin_permissions.dc.html): six actions per module for the role it is shown
// for. "edit matrix" turns each cell into a toggle; saving stores the matrix (audited) and the role
// grants follow at each person's next sign-in.
export function PermissionsPage() {
  const t = useT('admin');
  const query = usePermissionMatrix();
  const update = useUpdateMatrix();
  const [draft, setDraft] = useState<MatrixRow[] | null>(null);
  const rows = draft ?? query.data ?? [];

  const toggle = (row: MatrixRow, action: MatrixAction) =>
    setDraft(rows.map((r) => (r === row ? { ...r, cells: { ...r.cells, [action]: !r.cells[action] } } : r)));
  const save = () => {
    if (draft) void update.mutateAsync(draft).then(() => setDraft(null));
  };
  const cell = (row: MatrixRow, action: MatrixAction) => {
    const mark = row.cells[action] ? <span className="ix_dot">{t('matrix.granted')}</span> : <span className="ix_none">{t('matrix.notGranted')}</span>;
    if (!draft) return mark;
    return (
      <button
        type="button"
        className="ixd_plain_btn"
        aria-pressed={row.cells[action]}
        aria-label={t('matrix.cell', { action: t(`matrix.action.${action}`), module: t(`matrix.module.${row.module}` as 'matrix.module.voting'), role: t(`matrix.roleLabel.${row.roleLabel}`) })}
        onClick={() => toggle(row, action)}
      >
        {mark}
      </button>
    );
  };

  return (
    <Panel
      title={t('matrix.title')}
      lead={t('matrix.lead')}
      right={
        <Can require="permissions:assign">
          <div className="ix_toolbar">
            {draft ? (
              <>
                <button type="button" className="common_btn ix_btn_sm" disabled={update.isPending} onClick={save}>
                  {t('matrix.save')}
                </button>
                <button type="button" className="common_btn ix_btn_sm ix_btn_ghost" onClick={() => setDraft(null)}>
                  {t('matrix.cancel')}
                </button>
              </>
            ) : (
              <button type="button" className="common_btn ix_btn_sm" onClick={() => setDraft(query.data ?? null)}>
                {t('matrix.edit')}
              </button>
            )}
          </div>
        </Can>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        {draft && <p className="ix_note">{t('matrix.editing')}</p>}
        <Table<MatrixRow>
          className="ix_matrix"
          rows={rows}
          rowKey={(r) => `${r.module}-${r.roleLabel}`}
          columns={[
            { key: 'module', header: t('matrix.module'), cell: (r) => t(`matrix.module.${r.module}` as 'matrix.module.voting') },
            { key: 'role', header: t('matrix.role'), cell: (r) => t(`matrix.roleLabel.${r.roleLabel}`) },
            ...MATRIX_ACTIONS.map((action) => ({ key: action, header: t(`matrix.action.${action}`), cell: (r: MatrixRow) => cell(r, action) })),
          ]}
        />
      </QueryState>
    </Panel>
  );
}
