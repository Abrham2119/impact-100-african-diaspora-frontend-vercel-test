import { useId, useState, type ComponentType, type FormEvent, type MouseEvent } from 'react';
import type { FooterContactItem, FooterStat, PublicFooter } from '@/domain/entities/navigation.types';
import { ChromeAnchor } from './ChromeAnchor';
import { FooterDollarIcon, FooterMailIcon, FooterPhoneIcon, FooterPinIcon, UserIcon } from './icons';

// Site footer (stats, link columns, contact, newsletter sign-up, socials, bottom bar), markup
// verbatim from design-reference/snapshots/index.html. One component for every public page.
// The newsletter label is visually hidden with the design's `ix_sr` utility (the snapshot
// inlines the same clip rule). Submitting — Enter in the field or the paper-plane link —
// calls `onSubscribe`; the API call and validation are wired in Step 13.

export interface FooterProps {
  content: PublicFooter;
  onSubscribe: (email: string) => void;
  /** wrapper classes; the Components board uses its own ("mt_30 cmp_footer") */
  className?: string;
}

const STAT_ICON: Record<FooterStat['icon'], ComponentType> = {
  user: UserIcon,
  dollar: FooterDollarIcon,
};

const CONTACT_ICON: Record<FooterContactItem['icon'], ComponentType> = {
  mail: FooterMailIcon,
  phone: FooterPhoneIcon,
  pin: FooterPinIcon,
};

export function Footer({ content, onSubscribe, className = 'mt_100 bg_footer' }: FooterProps) {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const { logo, stats, columns, contact, newsletter, socials, copyright, legal } = content;

  const submit = (event: FormEvent<HTMLFormElement> | MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onSubscribe(email);
  };

  return (
    <footer className={className}>
      <div className="footer_overlay pt_80">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer_top">
                <ChromeAnchor className="footer_logo" to={logo.to}>
                  <img src={logo.image.src} alt={logo.image.alt} className="img-fluid w-100" />
                </ChromeAnchor>
                <ul>
                  {stats.map((stat) => {
                    const Icon = STAT_ICON[stat.icon];
                    return (
                      <li key={stat.label}>
                        <div className="icon">
                          <Icon />
                        </div>
                        <h4>{stat.value}</h4>
                        <p>{stat.label}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="row justify-content-between">
            {columns.map((column) => (
              <div className="col-lg-2 col-sm-6" key={column.title}>
                <div className="footer_link">
                  <h3>{column.title}</h3>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.to}>
                        <ChromeAnchor to={link.to} external={link.external}>
                          {link.label}
                        </ChromeAnchor>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="col-lg-3 col-md-6">
              <div className="footer_contact">
                <h3>{contact.title}</h3>
                <ul>
                  {contact.items.map((item) => {
                    const Icon = CONTACT_ICON[item.icon];
                    return (
                      <li key={item.text}>
                        <span>
                          <Icon />
                        </span>
                        {item.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer_newsletter">
                <h3>{newsletter.title}</h3>
                <form onSubmit={submit}>
                  <label htmlFor={inputId} className="ix_sr">
                    {newsletter.label}
                  </label>
                  <input
                    id={inputId}
                    type="email"
                    placeholder={newsletter.placeholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <ChromeAnchor className="ix_nl_btn" to={newsletter.to} aria-label={newsletter.submitLabel} onClick={submit}>
                    <i className="far fa-paper-plane" aria-hidden="true" />
                  </ChromeAnchor>
                </form>
                <ul>
                  {socials.map((social) => (
                    <li key={social.label}>
                      <ChromeAnchor to={social.to} aria-label={social.label}>
                        <i className={social.icon} aria-hidden="true" />
                      </ChromeAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="footer_botton">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer_botton_text">
                  <p>{copyright}</p>
                  <ul>
                    {legal.map((link) => (
                      <li key={link.to}>
                        <ChromeAnchor to={link.to}>{link.label}</ChromeAnchor>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
