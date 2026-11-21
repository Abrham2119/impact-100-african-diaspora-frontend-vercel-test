import { BarRows, ButtonLink, Panel, QueryState, StatRow, Table } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { Can } from '@/features/auth/components/Can';
import { levelName } from '@/features/membership/lib/levelName';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatCount, formatMoney } from '@/lib/format';
import { useFinanceSummary } from '../hooks/useAdmin';

// Finance overview (admin_finance.dc.html): pledged, received, direct donations and open flags;
// donations by area (never linked to a campaign) and pledged vs received by level — from the ledger.
export function FinancePage() {
  const t = useT('admin');
  const ts = useT('site');
  const { locale } = useLocale();
  const query = useFinanceSummary();
  const f = query.data;
  const money = (cents: number) => formatMoney(cents, locale);
  const topArea = Math.max(1, ...(f?.donationsByPortfolio.map((p) => p.cents) ?? [1]));

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {f && (
        <>
          <StatRow
            columns="col-xl-3 col-sm-6"
            items={[
              { key: 'pledged', label: t('finance.pledged'), value: money(f.pledgedCents) },
              { key: 'received', label: t('finance.received'), value: money(f.receivedCents), note: t('finance.receivedNote', { pct: Math.round((f.receivedCents / f.pledgedCents) * 100) }) },
              { key: 'donations', label: t('finance.donations'), value: money(f.donationsCents), note: t('finance.gifts', { count: formatCount(f.gifts, locale) }) },
              { key: 'flags', label: t('finance.flags'), value: f.openFlags, note: t('finance.flagsNote') },
            ]}
          />
          <Panel title={t('finance.byArea')} lead={t('finance.byAreaLead')}>
            <BarRows
              rows={f.donationsByPortfolio.map((p) => ({
                key: p.portfolioKey,
                label: t(`finance.area.${p.portfolioKey}` as 'finance.area.diaspora-engagement'),
                widthPct: (p.cents / topArea) * 100,
                value: money(p.cents),
              }))}
            />
          </Panel>
          <Panel title={t('finance.byLevel')}>
            <Table
              rows={f.byLevel}
              rowKey={(row) => row.levelKey}
              columns={[
                { key: 'level', header: t('finance.level'), cell: (row) => levelName(ts, row.levelKey) },
                { key: 'pledges', header: t('finance.pledges'), cell: (row) => row.pledges },
                { key: 'pledged', header: t('finance.pledged'), cell: (row) => money(row.pledgedCents) },
                { key: 'received', header: t('finance.received'), cell: (row) => money(row.receivedCents) },
                { key: 'paid', header: t('finance.paidInFull'), cell: (row) => row.paidInFull },
              ]}
            />
          </Panel>
          <div className="ix_btn_row">
            <Can require="payments:read">
              <ButtonLink size="sm" to={PATHS.admin.ledger}>
                {t('finance.openLedger')}
              </ButtonLink>
            </Can>
            <Can require="payments:create">
              <ButtonLink size="sm" variant="dark" to={PATHS.admin.offline}>
                {t('finance.recordOffline')}
              </ButtonLink>
            </Can>
            <Can require="payments:export">
              <ButtonLink size="sm" to={`${PATHS.admin.exports}?dataset=PAYMENTS`}>
                {t('finance.exportPayments')}
              </ButtonLink>
            </Can>
          </div>
        </>
      )}
    </QueryState>
  );
}
