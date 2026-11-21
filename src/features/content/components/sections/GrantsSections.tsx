import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AfricaMap, Badge, ButtonRow, Card, Chip, FlowSteps, ResultBox, Select, Timeline } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { usePublicProposals } from '@/features/governance/hooks/usePublicProposals';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { interestsStorage } from '@/infrastructure/storage/interests.storage';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import type { SectionData } from '../../schemas/defineSection';
import { countries, portfolios, type hubMap, type planPair, type portfolioCards, type proposalsList, type splitFeature } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { fillRich } from '../../lib/fillRich';
import { CmsButton, CmsButtons } from '../CmsButton';
import { RichText } from '../RichText';
import { CollectionState, SectionHeadingRow } from './shared';

// The grants page (grants.dc.html): the Africa map + hub panel and the sections that follow it.
// The selected hub is `?hub=` (country key, map key or name; legacy `#hub=`), the interest area
// `?portfolio=` — shared by the map panel, the portfolio cards and the proposals list.
const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);

/** The selected Sub-Saharan country (all are USAFI hubs), from `?hub=` or the section default. */
function useSelectedHub(defaultHub: string | undefined) {
  const all = useSectionEntries(countries, { collection: 'countries' });
  const [param, setParam] = useSearchParamState('hub');
  const find = (value: string | null | undefined) =>
    value ? all.entries.find((c) => c.key === value || c.data.map_key === value || c.fields.name.toLowerCase() === value.toLowerCase()) : undefined;
  const hub = find(param) ?? find(defaultHub);
  return { all, hub, select: (key: string) => setParam(key) };
}

// hub_map — map, hub list, other-country select, interests, proposals and roles for the hub.
export function HubMapSection({ section }: { section: SectionData<typeof hubMap> }) {
  const { fields: c } = section;
  const t = useT('site');
  const { locale, toPath } = useLocale();
  const { all, hub, select } = useSelectedHub(section.settings.default_hub);
  const pf = useSectionEntries(portfolios, { collection: 'portfolios' });
  const [portfolioKey, setPortfolio] = useSearchParamState('portfolio');
  const portfolio = pf.entries.find((p) => p.key === portfolioKey);
  const proposals = usePublicProposals(hub ? { country_key: hub.key, ...(portfolio ? { portfolio_key: portfolio.key } : {}) } : {});

  const featured = all.entries.filter((country) => country.data.featured);
  const others = all.entries.filter((country) => !country.data.featured);
  const names = useMemo(() => Object.fromEntries(all.entries.map((country) => [country.data.map_key, country.fields.name])), [all.entries]);
  const hubLabels = useMemo(
    () => Object.fromEntries(featured.map((country) => [country.data.map_key, t('grants.hubLabel', { name: country.fields.name, capital: country.fields.capital })])),
    [featured, t],
  );
  const values = { name: hub?.fields.name ?? '', capital: hub?.fields.capital ?? '' };
  const saved = Boolean(hub && portfolio);

  // "for this visit, until you join": the picked hub + interest feed /volunteer's matches
  useEffect(() => {
    if (hub && portfolio) interestsStorage.save({ hub: hub.key, portfolio: portfolio.key });
  }, [hub, portfolio]);

  const byMapKey = (mapKey: string) => {
    const country = all.entries.find((entry) => entry.data.map_key === mapKey);
    if (country) select(country.key);
  };

  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={c.kicker} title={c.title} lead={c.lead} width="wide" />
        <CollectionState isPending={all.isPending} isError={all.isError} isEmpty={all.entries.length === 0} onRetry={() => void all.refetch()}>
          <div className="ix_map_wrap mt_50">
            <div className="ix_map">
              <AfricaMap
                label={c.map_label}
                selected={hub?.data.map_key ?? null}
                onSelect={byMapKey}
                names={names}
                hubLabels={hubLabels}
                regionLabels={{ north: c.region_north, subSaharan: c.region_sub_saharan }}
              />
              <div className="ix_map_legend">
                <span>
                  <i className="ixd_swatch_north" />
                  {c.legend_north}
                </span>
                <span>
                  <i className="ixd_swatch_hub" />
                  {c.legend_hub}
                </span>
                <span>
                  <i className="ixd_swatch_mine" />
                  {c.legend_mine}
                </span>
              </div>
              {c.boundaries_note !== undefined && <p className="ix_note">{c.boundaries_note}</p>}
            </div>
            <div className="ix_hub_panel">
              <Card className="ixd_h_auto" kicker={c.list_kicker}>
                <ul className="ix_chips ixd_chip_column">
                  {featured.map((country) => (
                    <li key={country.key}>
                      <Chip on={hub?.key === country.key} onClick={() => select(country.key)}>
                        {`${country.fields.name} `}
                        <span className="ix_muted ixd_fw600">{`· ${country.fields.capital}`}</span>
                      </Chip>
                    </li>
                  ))}
                </ul>
                <div className="contact_input ixd_mt14">
                  <label htmlFor="g_country">{t('grants.otherHub')}</label>
                  <Select id="g_country" value={hub && !hub.data.featured ? hub.key : ''} onChange={(event) => event.target.value && select(event.target.value)}>
                    <option value="">{t('grants.chooseCountry')}</option>
                    {others.map((country) => (
                      <option key={country.key} value={country.key}>
                        {country.fields.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {hub && !hub.data.featured && (
                  <ResultBox
                    kind="wait"
                    title={fill(c.country_title, values)}
                    extra={
                      c.country_actions && (
                        <ButtonRow className="ixd_mt14">
                          <CmsButtons links={c.country_actions} size="sm" />
                        </ButtonRow>
                      )
                    }
                  >
                    {fill(c.country_body, values)}
                  </ResultBox>
                )}
                {hub?.data.featured && (
                  <ResultBox kind="wait" title={t('grants.hubCaption', values)}>
                    {hub.fields.hub_text}
                  </ResultBox>
                )}
                <div className="contact_input">
                  <label id="g_interest">{c.interest_label}</label>
                  <div className="ix_chips" role="group" aria-labelledby="g_interest">
                    {pf.entries.map((option) => (
                      <Chip key={option.key} on={option.key === portfolio?.key} onClick={() => setPortfolio(option.key)}>
                        {option.fields.name}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="ix_hp_block">
                  <p className="ix_kicker">{c.projects_kicker}</p>
                  {(proposals.data ?? []).map((proposal) => (
                    <Link key={proposal.id} className="ix_hp_row" to={toPath(PATHS.portal.proposal(proposal.id))}>
                      <span>
                        <b>{proposal.title}</b>
                        <small>{pf.entries.find((p) => p.key === proposal.portfolioKey)?.fields.name}</small>
                      </span>
                      <em>{t('grants.where', { ...values, country: values.name, amount: formatMoney(proposal.budgetCents, locale) })}</em>
                    </Link>
                  ))}
                </div>
                <div className="ix_hp_block">
                  <p className="ix_kicker">{c.roles_kicker}</p>
                  <Link className="ix_hp_row" to={toPath(c.role_link.href)}>
                    <span>
                      <b>{fill(c.role_title, values)}</b>
                    </span>
                    <em>{fill(c.role_where, values)}</em>
                  </Link>
                </div>
                <ResultBox kind="ok" className="ixd_mt18" title={saved ? c.saved_title : c.unsaved_title}>
                  {saved && portfolio
                    ? fill(c.saved_body, { ...values, portfolio: portfolio.fields.name, flagship: portfolio.fields.flagship })
                    : c.unsaved_body}
                </ResultBox>
                {c.cta && (
                  <ButtonRow>
                    <CmsButton link={c.cta} />
                  </ButtonRow>
                )}
              </Card>
            </div>
          </div>
        </CollectionState>
      </div>
    </section>
  );
}

// split_feature — "How grants are selected": text column + rubric card.
export function SplitFeatureSection({ section }: { section: SectionData<typeof splitFeature> }) {
  const { fields, items } = section;
  return (
    <section className="mt_100">
      <div className="container">
        <div className="row ix_gap align-items-center">
          <div className="col-lg-5">
            <div className="section_heading ixd_left">
              <h2 className="ixd_left">{fields.title}</h2>
            </div>
            {fields.lead !== undefined && <p className="ix_lead ixd_left ixd_mt16">{fields.lead}</p>}
            {fields.actions && (
              <ButtonRow className="ixd_mt24">
                <CmsButtons links={fields.actions} />
              </ButtonRow>
            )}
          </div>
          <div className="col-lg-7">
            <Card kicker={fields.card_kicker}>
              {fields.card_note !== undefined && <p className="ix_note ixd_mt6">{fields.card_note}</p>}
              <div className="ixd_mt10">
                {items.map((item) => (
                  <div key={item.id} className="ix_hp_row">
                    <span>
                      <b>{item.fields.title}</b>
                      {item.fields.text !== undefined && <small>{item.fields.text}</small>}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// portfolio_cards — each portfolio, its flagship and the selected hub.
export function PortfolioCardsSection({ section }: { section: SectionData<typeof portfolioCards> }) {
  const { fields, settings } = section;
  const { toPath } = useLocale();
  const { hub } = useSelectedHub(settings.default_hub);
  const pf = useSectionEntries(portfolios, settings.source);
  const hubName = hub?.fields.name ?? fields.no_hub;
  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <CollectionState isPending={pf.isPending} isError={pf.isError} isEmpty={pf.entries.length === 0} onRetry={() => void pf.refetch()}>
          <div className="row ix_gap mt_50">
            {pf.entries.map((entry) => (
              <div key={entry.key} className="col-xl-3 col-md-6">
                <Card
                  kicker={entry.fields.name}
                  footer={
                    entry.fields.volunteer_link ? (
                      <Link className="ix_link" to={toPath(entry.fields.volunteer_link.href)}>
                        {entry.fields.volunteer_link.label}
                      </Link>
                    ) : undefined
                  }
                >
                  <h4 className="ixd_mt8">{entry.fields.flagship}</h4>
                  {entry.fields.focus && <RichText value={fillRich(entry.fields.focus, { hub: hubName })} />}
                </Card>
              </div>
            ))}
          </div>
        </CollectionState>
      </div>
    </section>
  );
}

// plan_pair — "This cycle at a glance" timeline + "How a proposal becomes a grant".
export function PlanPairSection({ section }: { section: SectionData<typeof planPair> }) {
  const { fields, items } = section;
  const milestones = items.filter((item) => item.type === 'milestone');
  const steps = items.filter((item) => item.type === 'step');
  const badges = items.filter((item) => item.type === 'badge');
  return (
    <section className="mt_100">
      <div className="container">
        <div className="row ix_gap">
          <div className="col-lg-6">
            <Card kicker={fields.left_kicker}>
              <h3 className="ixd_mt8">{fields.left_title}</h3>
              <Timeline
                as="ul"
                className="mt_30"
                items={milestones.map((item) => ({ id: item.id, title: item.fields.title, text: item.fields.text, done: item.settings.done }))}
              />
            </Card>
          </div>
          <div className="col-lg-6">
            <Card kicker={fields.right_kicker}>
              <h3 className="ixd_mt8">{fields.right_title}</h3>
              <FlowSteps
                variant="compact"
                className="mt_30"
                steps={steps.map((item, i) => ({ id: item.id, num: String(i + 1), title: item.fields.title, text: item.fields.text }))}
              />
              {fields.badges_title !== undefined && <h4 className="ixd_mt26">{fields.badges_title}</h4>}
              {badges.length > 0 && (
                <div className="ix_chips ixd_mt12">
                  {badges.map((item) => (
                    <Badge key={item.id}>{item.fields.title}</Badge>
                  ))}
                </div>
              )}
              {fields.note !== undefined && <p className="ix_note">{fields.note}</p>}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// proposals_list — published proposals under review, the selected hub's first.
export function ProposalsListSection({ section }: { section: SectionData<typeof proposalsList> }) {
  const { fields, settings } = section;
  const t = useT('site');
  const { locale, toPath } = useLocale();
  const { all, hub } = useSelectedHub(settings.default_hub);
  const pf = useSectionEntries(portfolios, { collection: 'portfolios' });
  const proposals = usePublicProposals({});
  const list = [...(proposals.data ?? [])].sort((a, b) => Number(b.countryKey === hub?.key) - Number(a.countryKey === hub?.key));
  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <CollectionState isPending={proposals.isPending} isError={proposals.isError} isEmpty={list.length === 0} onRetry={() => void proposals.refetch()}>
          <div className="row ix_gap mt_50">
            {list.map((proposal) => {
              const country = all.entries.find((c) => c.key === proposal.countryKey);
              const portfolio = pf.entries.find((p) => p.key === proposal.portfolioKey);
              return (
                <div key={proposal.id} className="col-lg-6">
                  <Card
                    footer={
                      <Link className="ix_link" to={toPath(PATHS.portal.proposal(proposal.id))}>
                        {fields.read_link}
                      </Link>
                    }
                  >
                    <div className="d-flex flex-wrap justify-content-between ixd_gap10">
                      <span className="ix_kicker">
                        {t('grants.proposalKicker', {
                          country: country?.fields.name ?? proposal.countryKey,
                          portfolio: portfolio?.fields.name ?? proposal.portfolioKey,
                          flagship: portfolio?.fields.flagship ?? '',
                        })}
                      </span>
                      {proposal.countryKey === hub?.key && <Badge kind="accent">{fields.your_hub}</Badge>}
                    </div>
                    <h4 className="ixd_mt10">{proposal.title}</h4>
                    <RichText value={fillRich(fields.requested, { amount: formatMoney(proposal.budgetCents, locale) })} />
                  </Card>
                </div>
              );
            })}
          </div>
        </CollectionState>
      </div>
    </section>
  );
}
