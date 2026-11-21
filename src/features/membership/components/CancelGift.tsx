import { Button, ButtonRow, Card, ResultBox } from '@/components/design';
import { CmsButtons } from '@/features/content/components/CmsButton';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { CollectionState } from '@/features/content/components/sections/shared';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { countries, portfolios } from '@/features/content/schemas/sectionTypes';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatLongDate, formatMoney } from '@/lib/format';
import { useCancelDonation, useDonationCancelInfo } from '../hooks/useMembership';

// form_block `cancel_gift` — /donate/cancel?token= (cancel_gift.dc.html): the monthly gift from the
// receipt email's signed token (`GET membership/donations/cancel`), then "cancel monthly gift"
// (`POST membership/donations/cancel`, mocked). Items are the rows: key gift | started | next |
// <any other> (a fixed `value`, e.g. "Issued by USAFI Impact").
export function CancelGift({ section }: { section: FormBlockData }) {
  const { fields, items } = section;
  const { locale } = useLocale();
  const t = useT('site');
  const [token] = useSearchParamState('token');
  const info = useDonationCancelInfo(token ?? '');
  const cancel = useCancelDonation();
  const pf = useSectionEntries(portfolios, { collection: 'portfolios' });
  const ct = useSectionEntries(countries, { collection: 'countries' });
  const gift = info.data;
  const done = cancel.isSuccess || gift?.status === 'CANCELLED';

  const value = (key: string | undefined, fixed: string | undefined): string | undefined => {
    if (!gift) return fixed;
    if (key === 'gift') {
      return t('gift.monthly', {
        amount: formatMoney(gift.amount_cents, locale),
        portfolio: pf.entries.find((p) => p.key === gift.portfolio)?.fields.name ?? gift.portfolio,
        country: ct.entries.find((c) => c.key === gift.country)?.fields.name ?? gift.country,
      });
    }
    if (key === 'started') return formatLongDate(gift.started_at, locale);
    if (key === 'next') return formatLongDate(gift.next_charge_on, locale);
    return fixed;
  };

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-9 m-auto">
            <Card kicker={fields.kicker}>
              <h2 className="ixd_title_36 ixd_mt8">{fields.title}</h2>
              <CollectionState isPending={info.isPending} isError={info.isError} isEmpty={!gift} onRetry={() => void info.refetch()}>
                <dl className="ix_kv mt_30">
                  {items.map((item) => (
                    <div key={item.id} className="ixd_contents">
                      <dt>{item.fields.title}</dt>
                      <dd>{value(item.settings.key, item.fields.value)}</dd>
                    </div>
                  ))}
                </dl>
              </CollectionState>
              {done && (
                <ResultBox kind="ok" title={fields.success_title}>
                  {fields.success_body}
                </ResultBox>
              )}
              {!done && gift && (
                <ButtonRow>
                  <Button disabled={cancel.isPending} onClick={() => cancel.mutate(token ?? '')}>
                    {fields.submit_label}
                  </Button>
                  {fields.actions && <CmsButtons links={fields.actions} />}
                </ButtonRow>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
