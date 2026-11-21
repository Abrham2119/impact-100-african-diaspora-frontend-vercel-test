import { useMemo, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge, Card } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import {
  OrganizerEmailIcon,
  OrganizerNameIcon,
  OrganizerPhoneIcon,
  PostCategoryIcon,
  PostCommentsIcon,
  PostDateIcon,
  RecentPostDateIcon,
  ScheduleDateIcon,
  SearchIcon,
  ScheduleLinkIcon,
  ScheduleLocationIcon,
  ScheduleTimeIcon,
} from '@/components/design/blocks/detailIcons';
import { NotFound } from '@/components/NotFound';
import { TwScope } from '@/components/TwScope';
import { RsvpForm } from '@/features/engagement/components/RsvpForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import type { SectionData } from '../../schemas/defineSection';
import { blogComments, events, news, type eventDetail, type hubPlan, type newsDetail } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsButton } from '../CmsButton';
import { CmsImage } from '../CmsImage';
import { RichText } from '../RichText';
import { CollectionState, SectionHeadingRow } from './shared';

// Event and news detail pages and the events "launch plan", markup verbatim from event.dc.html,
// event_details.dc.html and blog_details.dc.html.

// hub_plan — "2026–27 launch plan": one centred card per US hub (`col-xl` → five in a row).
export function HubPlanSection({ section }: { section: SectionData<typeof hubPlan> }) {
  const { fields, items } = section;
  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <div className="row ix_gap mt_50">
          {items.map((item) => (
            <div key={item.id} className="col-xl col-md-4 col-sm-6">
              <Card className="ixd_text_center" footer={item.fields.cta ? <CmsButton link={item.fields.cta} size="sm" /> : undefined}>
                <Badge kind={item.settings.badge_kind}>{item.fields.badge}</Badge>
                <h4 className="ixd_mt12">{item.fields.name}</h4>
                <p>{item.fields.area}</p>
                {item.fields.note !== undefined && <p className="ix_note">{item.fields.note}</p>}
                <p className="ixd_mt8">
                  <b>{item.fields.launch_label}</b>
                  {` · ${item.fields.launch}`}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One entry of a collection by the route's `:slug` (`undefined` while loading, `null` = 404). */
function useEntryBySlug<E extends { slug: string | null; key: string }>(entries: E[], isPending: boolean) {
  const { slug } = useParams();
  if (isPending) return undefined;
  return entries.find((entry) => entry.slug === slug || entry.key === slug) ?? null;
}

const notFound = (
  <TwScope>
    <NotFound />
  </TwScope>
);

function ScheduleItem({ icon: Icon, label, children }: { icon: ComponentType; label: string; children: ReactNode }) {
  return (
    <li>
      <span>
        <Icon />
      </span>
      <h4>{label}</h4>
      {children}
    </li>
  );
}

// event_detail — /events/:slug
export function EventDetailSection({ section }: { section: SectionData<typeof eventDetail> }) {
  const { fields: c } = section;
  const all = useSectionEntries(events, section.settings.source);
  const entry = useEntryBySlug(all.entries, all.isPending);
  if (entry === null) return notFound;

  return (
    <section className="event_details mt_100">
      <div className="container">
        <CollectionState isPending={all.isPending} isError={all.isError} isEmpty={false} onRetry={() => void all.refetch()}>
          {entry && (
            <div className="row">
              <div className="col-lg-8">
                <div className="event_details_img">
                  <CmsImage media={{ ...entry.media.image, alt: entry.fields.title }} className="img-fluid" lazy={false} />
                </div>
                <div className="event_details_header">
                  <h2>{entry.fields.title}</h2>
                </div>
                {entry.fields.body && (
                  <div className="event_details_text">
                    <RichText value={entry.fields.body} plainLists />
                  </div>
                )}
                <RsvpForm
                  eventKey={entry.key}
                  copy={{
                    kicker: c.rsvp_kicker,
                    title: c.rsvp_title,
                    submit: c.rsvp_submit,
                    login: c.rsvp_login,
                    note: c.rsvp_note,
                    doneTitle: c.rsvp_done_title,
                    doneBody: c.rsvp_done_body,
                  }}
                />
                {c.hub_title !== undefined && (
                  <Card tone="soft" className="mt_30 ixd_h_auto">
                    <div className="d-flex flex-wrap justify-content-between align-items-center ixd_gap16">
                      <div>
                        {c.hub_kicker !== undefined && <p className="ix_kicker">{c.hub_kicker}</p>}
                        <h4 className="ixd_mt6">{c.hub_title}</h4>
                      </div>
                      {c.hub_cta && <CmsButton link={c.hub_cta} size="sm" />}
                    </div>
                  </Card>
                )}
              </div>
              <div className="col-lg-4 ixd_relative">
                <div className="sticky_sidebar">
                  <div className="event_sidebar">
                    <div className="event_schedule mt_0">
                      <h3>{c.schedule_title}</h3>
                      <ul>
                        <ScheduleItem icon={ScheduleDateIcon} label={c.label_date}>
                          <p>{entry.fields.date_label}</p>
                        </ScheduleItem>
                        {entry.data.time_label !== undefined && (
                          <ScheduleItem icon={ScheduleTimeIcon} label={c.label_time}>
                            <p>{entry.data.time_label}</p>
                          </ScheduleItem>
                        )}
                        <ScheduleItem icon={ScheduleLocationIcon} label={c.label_location}>
                          <p>{entry.fields.place}</p>
                        </ScheduleItem>
                        {entry.data.link_url !== undefined && (
                          <ScheduleItem icon={ScheduleLinkIcon} label={c.label_link}>
                            <a href={entry.data.link_url} target="_blank" rel="noopener">
                              {entry.data.link_url}
                            </a>
                          </ScheduleItem>
                        )}
                      </ul>
                    </div>
                    {entry.data.organizer_name !== undefined && (
                      <div className="event_organizer">
                        <h3>{c.organizer_title}</h3>
                        <ul>
                          <ScheduleItem icon={OrganizerNameIcon} label={c.label_name}>
                            <p>{entry.data.organizer_name}</p>
                          </ScheduleItem>
                          {entry.data.organizer_email !== undefined && (
                            <ScheduleItem icon={OrganizerEmailIcon} label={c.label_email}>
                              <p>{entry.data.organizer_email}</p>
                            </ScheduleItem>
                          )}
                          {entry.data.organizer_phone !== undefined && (
                            <ScheduleItem icon={OrganizerPhoneIcon} label={c.label_phone}>
                              <p>{entry.data.organizer_phone}</p>
                            </ScheduleItem>
                          )}
                        </ul>
                      </div>
                    )}
                    {entry.data.map_url !== undefined && (
                      <div className="event_map">
                        <h3>{c.map_title}</h3>
                        <a className="dc_map" href={entry.data.map_url} target="_blank" rel="noopener">
                          <i className="fas fa-map-marker-alt" aria-hidden="true" />
                          {` ${entry.fields.map_label ?? ''}`}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollectionState>
      </div>
    </section>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

// news_detail — /news/:slug: the story, tags + share, author box, sample comments and the
// comment form (inert: there is no comments API yet, decision of Step 6 — as the design's noSubmit).
export function NewsDetailSection({ section }: { section: SectionData<typeof newsDetail> }) {
  const { fields: c, items: networks } = section;
  const t = useT('site');
  const tf = useT('forms');
  const { toPath } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const all = useSectionEntries(news, { ...section.settings.source, limit: undefined, paginate: false });
  const comments = useSectionEntries(blogComments, section.settings.comments);
  const sidebar = useMemo(() => {
    const byDate = [...all.entries].sort((a, b) => b.data.published_on.localeCompare(a.data.published_on));
    const counts = new Map<string, number>();
    const tags = new Map<string, { label: string; href: string }>();
    for (const story of all.entries) {
      counts.set(story.fields.category, (counts.get(story.fields.category) ?? 0) + 1);
      for (const tag of story.fields.tags ?? []) tags.set(tag.label, tag);
    }
    return { recent: byDate.slice(0, section.settings.recent_limit), categories: [...counts], tags: [...tags.values()] };
  }, [all.entries, section.settings.recent_limit]);
  const newsSearch = (q: string) => toPath(`${PATHS.public.news}?q=${encodeURIComponent(q)}`);
  const entry = useEntryBySlug(all.entries, all.isPending);
  const pageUrl = typeof window === 'undefined' ? pathname : `${window.location.origin}${pathname}`;
  const iconFor = useMemo(() => new Map(networks.map((n) => [n.fields.label, n.settings.icon])), [networks]);
  if (entry === null) return notFound;

  const social = (links: Array<{ label: string; href: string; icon: string | undefined }>) => (
    <>
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} aria-label={link.label} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener">
            <i aria-hidden="true" className={link.icon} />
          </a>
        </li>
      ))}
    </>
  );

  return (
    <section className="blog_details mt_100">
      <div className="container">
        <CollectionState isPending={all.isPending} isError={all.isError} isEmpty={false} onRetry={() => void all.refetch()}>
          {entry && (
            <div className="row">
              <div className="col-lg-8">
                <div className="blog_details_area">
                  <div className="blog_details_thumb">
                    <CmsImage media={entry.media.detail_image ?? entry.media.image} lazy={false} />
                  </div>
                  <div className="blog_details_header">
                    <ul className="d-flex flex-wrap">
                      <li>
                        <span>
                          <PostDateIcon />
                        </span>
                        {` ${entry.fields.date_label}`}
                      </li>
                      <li>
                        <span>
                          <PostCategoryIcon />
                        </span>
                        {` ${entry.fields.category}`}
                      </li>
                      <li>
                        <span>
                          <PostCommentsIcon />
                        </span>
                        {` ${t('news.comments', { count: pad2(comments.entries.length) })}`}
                      </li>
                    </ul>
                    <h2>{entry.fields.title}</h2>
                  </div>
                  <div className="blog_details_text">
                    {entry.fields.body_before && <RichText value={entry.fields.body_before} plainLists />}
                    {entry.fields.quote !== undefined && (
                      <div className="details_quot_text">
                        {entry.fields.quote}
                        {entry.fields.quote_author !== undefined && <h4>{entry.fields.quote_author}</h4>}
                      </div>
                    )}
                    {entry.fields.body_after && <RichText value={entry.fields.body_after} plainLists />}
                  </div>
                  <div className="blog_det_tags_share d-flex flex-wrap mt_50">
                    {entry.fields.tags && (
                      <ul className="tags d-flex flex-wrap align-items-center">
                        <li>
                          <span>{c.tags_label}</span>
                        </li>
                        {entry.fields.tags.map((tag) => (
                          <li key={tag.label}>
                            <Link to={tag.href === '#' ? newsSearch(tag.label) : toPath(tag.href)}>{tag.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <ul className="share d-flex flex-wrap align-items-center">
                      <li>
                        <span>{c.share_label}</span>
                      </li>
                      {social(
                        networks.map((n) => ({
                          label: n.fields.label,
                          href: n.settings.href.replace('{url}', encodeURIComponent(pageUrl)),
                          icon: n.settings.icon,
                        })),
                      )}
                    </ul>
                  </div>
                  {entry.fields.author_name !== undefined && (
                    <div className="blog_det_author">
                      {entry.media.author_photo && (
                        <div className="img">
                          <CmsImage media={entry.media.author_photo} className="img-fluid" />
                        </div>
                      )}
                      <div className="text">
                        <h3>{entry.fields.author_name}</h3>
                        {entry.fields.author_role !== undefined && <h5>{entry.fields.author_role}</h5>}
                        {entry.fields.author_bio !== undefined && <p>{entry.fields.author_bio}</p>}
                        {entry.fields.author_links && (
                          <ul>{social(entry.fields.author_links.map((l) => ({ label: l.label, href: l.href, icon: iconFor.get(l.label) })))}</ul>
                        )}
                      </div>
                    </div>
                  )}
                  {comments.entries.length > 0 && (
                    <div className="blog_comment_area mt_75">
                      <h2>{c.comments_title}</h2>
                      {comments.entries.map((comment) => (
                        <div key={comment.key} className="blog_single_comment">
                          <div className="img">
                            <CmsImage media={comment.media.avatar} className="img-fluid" />
                          </div>
                          <div className="text">
                            <h4>
                              {comment.fields.name} <span> {comment.fields.date_label}</span>
                            </h4>
                            <p>{comment.fields.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="blog_comment_input_area mt_75">
                    <h2>{c.form_title}</h2>
                    <p>{c.form_note}</p>
                    <form onSubmit={(event) => event.preventDefault()}>
                      <div className="row">
                        <div className="col-xl-6">
                          <input placeholder={tf('comment.name')} type="text" aria-label={tf('comment.name')} />
                        </div>
                        <div className="col-xl-6">
                          <input placeholder={tf('comment.email')} type="email" aria-label={tf('comment.email')} />
                        </div>
                        <div className="col-xl-12">
                          <textarea placeholder={tf('comment.reply')} rows={7} aria-label={tf('comment.reply')} />
                        </div>
                        <div className="col-12">
                          <div className="form-check">
                            <input className="form-check-input" id="comment-remember" type="checkbox" />
                            <label className="form-check-label" htmlFor="comment-remember">
                              {c.form_remember}
                            </label>
                          </div>
                          <button className="common_btn" type="submit">
                            {c.form_submit}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 ixd_relative">
                <div className="sticky_sidebar">
                  <div className="blog_sidebar">
                    <div className="sidebar_search mt_0">
                      <h3>{c.search_title}</h3>
                      <form
                        role="search"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const q = new FormData(event.currentTarget).get('q');
                          if (typeof q === 'string' && q.trim()) navigate(newsSearch(q.trim()));
                        }}
                      >
                        <input name="q" placeholder={tf('search.placeholder')} type="text" aria-label={tf('search.label')} />
                        <button type="submit" aria-label={tf('search.label')}>
                          <SearchIcon />
                        </button>
                      </form>
                    </div>
                    <div className="sidebar_recent_post">
                      <h3>{c.recent_title}</h3>
                      <ul className="d-flex flex-wrap">
                        {sidebar.recent.map((story) => {
                          const to = toPath(PATHS.public.newsDetail(story.slug ?? story.key));
                          return (
                            <li key={story.key}>
                              <div className="img">
                                <CmsImage media={story.media.image} className="img-fluid" />
                              </div>
                              <div className="text">
                                <p>
                                  <span>
                                    <RecentPostDateIcon />
                                  </span>
                                  {` ${story.fields.date_label}`}
                                </p>
                                <Link className="title" to={to}>
                                  {story.fields.title}
                                </Link>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="sidebar_blog_category">
                      <h3>{c.categories_title}</h3>
                      <ul>
                        {sidebar.categories.map(([category, count]) => (
                          <li key={category}>
                            <Link to={newsSearch(category)}>
                              {`${category} `}
                              <span>{t('news.categoryCount', { count: pad2(count) })}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {sidebar.tags.length > 0 && (
                      <div className="sidebar_blog_tags">
                        <h3>{c.sidebar_tags_title}</h3>
                        <ul className="d-flex flex-wrap">
                          {sidebar.tags.map((tag) => (
                            <li key={tag.label}>
                              <Link to={tag.href === '#' ? newsSearch(tag.label) : toPath(tag.href)}>{tag.label}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollectionState>
      </div>
    </section>
  );
}
