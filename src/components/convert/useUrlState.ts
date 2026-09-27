'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * URL-synced UI state without `useSearchParams`.
 *
 * `useSearchParams` forces a Suspense boundary during static prerender, which
 * would drop the island's SSR HTML (roles, blog rows) in favour of a fallback.
 * This store reads `location.search` through useSyncExternalStore instead: the
 * server snapshot is '' (every row rendered, no filter), and the client
 * re-renders once with the real query. Writes go through
 * `history.replaceState` (shallow, no navigation, no server round trip) and
 * notify subscribers; Next's router patches replaceState so its own state
 * stays in sync.
 */

const listeners = new Set<() => void>();
let popstateBound = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!popstateBound && typeof window !== 'undefined') {
    window.addEventListener('popstate', notify);
    popstateBound = true;
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string {
  return window.location.search;
}

function getServerSnapshot(): string {
  return '';
}

/** The current `location.search` ('' on the server and during hydration). */
export function useSearchString(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type UrlParamsUpdater = (params: URLSearchParams) => void;

export interface SetUrlParamsOptions {
  /** Replace the hash; '' removes it; undefined keeps the current one. */
  hash?: string;
}

/** Parsed query params plus a shallow setter that mirrors UI state to the URL. */
export function useUrlParams(): [URLSearchParams, (update: UrlParamsUpdater, opts?: SetUrlParamsOptions) => void] {
  const search = useSearchString();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const setParams = useCallback((update: UrlParamsUpdater, opts?: SetUrlParamsOptions) => {
    if (typeof window === 'undefined') return;
    const next = new URLSearchParams(window.location.search);
    update(next);
    const query = next.toString();
    const hash = opts?.hash === undefined ? window.location.hash : opts.hash ? `#${opts.hash}` : '';
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${hash}`);
    notify();
  }, []);

  return [params, setParams];
}
