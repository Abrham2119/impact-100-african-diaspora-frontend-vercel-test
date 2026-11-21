import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// The design deep-links with hash params (`contact#topic=sponsorship`, `volunteer#area=us`,
// `event_details#e=3` …). Pages read search params only (ARCHITECTURE.md §5.1), so a hash
// made of `k=v` pairs is rewritten once to the query string with `replace`; old and shared
// links keep working. A plain anchor (`#section`) is left alone.
const HASH_PARAMS = /^#[^=&#]+=[^&#]*(&[^=&#]+=[^&#]*)*$/;

export function useLegacyHashParams(): void {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!HASH_PARAMS.test(hash)) return;
    const params = new URLSearchParams(search);
    new URLSearchParams(hash.slice(1)).forEach((value, key) => {
      if (!params.has(key)) params.set(key, value);
    });
    navigate({ pathname, search: `?${params.toString()}`, hash: '' }, { replace: true });
  }, [pathname, search, hash, navigate]);
}
