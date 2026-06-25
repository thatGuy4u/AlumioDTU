import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    media.addEventListener('change', handler);
    setMatches(media.matches);
    return () => media.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Viewports that use the slide-out hamburger nav instead of the fixed sidebar */
export const MOBILE_NAV_QUERY = '(max-width: 1024px)';

export function useMobileNav() {
  return useMediaQuery(MOBILE_NAV_QUERY);
}
