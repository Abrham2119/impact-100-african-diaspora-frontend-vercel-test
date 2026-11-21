import { useState } from 'react';
import { Badge, Panel, QueryState, Table } from '@/components/design';
import type { SettingsChange } from '@/domain/entities/admin.types';
import { AdminError, canDecide } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';
import { useApprovals, useApproveChange, useRejectChange } from '../hooks/useAdmin';
import { diffText } from './labels';

// Approval queue (admin_approvals.dc.html): settings changes proposed by another admin wait here;
// you can approve or reject them, never your own ("Needs another admin").
export function ApprovalsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const me = useAuthStore((s) => s.session?.id ?? null);
  const query = useApprovals();
  const approve = useApproveChange();
  const reject = useRejectChange();
  const [failed, setFailed] = useState<string | null>(null);
  const money = (cents: number) => formatMoney(cents, locale);
  const busy = approve.isPending || reject.isPending;
  const act = (run: Promise<unknown>) => {
    setFailed(null);
    run.catch((e: unknown) => setFailed(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic')));
  };

  return (
    <Panel title={t('approvals.title')} lead={t('approvals.lead')}>
      {failed && (
        <span className="ix_err" role="alert">
          {failed}
        </span>
      )}
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<SettingsChange>
          rows={query.data ?? []}
          rowKey={(c) => c.id}
          empty={t('approvals.empty')}
          columns={[
            { key: 'change', header: t('approvals.change'), cell: (c) => c.summary ?? diffText(t, money, c.diff) },
            { key: 'by', header: t('approvals.proposedBy'), cell: (c) => (c.proposedBy === me ? t('approvals.you', { name: c.proposedByName }) : c.proposedByName) },
            { key: 'effective', header: t('approvals.effective'), cell: (c) => formatDate(c.effectiveFrom, locale) },
            { key: 'status', header: t('approvals.status'), cell: () => <Badge kind="warn">{t('approvals.pending')}</Badge> },
            {
              key: 'act',
              header: '',
              cell: (c) =>
                canDecide(c, me) ? (
                  <Can require="charter_settings:approve" fallback={<span className="ix_note">{t('approvals.needsAnother')}</span>}>
                    <button type="button" className="common_btn ix_btn_sm" disabled={busy} onClick={() => act(approve.mutateAsync(c.id))}>
                      {t('approvals.approve')}
                    </button>{' '}
                    <button type="button" className="common_btn ix_btn_sm ix_btn_dark" disabled={busy} onClick={() => act(reject.mutateAsync(c.id))}>
                      {t('approvals.reject')}
                    </button>
                  </Can>
                ) : (
                  <span className="ix_note">{t('approvals.needsAnother')}</span>
                ),
            },
          ]}
        />
      </QueryState>
    </Panel>
  );
}
