import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

// Page banner with title and breadcrumb trail (every public page), markup verbatim:
//   <section class="breadcrumb bg_breadcrumb"><div class="breadcrumb_overlay"><div class="container"><div class="row">
//     <div class="col-12"><div class="breadcrumb_text"><h1>About Us</h1><ul><li><a href="/">Home</a></li><li>About Us</li></ul>
//     </div></div></div></div></div></section>
// The default background image comes from `.bg_breadcrumb` (src/styles/app.css);
// a CMS image replaces it per page (inline, because the URL is data).
export interface Crumb {
  label: ReactNode;
  /** omit for the current page (rendered as plain text) */
  to?: string;
}

export interface BreadcrumbBannerProps {
  title: ReactNode;
  trail: Crumb[];
  backgroundUrl?: string;
}

export function BreadcrumbBanner({ title, trail, backgroundUrl }: BreadcrumbBannerProps) {
  return (
    <section className="breadcrumb bg_breadcrumb" style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}>
      <div className="breadcrumb_overlay">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="breadcrumb_text">
                <h1>{title}</h1>
                <ul>
                  {trail.map((crumb, index) => (
                    <li key={index} aria-current={crumb.to === undefined ? 'page' : undefined}>
                      {crumb.to !== undefined ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
