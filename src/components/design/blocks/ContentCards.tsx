import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/lib/classes';
import { ButtonLink } from '../primitives/Button';
import {
  BlogAuthorIcon,
  BlogCalendarIcon,
  BlogTagIcon,
  CalendarIcon,
  CounterAwardsIcon,
  CounterProjectsIcon,
  CounterReviewsIcon,
  CounterTeamIcon,
  PinIcon,
} from './icons';

// Item cards of the template's content blocks, markup verbatim from index.dc.html and the
// list pages. Props only (copy, images and links arrive resolved); no data fetching.

export interface CardImage {
  src: string;
  alt: string;
}

const Img = ({ image, className = 'img-fluid w-100' }: { image: CardImage; className?: string }) => (
  <img src={image.src} alt={image.alt} className={className} loading="lazy" />
);

// `.category_item` (home "Browse by Category")
export function CategoryItem({ to, image, name }: { to: string; image: CardImage; name: ReactNode }) {
  return (
    <Link className="category_item" to={to}>
      <div className="img">
        <Img image={image} />
      </div>
      <h3>{name}</h3>
    </Link>
  );
}

// `.service_item category_<n>` (home/about "Where we sit")
export function ServiceItem(props: {
  index: number;
  to: string;
  icon: CardImage;
  kicker?: ReactNode;
  title: ReactNode;
  body: ReactNode;
  readMore: ReactNode;
}) {
  return (
    <div className={`service_item category_${props.index + 1}`}>
      <span className="icon">
        <Img image={props.icon} />
      </span>
      {props.kicker !== undefined && <span className="ix_kicker ixd_kicker_block">{props.kicker}</span>}
      <Link className="title" to={props.to}>
        {props.title}
      </Link>
      <p>{props.body}</p>
      <Link className="read_btn" to={props.to}>
        {props.readMore} <i aria-hidden="true" className="fas fa-arrow-up" />
      </Link>
    </div>
  );
}

export const COUNTER_ICON = {
  projects: CounterProjectsIcon,
  team: CounterTeamIcon,
  reviews: CounterReviewsIcon,
  awards: CounterAwardsIcon,
} as const;

// `.counter_item` (home counters, about portfolios)
export function CounterItem({ icon, value, label }: { icon: keyof typeof COUNTER_ICON; value: ReactNode; label: ReactNode }) {
  const Icon = COUNTER_ICON[icon];
  return (
    <div className="counter_item">
      <div className="icon">
        <Icon />
      </div>
      <h3 className="counter">{value}</h3>
      <p>{label}</p>
    </div>
  );
}

// `.wssus__event_item` (home events slider; the /events grid uses `img-fluid` only)
export function EventCard(props: {
  grid?: boolean;
  to: string;
  image: CardImage;
  date: ReactNode;
  place: ReactNode;
  title: ReactNode;
  summary: ReactNode;
  cta: ReactNode;
}) {
  return (
    <div className="wssus__event_item">
      <Link to={props.to} className="ix_ev_link" aria-hidden="true" tabIndex={-1}>
        <Img image={props.image} className={props.grid ? 'img-fluid' : 'img-fluid w-100'} />
      </Link>
      <div className="text">
        <ul>
          <li>
            <span>
              <CalendarIcon />
            </span>
            {props.date}
          </li>
          <li>
            <span>
              <PinIcon />
            </span>
            <em className="ixd_em_plain">{props.place}</em>
          </li>
        </ul>
        <Link className="title" to={props.to}>
          {props.title}
        </Link>
        <p className="ixd_event_text">{props.summary}</p>
        <ButtonLink size="sm" to={props.to}>
          {props.cta}
        </ButtonLink>
      </div>
    </div>
  );
}

// `.testimonial_item` (home slider, /about/testimonials)
export function TestimonialCard({ rating, quote, avatar, name, role }: {
  rating: number;
  quote: ReactNode;
  avatar: CardImage;
  name: ReactNode;
  role: ReactNode;
}) {
  return (
    <div className="testimonial_item">
      <p className="rating">
        {Array.from({ length: rating }, (_, i) => (
          <i key={i} aria-hidden="true" className="fas fa-star" />
        ))}
      </p>
      <p className="description">{quote}</p>
      <div className="testimonial_footer">
        <Img image={avatar} />
        <h3>
          {name} <span>{role}</span>
        </h3>
      </div>
    </div>
  );
}

// `.wsis__single_volunteer` (volunteer/leadership slider; grid uses `img-fluid` only)
export function PersonCard({ photo, name, role, grid = false }: { photo: CardImage; name: ReactNode; role: ReactNode; grid?: boolean }) {
  return (
    <div className="wsis__single_volunteer">
      <div className="img">
        <Img image={photo} className={grid ? 'img-fluid' : 'img-fluid w-100'} />
      </div>
      <div className="text">
        <h4>{name}</h4>
        <p>{role}</p>
      </div>
    </div>
  );
}

// `.single_blog` — home variant (read_btn) and the /news variant (common_btn, Step 6).
export function BlogCard(props: {
  to: string;
  image: CardImage;
  date: ReactNode;
  /** second meta item: the author (home template) or the category (/news) */
  meta: { kind: 'author' | 'category'; label: ReactNode };
  title: ReactNode;
  excerpt: ReactNode;
  readMore: ReactNode;
  variant: 'home' | 'page';
}) {
  return (
    <div className="single_blog">
      <Link className="img" to={props.to}>
        <Img image={props.image} />
      </Link>
      <div className="text">
        <ul className="d-flex flex-wrap">
          <li>
            <BlogCalendarIcon /> {props.date}
          </li>
          <li>
            {props.meta.kind === 'author' ? <BlogAuthorIcon /> : <BlogTagIcon />} {props.meta.label}
          </li>
        </ul>
        <Link className="title" to={props.to}>
          {props.title}
        </Link>
        <p>{props.excerpt}</p>
        {props.variant === 'home' ? (
          <Link className="read_btn" to={props.to}>
            {props.readMore} <i aria-hidden="true" className="fas fa-arrow-up" />
          </Link>
        ) : (
          <ButtonLink to={props.to}>{props.readMore}</ButtonLink>
        )}
      </div>
    </div>
  );
}

// `.donor_list_item` (/about/donors)
export function DonorCard({ amount, name, location }: { amount: ReactNode; name: ReactNode; location: ReactNode }) {
  return (
    <div className="donor_list_item">
      <div className="pay">{amount}</div>
      <h3>{name}</h3>
      <p>{location}</p>
    </div>
  );
}

// `.ix_charter_sec` — a numbered charter / privacy section.
export function CharterSection({ id, num, title, className, children }: {
  id?: string;
  num: ReactNode;
  title: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx('ix_charter_sec', className)} id={id}>
      <h3>
        <span>{num}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}
