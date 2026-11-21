import { useId } from 'react';
import { Panel, QueryState, Table, type TableColumn } from '@/components/design';
import { Can } from '@/features/auth/components/Can';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadBlob, downloadCsv } from '@/lib/download';
import { textPdf } from '@/lib/pdf';
import type { SignatureRow } from '../api/governanceAdminRepository';
import { useExportSignatures, useSignatureRegister } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { stampParts } from './labels';

// Signature register (admin_signatures.dc.html): every charter signature as signed in the portal —
// member, typed name, version, time (ET) and IP — never changed; a new charter version invites members
// to sign again. Search, sortable columns, CSV export (audited) and each signature's PDF.
export function SignaturesPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const searchId = useId();
  const query = useSignatureRegister();
  const exporter = useExportSignatures();

  const version = (s: SignatureRow) => s.version.split(' ')[0];
  const signedAt = (s: SignatureRow) => t('signatures.at', stampParts(s.signedAt, locale));
  const savePdf = (s: SignatureRow) => {
    const line = (key: 'member' | 'typed' | 'charter' | 'signed' | 'ip', value: string) => t(`signatures.pdfLine.${key}`, { value });
    const pdf = textPdf(t('signatures.pdfTitle'), [line('member', s.memberName), line('typed', s.typedName), line('charter', s.version), line('signed', `${signedAt(s)} ET`), line('ip', s.ip)]);
    downloadBlob(`signature-${s.userId}-${version(s)}.pdf`, pdf);
  };
  const columns: Array<TableColumn<SignatureRow>> = [
    { key: 'member', header: t('signatures.member'), cell: (s) => s.memberName, sortValue: (s) => s.memberName },
    { key: 'typed', header: t('signatures.typed'), cell: (s) => s.typedName, sortValue: (s) => s.typedName },
    { key: 'charter', header: t('signatures.charter'), cell: version, sortValue: version },
    { key: 'signed', header: t('signatures.signed'), cell: signedAt, sortValue: (s) => s.signedAt },
    { key: 'ip', header: t('signatures.ip'), cell: (s) => s.ip },
    {
      key: 'pdf',
      header: t('signatures.pdf'),
      cell: (s) => (
        <a
          href="#"
          aria-label={t('signatures.pdfLabel', { name: s.memberName })}
          onClick={(e) => {
            e.preventDefault();
            savePdf(s);
          }}
        >
          {t('signatures.pdf')}
        </a>
      ),
    },
  ];
  const list = useAdminList(query.data, { columns, searchText: (s) => `${s.memberName} ${s.typedName} ${s.ip} ${s.version}` });

  return (
    <Panel
      title={t('signatures.title')}
      lead={t('signatures.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={searchId}>
            {t('signatures.search')}
          </label>
          <input id={searchId} type="search" placeholder={t('signatures.search')} value={list.query} onChange={(e) => list.onSearch(e.target.value)} />
          <Can require="signatures:export">
            <button type="button" className="common_btn ix_btn_sm" disabled={exporter.isPending} onClick={() => void exporter.mutateAsync(undefined).then((csv) => downloadCsv('signatures.csv', csv))}>
              {t('signatures.export')}
            </button>
          </Can>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<SignatureRow> rows={list.rows} rowKey={(s) => `${s.userId}:${s.version}`} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
    </Panel>
  );
}
