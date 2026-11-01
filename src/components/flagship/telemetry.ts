'use client';

import { useEffect, useState } from 'react';

/**
 * Real numbers about the page the visitor is reading, measured in their own
 * browser. Nothing is estimated or defaulted: a metric the browser does not
 * expose (Safari has no LCP or layout-shift entries, for example) stays
 * `null`, and the UI leaves it out instead of inventing a value.
 */
export interface Telemetry {
  /** Largest Contentful Paint, ms (Chromium, Firefox). */
  lcp: number | null;
  /** First Contentful Paint, ms (all modern browsers). */
  fcp: number | null;
  /** Cumulative Layout Shift so far, unitless (Chromium). */
  cls: number | null;
  /** Time to first byte, ms. */
  ttfb: number | null;
  /** Requests made by this page so far, including the document. */
  requests: number | null;
  /** Bytes over the network so far (compressed), including the document. */
  transferBytes: number | null;
  /** Requests answered from the browser cache. */
  cachedRequests: number | null;
  /** schema.org types found in this page's JSON-LD, most frequent first. */
  schemaTypes: readonly string[];
  /** Questions in this page's FAQPage JSON-LD. */
  faqCount: number | null;
  /** Edge location that served the document (Vercel `x-vercel-id`), if any. */
  edge: string | null;
  /** Whether the edge served the document from its cache (`x-vercel-cache`). */
  edgeCache: string | null;
  h1Count: number | null;
  imageCount: number | null;
  /** The first requests of this visit as a waterfall: start and width in % of the span. */
  waterfall: readonly { name: string; start: number; width: number }[];
}

export const EMPTY_TELEMETRY: Telemetry = {
  lcp: null,
  fcp: null,
  cls: null,
  ttfb: null,
  requests: null,
  transferBytes: null,
  cachedRequests: null,
  schemaTypes: [],
  faqCount: null,
  edge: null,
  edgeCache: null,
  h1Count: null,
  imageCount: null,
  waterfall: [],
};

/** Vercel edge network codes → the city a visitor would recognise. */
const EDGE_CITIES: Record<string, string> = {
  yul1: 'Montréal',
  iad1: 'Washington, D.C.',
  cle1: 'Cleveland',
  sfo1: 'San Francisco',
  pdx1: 'Portland',
  lhr1: 'London',
  dub1: 'Dublin',
  cdg1: 'Paris',
  fra1: 'Frankfurt',
  arn1: 'Stockholm',
  gru1: 'São Paulo',
  hnd1: 'Tokyo',
  kix1: 'Osaka',
  icn1: 'Seoul',
  hkg1: 'Hong Kong',
  sin1: 'Singapore',
  syd1: 'Sydney',
  bom1: 'Mumbai',
  cpt1: 'Cape Town',
  dxb1: 'Dubai',
};

function collectSchema(): { types: string[]; faq: number | null } {
  const counts = new Map<string, number>();
  let faq: number | null = null;
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    const record = node as Record<string, unknown>;
    const type = record['@type'];
    const types = Array.isArray(type) ? type : type ? [type] : [];
    for (const t of types) if (typeof t === 'string') counts.set(t, (counts.get(t) ?? 0) + 1);
    if (types.includes('FAQPage') && Array.isArray(record.mainEntity)) faq = record.mainEntity.length;
    for (const value of Object.values(record)) if (value && typeof value === 'object') visit(value);
  };
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      visit(JSON.parse(script.textContent ?? ''));
    } catch {
      /* a malformed block is skipped, never guessed at */
    }
  });
  const types = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  return { types, faq };
}

function collectWaterfall(): Telemetry['waterfall'] {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const entries = [...(nav ? [nav] : []), ...(performance.getEntriesByType('resource') as PerformanceResourceTiming[])]
    .filter((e) => e.duration > 0)
    .slice(0, 9);
  const end = Math.max(1, ...entries.map((e) => e.startTime + e.duration));
  return entries.map((e) => ({
    name: e.entryType === 'navigation' ? 'document' : (e as PerformanceResourceTiming).initiatorType,
    start: (e.startTime / end) * 100,
    width: Math.max(2, (e.duration / end) * 100),
  }));
}

function collectNetwork(): Pick<Telemetry, 'ttfb' | 'requests' | 'transferBytes' | 'cachedRequests' | 'waterfall'> {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const entries: (PerformanceResourceTiming | PerformanceNavigationTiming)[] = nav ? [nav, ...resources] : resources;
  // transferSize is 0 for cross-origin resources without Timing-Allow-Origin; those
  // are counted as requests but contribute no bytes, so the total is a floor, never inflated.
  const transferBytes = entries.reduce((sum, e) => sum + (e.transferSize || 0), 0);
  const cachedRequests = entries.filter((e) => e.transferSize === 0 && e.decodedBodySize > 0).length;
  return {
    ttfb: nav && nav.responseStart > 0 ? nav.responseStart : null,
    requests: entries.length || null,
    transferBytes: transferBytes || null,
    cachedRequests,
    waterfall: collectWaterfall(),
  };
}

/**
 * Starts measuring when `enabled` turns true (the section is near) and keeps
 * LCP/CLS current until the visitor interacts, as the browser does.
 */
export function usePageTelemetry(enabled: boolean): Telemetry {
  const [state, setState] = useState<Telemetry>(EMPTY_TELEMETRY);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('performance' in window)) return;
    let cancelled = false;
    const observers: PerformanceObserver[] = [];
    const patch = (next: Partial<Telemetry>) => {
      if (!cancelled) setState((prev) => ({ ...prev, ...next }));
    };

    const { types, faq } = collectSchema();
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    patch({
      ...collectNetwork(),
      fcp: fcpEntry ? fcpEntry.startTime : null,
      schemaTypes: types,
      faqCount: faq,
      h1Count: document.querySelectorAll('h1').length,
      imageCount: document.images.length,
    });

    const supported = PerformanceObserver.supportedEntryTypes ?? [];
    if (supported.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) patch({ lcp: last.startTime });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    }
    if (supported.includes('layout-shift')) {
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
        patch({ cls });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
      patch({ cls: 0 });
    }

    // Which edge served this document. A same-origin HEAD returns the platform's
    // headers; locally (or off Vercel) there are none and the readout is omitted.
    fetch(window.location.pathname, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        const id = res.headers.get('x-vercel-id');
        const code = id?.split('::')[0] ?? null;
        patch({
          edge: code ? (EDGE_CITIES[code] ?? code) : null,
          edgeCache: res.headers.get('x-vercel-cache'),
          ...collectNetwork(),
        });
      })
      .catch(() => {
        /* offline or blocked: leave edge as null */
      });

    return () => {
      cancelled = true;
      observers.forEach((o) => o.disconnect());
    };
  }, [enabled]);

  return state;
}

export function formatSeconds(ms: number | null): string | null {
  return ms == null ? null : `${(ms / 1000).toFixed(ms < 1000 ? 2 : 1)} s`;
}

export function formatKb(bytes: number | null): string | null {
  return bytes == null ? null : `${Math.round(bytes / 1024).toLocaleString('en-CA')} KB`;
}
