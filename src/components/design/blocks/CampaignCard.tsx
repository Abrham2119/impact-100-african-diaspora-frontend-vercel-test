import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../primitives/Button';
import { ProgressBar } from '../primitives/ProgressBar';

// Campaign card + progress bar (Components board §4), markup verbatim:
//   <div class="campaign_card"><a class="img" href="#"><img src="…" alt="…" class="img-fluid w-100"><span>education</span></a>
//     <div class="text"><div class="donate_progressbar">…</div><p class="rising_goal"><span>Raised …</span><span>Goals …</span></p>
//     <a class="title" href="#">…</a><hr><a href="#" class="common_btn">donate now</a></div></div>
// All text arrives pre-formatted (money via Intl in the feature layer).
export interface CampaignCardProps {
  href: string;
  image: { src: string; alt: string };
  /** label over the image */
  tag?: ReactNode;
  progressLabel: ReactNode;
  percent: number;
  raisedLabel: ReactNode;
  goalLabel: ReactNode;
  title: ReactNode;
  cta: { label: ReactNode; to: string };
}

export function CampaignCard({ href, image, tag, progressLabel, percent, raisedLabel, goalLabel, title, cta }: CampaignCardProps) {
  return (
    <div className="campaign_card">
      <Link className="img" to={href}>
        <img src={image.src} alt={image.alt} className="img-fluid w-100" />
        {tag !== undefined && <span>{tag}</span>}
      </Link>
      <div className="text">
        <ProgressBar label={progressLabel} percent={percent} />
        <p className="rising_goal">
          <span>{raisedLabel}</span>
          <span>{goalLabel}</span>
        </p>
        <Link className="title" to={href}>
          {title}
        </Link>
        <hr />
        <ButtonLink to={cta.to}>{cta.label}</ButtonLink>
      </div>
    </div>
  );
}
