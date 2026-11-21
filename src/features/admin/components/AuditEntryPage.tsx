import { useParams } from 'react-router-dom';
import { EmptyState, KeyValueList, Panel, QueryState } from '@/components/design';
import type { AuditEntry } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { shortHash } from '@/domain/rules/audit';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { useAuditChain, useAuditEntry } from '../hooks/useAdmin';
import { roleLabel, stampParts } from './labels';

// Audit entry (admin_audit_entry.dc.html): who did what to which record and when (ET), the entry's
// hash and whether the chain verifies, and the before / after of the change when there is one.
export function AuditEntryPage() {
  const t = useT('admin');
  const { id } = useParams();
  const query = useAuditEntry(id);
  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {query.data ? <EntryView entry={query.data} /> : <EmptyState>{t('auditEntry.notFound')}</EmptyState>}
    </QueryState>
  );
}

function EntryView({ entry }: { entry: AuditEntry }) {
  const t = useT('admin');
  const { locale } = useLocale();
  const chain = useAuditChain();
  const when = stampParts(entry.at, locale);
  const actor = entry.actorRole ? t('auditEntry.actorRole', { name: entry.actorName, role: roleLabel(t, entry.actorRole as ChapterRoleName) }) : entry.actorName;
  const verified = chain.data === undefined ? '' : ` · ${t(chain.data ? 'auditEntry.verified' : 'auditEntry.broken')}`;

  return (
    <>
      <Panel title={t('auditEntry.heading', { id: entry.id })} lead={t('auditEntry.meta', { action: entry.action, ...when })}>
        <KeyValueList
          rows={[
            { key: 'actor', label: t('auditEntry.actor'), value: actor },
            { key: 'action', label: t('auditEntry.action'), value: entry.action },
            { key: 'entity', label: t('auditEntry.entity'), value: entry.entityDetail ?? entry.entity },
            {
              key: 'hash',
              label: t('auditEntry.hash'),
              value: (
                <>
                  <span className="ix_code">{shortHash(entry.hash)}</span>
                  {verified}
                </>
              ),
            },
          ]}
        />
      </Panel>
      {(entry.before !== null || entry.after !== null) && (
        <div className="ix_diff mt_30">
          <div className="ix_old">
            <b>{t('auditEntry.before')}</b>
            <p>{entry.before ?? t('people.none')}</p>
          </div>
          <div className="ix_new">
            <b>{t('auditEntry.after')}</b>
            <p>{entry.after ?? t('people.none')}</p>
          </div>
        </div>
      )}
    </>
  );
}
