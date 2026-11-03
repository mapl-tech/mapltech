'use client';

import { useSyncExternalStore } from 'react';

/**
 * On /pricing, the brief link that carries the visitor's own estimate, once
 * they have one: the estimator mirrors every answer into the page's query
 * string (estimateUrlStore), and the brief reads the same keys, so the link is
 * /contact-us plus that query. Null anywhere else, or before any answer.
 *
 * The event name is estimateUrlStore's, kept as a string here so the header
 * and the phone bar do not pull the estimator into every page's bundle.
 */
const ESTIMATE_EVENT = 'mapl:estimate-url';

function subscribe(onChange: () => void) {
  window.addEventListener(ESTIMATE_EVENT, onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener(ESTIMATE_EVENT, onChange);
    window.removeEventListener('popstate', onChange);
  };
}

const readSearch = () => window.location.search;

export function useEstimateBriefHref(pathname: string): string | null {
  const search = useSyncExternalStore(subscribe, readSearch, () => '');
  if (pathname !== '/pricing' || !/(?:^|[?&])svc=/.test(search)) return null;
  return `/contact-us${search}`;
}
