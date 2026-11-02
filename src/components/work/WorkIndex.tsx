'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useFinePointer, useMediaQuery, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { isWorkFilterKey, type PreviewItem, type WorkFilter, type WorkFilterKey } from './work-types';
import styles from './WorkIndex.module.scss';

/**
 * /our-work index island: the service-line filter, and the real screenshot
 * that trails the pointer (the homepage services preview, on the dark ground).
 *
 * The rows are server-rendered children (every label, link and capture is in
 * the HTML). This island adds:
 *
 * - Filter chips with live counts. The choice lives in the URL (`?type=web`),
 *   read through useSyncExternalStore and written with history.replaceState,
 *   so a filtered view can be shared. Filtering is one attribute on the root;
 *   CSS hides the rows of other lines, so nothing mounts or unmounts and the
 *   server HTML always holds every project. The result is announced politely.
 * - The preview card, on wide screens with a fine pointer and motion allowed,
 *   mounted on the first visit to the list (so phones, reduced motion and
 *   crawlers pay nothing). Pointer: the card eases after the cursor in a rAF
 *   loop that writes `transform` directly (no React state per frame) and flips
 *   to the cursor's left near the edge. Keyboard: focusing a row places it
 *   beside that row, never over the text being read. Escape dismisses it
 *   (WCAG 1.4.13); it is aria-hidden and never takes pointer events.
 */

const GAP = 28; // pointer to card, as on the homepage
const EDGE = 16;
const TOP_CLEAR = 88; // the fixed header
const EASE = 0.16; // share of the remaining distance covered per frame (homepage value)
const ROW = '[data-slug]';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/* ------------------------------------------------------------------ URL-synced filter */

const urlListeners = new Set<() => void>();

function subscribeUrl(onChange: () => void) {
  urlListeners.add(onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    urlListeners.delete(onChange);
    window.removeEventListener('popstate', onChange);
  };
}

function readTypeParam(): WorkFilterKey {
  const type = new URLSearchParams(window.location.search).get('type');
  return isWorkFilterKey(type) ? type : 'all';
}

function writeTypeParam(key: WorkFilterKey) {
  const url = new URL(window.location.href);
  if (key === 'all') url.searchParams.delete('type');
  else url.searchParams.set('type', key);
  // Shallow: the App Router syncs its own state from native replaceState.
  window.history.replaceState(null, '', url);
  urlListeners.forEach((listener) => listener());
}

const serverFilter = (): WorkFilterKey => 'all';

/* ------------------------------------------------------------------ preview motion */

interface Motion {
  x: number;
  y: number;
  tx: number;
  ty: number;
  px: number;
  py: number;
  w: number;
  h: number;
  raf: number;
  scrollRaf: number;
  slug: string | null;
  placed: boolean;
  inside: boolean;
  /** The row holding keyboard focus, while the card follows it. */
  focusRow: HTMLElement | null;
}

/** The motion state with the card's size filled in: clamp(300px, 28vw, 420px) at 16:10 until it has mounted and been measured. */
function sized(s: Motion): Motion {
  if (!s.w) {
    s.w = clamp(window.innerWidth * 0.28, 300, 420);
    s.h = s.w / 1.6;
  }
  return s;
}

/** The slug of the index row under `target`, if that row belongs to `root`. */
function rowSlugIn(root: HTMLElement | null, target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const row = target.closest<HTMLElement>(ROW);
  return row && root?.contains(row) ? (row.dataset.slug ?? null) : null;
}

/** One animation frame: ease the card a share of the way to its target; stop when it arrives. */
function frame(s: Motion, el: HTMLElement | null) {
  if (!el) {
    s.raf = 0;
    return;
  }
  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
    s.x = s.tx;
    s.y = s.ty;
    el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    s.raf = 0;
    return;
  }
  s.x += dx * EASE;
  s.y += dy * EASE;
  el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`;
  s.raf = requestAnimationFrame(() => frame(s, el));
}

export interface WorkIndexProps {
  items: readonly PreviewItem[];
  /** "All" plus the lines with listed work, with counts (catalogFilters()). */
  filters: readonly WorkFilter[];
  total: number;
  /** The section heading, set beside the chips. */
  heading: ReactNode;
  children: ReactNode;
}

export default function WorkIndex({ items, filters, total, heading, children }: WorkIndexProps) {
  const fromUrl = useSyncExternalStore(subscribeUrl, readTypeParam, serverFilter);
  // Only a line that has a chip can filter; anything else in the URL shows everything.
  const active: WorkFilterKey = filters.some((f) => f.key === fromUrl) ? fromUrl : 'all';
  const [message, setMessage] = useState('');

  const fine = useFinePointer();
  const wide = useMediaQuery('(min-width: 1024px)');
  const reduce = usePrefersReducedMotion();
  const enabled = fine && wide && !reduce;

  // The card mounts on the first visit to the list; each screenshot (with its
  // neighbours, so the next move is instant) loads the first time its row is visited.
  const [armed, setArmed] = useState(false);
  const [wanted, setWanted] = useState<ReadonlySet<string>>(() => new Set());
  const requested = useRef(new Set<string>());

  const rootRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);
  const m = useRef<Motion>({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    px: 0,
    py: 0,
    w: 0,
    h: 0,
    raf: 0,
    scrollRaf: 0,
    slug: null,
    placed: false,
    inside: false,
    focusRow: null,
  });

  const select = (filter: WorkFilter) => {
    writeTypeParam(filter.key);
    setMessage(
      filter.key === 'all'
        ? `Showing all ${total} projects.`
        : `Showing ${filter.count} of ${total} projects: ${filter.label}.`,
    );
  };

  /** Show one row's screenshot (or hide with null). The last layer stays active so it shrinks away in place. */
  const show = useCallback((slug: string | null) => {
    const s = m.current;
    if (slug === s.slug) return;
    s.slug = slug;
    const el = floatRef.current;
    if (!el) return;
    el.dataset.visible = slug ? 'true' : 'false';
    if (!slug) {
      s.placed = false;
      return;
    }
    el.querySelectorAll<HTMLElement>('[data-layer]').forEach((layer) => {
      layer.dataset.active = layer.dataset.layer === slug ? 'true' : 'false';
    });
  }, []);

  const request = useCallback(
    (slug: string | null) => {
      if (!slug || requested.current.has(slug)) return;
      const i = items.findIndex((item) => item.slug === slug);
      const batch = [items[i - 1], items[i], items[i + 1]].filter(Boolean).map((item) => item.slug);
      batch.forEach((s) => requested.current.add(s));
      setWanted((prev) => new Set([...prev, ...batch]));
    },
    [items],
  );

  /** Move the target; snap (rather than fly) when the card is appearing. */
  const aimAt = useCallback((x: number, y: number) => {
    const s = sized(m.current);
    s.tx = clamp(x, EDGE, window.innerWidth - s.w - EDGE);
    s.ty = clamp(y, TOP_CLEAR, window.innerHeight - s.h - EDGE);
    if (!s.placed) {
      s.x = s.tx;
      s.y = s.ty;
      s.placed = true;
    }
    if (!s.raf) {
      const el = floatRef.current;
      s.raf = requestAnimationFrame(() => frame(s, el));
    }
  }, []);

  const aimAtPointer = useCallback(
    (clientX: number, clientY: number) => {
      const s = sized(m.current);
      const right = clientX + GAP;
      const x = right + s.w > window.innerWidth - EDGE ? clientX - GAP - s.w : right;
      aimAt(x, clientY - s.h / 2);
    },
    [aimAt],
  );

  // The card mounts one render after the first visit: measure it, then give it the current row and position.
  const attachFloat = useCallback(
    (node: HTMLDivElement | null) => {
      floatRef.current = node;
      if (!node) return;
      const s = m.current;
      s.w = node.offsetWidth || s.w;
      s.h = node.offsetHeight || s.h;
      node.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      const slug = s.slug;
      s.slug = null;
      show(slug);
    },
    [show],
  );

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType === 'touch') return;
    const s = m.current;
    s.inside = true;
    s.px = e.clientX;
    s.py = e.clientY;
    if (!armed) setArmed(true);
    const slug = rowSlugIn(rootRef.current, e.target);
    request(slug);
    if (slug) aimAtPointer(e.clientX, e.clientY);
    show(slug);
  };

  const onPointerLeave = () => {
    m.current.inside = false;
    show(null);
  };

  /** Keyboard: right-aligned with the focused row, below it if the card fits there, else above. */
  const placeBeside = useCallback(
    (row: HTMLElement) => {
      const s = sized(m.current);
      const r = row.getBoundingClientRect();
      const fitsBelow = r.bottom + 16 + s.h <= window.innerHeight - EDGE;
      const fitsAbove = r.top - 16 - s.h >= TOP_CLEAR;
      const y = fitsBelow || !fitsAbove ? r.bottom + 16 : r.top - s.h - 16;
      aimAt(r.right - s.w, y);
    },
    [aimAt],
  );

  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const target = e.target;
    const row = target instanceof HTMLElement ? target.closest<HTMLElement>(ROW) : null;
    // Focus on a chip (or anything else that is not a row) puts the card away.
    if (!row || !(target instanceof HTMLElement) || !target.matches(':focus-visible')) {
      m.current.focusRow = null;
      show(null);
      return;
    }
    if (!armed) setArmed(true);
    m.current.focusRow = row;
    // After the browser has scrolled the focused row into view.
    requestAnimationFrame(() => placeBeside(row));
    request(row.dataset.slug ?? null);
    show(row.dataset.slug ?? null);
  };

  const onBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
    m.current.focusRow = null;
    show(null);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape') return;
    m.current.focusRow = null;
    show(null);
  };

  // Scrolling moves rows under a still pointer: re-read the row beneath it once
  // per frame. A resize re-measures the card (its width follows the viewport).
  useEffect(() => {
    if (!enabled || !armed) return;
    const s = m.current;
    const onScroll = () => {
      if ((!s.inside && !s.focusRow) || s.scrollRaf) return;
      s.scrollRaf = requestAnimationFrame(() => {
        s.scrollRaf = 0;
        if (!s.inside && s.focusRow) {
          placeBeside(s.focusRow);
          return;
        }
        const hit = document.elementFromPoint(s.px, s.py);
        const slug = rowSlugIn(rootRef.current, hit);
        request(slug);
        if (slug) aimAtPointer(s.px, s.py);
        show(slug);
      });
    };
    const onResize = () => {
      const el = floatRef.current;
      if (!el) return;
      s.w = el.offsetWidth;
      s.h = el.offsetHeight;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(s.scrollRaf);
      s.scrollRaf = 0;
    };
  }, [enabled, armed, aimAtPointer, placeBeside, request, show]);

  useEffect(() => {
    const s = m.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.index}
      data-filter={active}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <div className={styles.toolbar}>
        {heading}
        {filters.length > 2 ? (
          <div className={styles.chips} role="group" aria-label="Filter projects by service line">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={styles.chip}
                aria-pressed={active === filter.key}
                onClick={() => select(filter)}
              >
                {filter.label}
                <span className={styles.count}>
                  <span className="visually-hidden">, </span>
                  {filter.count}
                  <span className="visually-hidden"> {filter.count === 1 ? 'project' : 'projects'}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <p className="visually-hidden" role="status">
        {message}
      </p>

      {children}

      {enabled && armed ? (
        <div ref={attachFloat} className={styles.float} data-visible="false" aria-hidden="true">
          {items.map((item) => (
            <div key={item.slug} className={styles.layer} data-layer={item.slug} data-active="false">
              {item.src && wanted.has(item.slug) ? (
                <Image
                  src={item.src}
                  alt=""
                  width={1800}
                  height={1125}
                  sizes="420px"
                  loading="eager"
                  fetchPriority="low"
                  className={styles.shot}
                />
              ) : item.flow ? (
                <FlowCard steps={item.flow} />
              ) : null}
              {item.caption ? <span className={styles.caption}>{item.caption}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** For work with no public screen: its stages as a labelled flow, plainly marked as a diagram. */
function FlowCard({ steps }: { steps: readonly string[] }) {
  return (
    <div className={styles.flow}>
      <span className={styles.flowLabel}>Diagram, not a screenshot</span>
      <ol className={styles.flowSteps}>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
