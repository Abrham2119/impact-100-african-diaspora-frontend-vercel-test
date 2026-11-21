import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Every new page opens at the top, wherever the link was clicked (header, body or footer).
// - Keyed on the pathname only: search-param changes (filters, tabs, `?page=`) keep the
//   reader's position, matching `preventScrollReset` in useSearchParamState.
// - Back/forward (POP) is left to the browser so the previous position is restored.
// - A plain anchor (`#section`) is left alone so in-page links still land on their target.
// - `behavior: 'instant'` overrides the global `scroll-behavior: smooth`, so the new page
//   appears at the top instead of animating up from the footer.
export function useScrollToTopOnNavigate(): void {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Only a pathname change counts as a new page (hash/navigationType are read, not tracked).
  }, [pathname]);
}
