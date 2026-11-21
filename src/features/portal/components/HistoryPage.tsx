import { useMemo } from 'react';
import { Badge, Panel, QueryState, StatRow, Table } from '@/components/design';
import type { Contribution } from '@/domain/entities/membership.types';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useMyContributions, useMyMembership } from '@/features/membership/hooks/useMyMembership';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { downloadCsv, toCsv } from '@/lib/download';
import { formatDate, formatMoney } from '@/lib/format';

// Contribution history (portal_history.dc.html): pledge received / donations / receipts, then every
// confirmed payment newest first — membership installments and direct donations (which never
// count toward membership). "download csv" exports the table.
export function HistoryPage() {
  const t = useT('portal');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const membership = useMyMembership();
  const contributions = useMyContributions();
  const rows = useMemo(() => contributions.data ?? [], [contributions.data]);
  const money = (cents: number) => formatMoney(cents, locale);
  const donations = rows.filter((r) => r.kind === 'DONATION').reduce((sum, r) => sum + r.amountCents, 0);

  const type = (row: Contribution) =>
    row.kind === 'INSTALLMENT'
      ? t('history.installment', { n: row.installmentSeq ?? 1, total: row.installmentCount ?? 1 })
      : t(row.frequency === 'monthly' ? 'history.donation.monthly' : 'history.donation.once');
  const area = (row: Contribution) =>
    row.kind === 'DONATION' && row.portfolioKey ? `${catalog.portfolio(row.portfolioKey).split(' · ')[0]} · ${catalog.country(row.countryKey)}` : t('history.none');

  const exportCsv = () => {
    const header = [t('history.date'), t('history.type'), t('history.amount'), t('history.via'), t('history.area'), t('history.status')];
    const lines = rows.map((r) => [formatDate(r.date, locale), type(r), money(r.amountCents), t('history.wazi'), area(r), t('history.confirmed')]);
    downloadCsv('contribution-history.csv', toCsv([header, ...lines]));
  };

  return (
    <QueryState isPending={contributions.isPending} isError={contributions.isError} onRetry={() => void contributions.refetch()}>
      <StatRow
        items={[
          { key: 'received', label: t('history.received'), value: money(membership.data?.receivedCents ?? 0), note: t('history.receivedNote') },
          { key: 'donations', label: t('history.donations'), value: money(donations), note: t('history.donationsNote') },
          { key: 'receipts', label: t('history.receipts'), value: String(rows.length), note: t('history.receiptsNote') },
        ]}
      />
      <Panel
        title={t('history.title')}
        lead={t('history.lead')}
        right={
          <div className="ix_toolbar">
            <button type="button" className="common_btn ix_btn_sm" onClick={exportCsv} disabled={rows.length === 0}>
              {t('history.csv')}
            </button>
          </div>
        }
      >
        <Table<Contribution>
          rows={rows}
          rowKey={(row) => row.id}
          empty={t('history.empty')}
          columns={[
            { key: 'date', header: t('history.date'), cell: (row) => formatDate(row.date, locale) },
            { key: 'type', header: t('history.type'), cell: type },
            { key: 'amount', header: t('history.amount'), cell: (row) => money(row.amountCents) },
            { key: 'via', header: t('history.via'), cell: () => t('history.wazi') },
            { key: 'area', header: t('history.area'), cell: area },
            { key: 'status', header: t('history.status'), cell: () => <Badge kind="ok">{t('history.confirmed')}</Badge> },
          ]}
        />
      </Panel>
    </QueryState>
  );
}
