/**
 * URL-backed state for the Scope Estimator.
 *
 * The query string is the single source of truth: every control writes the
 * next input with `history.replaceState` (the App Router's shallow-routing
 * primitive: Next patches it to sync `useSearchParams`, and unlike
 * `router.replace` it never re-fetches the page's RSC payload) and then
 * notifies subscribers, so `useSyncExternalStore` re-renders the island in
 * the same tick. SSR and hydration see the server snapshot ('' = defaults);
 * the client applies the real URL right after hydration, so a shared link
 * renders without a mismatch.
 */
import {
  ESTIMATE_SERVICES,
  TOGGLE_OPTIONS,
  encodeEstimateParams,
  type EstimateInput,
} from '@/lib/estimate';

const CHANGE_EVENT = 'mapl:estimate-url';

/** Every query key the estimator owns; anything else in the URL (utm_*, ref) is preserved. */
const ESTIMATE_KEYS = new Set<string>([
  'svc',
  'size',
  'support',
  'timeline',
  'ecommerce',
  'designsupplied',
  ...TOGGLE_OPTIONS.map((toggle) => toggle.param),
  ...ESTIMATE_SERVICES.map((service) => `size.${service}`),
]);

export function subscribeEstimateUrl(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function readEstimateSearch(): string {
  return window.location.search;
}

export function readEstimateSearchServer(): string {
  return '';
}

/**
 * Mirror an input to the URL (shallow) and notify the estimator.
 * `hash` replaces the current fragment when given ('#estimator').
 */
export function writeEstimateUrl(input: Partial<EstimateInput>, opts?: { hash?: string }): string {
  const params = new URLSearchParams(window.location.search);
  for (const key of Array.from(params.keys())) {
    if (ESTIMATE_KEYS.has(key)) params.delete(key);
  }
  new URLSearchParams(encodeEstimateParams(input)).forEach((value, key) => params.set(key, value));

  const query = params.toString().replace(/%2C/gi, ',');
  const hash = opts?.hash ?? window.location.hash;
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${hash}`;

  // `null` state lets Next's patched replaceState copy its own internals and
  // sync the router; passing the existing state object would bypass that.
  window.history.replaceState(null, '', url);
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return url;
}
