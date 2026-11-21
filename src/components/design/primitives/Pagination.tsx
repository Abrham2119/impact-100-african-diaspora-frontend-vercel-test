import { Link } from 'react-router-dom';
import { cx } from '@/lib/classes';

// Template pagination ("01 02 03" with arrow links).
//   <div class="pagination mt_50"><nav aria-label="…"><ul class="pagination justify-content-center">
//     <li class="page-item"><a aria-label="Previous" class="page-link" href="#"><i aria-hidden="true" class="far fa-arrow-left"></i></a></li>
//     <li class="page-item"><a class="page-link active" href="#">01</a></li>…
// Pages are real links (deep-linkable `?page=`), built by `hrefFor`.
export interface PaginationLabels {
  /** nav landmark name */
  nav: string;
  previous: string;
  next: string;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  labels: PaginationLabels;
  /** design spacing class on the wrapper, e.g. "mt_50" */
  className?: string;
  /** how many page numbers to show around the current one */
  window?: number;
}

const pad = (n: number): string => String(n).padStart(2, '0');

export function Pagination({ page, totalPages, hrefFor, labels, className, window = 2 }: PaginationProps) {
  if (totalPages <= 1) return null;
  const first = Math.max(1, Math.min(page - window, totalPages - 2 * window));
  const last = Math.min(totalPages, first + 2 * window);
  const pages: number[] = [];
  for (let p = first; p <= last; p += 1) pages.push(p);
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <div className={cx('pagination', className)}>
      <nav aria-label={labels.nav}>
        <ul className="pagination justify-content-center">
          <li className="page-item">
            <Link
              aria-label={labels.previous}
              className="page-link"
              to={hrefFor(Math.max(1, page - 1))}
              aria-disabled={atStart || undefined}
              tabIndex={atStart ? -1 : undefined}
            >
              <i aria-hidden="true" className="far fa-arrow-left" />
            </Link>
          </li>
          {pages.map((p) => (
            <li className="page-item" key={p}>
              <Link className={cx('page-link', p === page && 'active')} to={hrefFor(p)} aria-current={p === page ? 'page' : undefined}>
                {pad(p)}
              </Link>
            </li>
          ))}
          <li className="page-item">
            <Link
              aria-label={labels.next}
              className="page-link"
              to={hrefFor(Math.min(totalPages, page + 1))}
              aria-disabled={atEnd || undefined}
              tabIndex={atEnd ? -1 : undefined}
            >
              <i aria-hidden="true" className="far fa-arrow-right" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
