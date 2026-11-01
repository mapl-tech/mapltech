'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useFinePointer, useMediaQuery, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import type { PreviewItem } from './work-types';
import styles from './WorkIndex.module.scss';

/**
 * /our-work signature interaction: the catalog's real screenshots, carried
 * beside the pointer.
 *
 * The rows are server-rendered children (every label, link and phone
 * thumbnail is in the HTML); this island only adds one decorative card. It
 * mounts on wide screens with a fine pointer and motion allowed, on the first
 * pointer or keyboard visit to the list, so it costs nothing on phones, under
 * reduced motion or for crawlers. Where it never mounts, the CSS keeps each
 * row's inline thumbnail instead.
 *
 * - Pointer: the card trails the cursor (a per-frame ease written straight to
 *   `transform`, no React state per frame), leans with horizontal speed, and
 *   flips to the cursor's left near the viewport edge. Moving between rows
 *   cross-fades the screenshots.
 * - Keyboard: focusing a row places the card beside that row, above or below
 *   it, never over the label being read.
 * - Escape dismisses it (WCAG 1.4.13); it is aria-hidden and never takes
 *   pointer events.
 */

const CARD_W = 456;
const CARD_H = 285; // 16:10, the screenshots' own ratio
const GAP = 36; // pointer to card
const EDGE = 16;
const TOP_CLEAR = 88; // the fixed header
const EASE = 0.2; // share of the remaining distance covered per frame
const ROW = '[data-slug]';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** The slug of the catalog row under `target`, if that row belongs to `root`. */
function rowSlugIn(root: HTMLElement | null, target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const row = target.closest<HTMLElement>(ROW);
  return row && root?.contains(row) ? (row.dataset.slug ?? null) : null;
}

/**
 * One animation frame: ease the card a share of the way to its target and lean
 * it with horizontal speed; stop when it arrives. Plain DOM writes, no React.
 */
function frame(s: Motion, el: HTMLElement | null) {
  if (!el) {
    s.raf = 0;
    return;
  }
  const dx = s.tx - s.x;
  const dy = s.ty - s.y;
  if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
    s.x = s.tx;
    s.y = s.ty;
    el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    s.raf = 0;
    return;
  }
  s.x += dx * EASE;
  s.y += dy * EASE;
  const lean = clamp(dx * 0.05, -4, 4);
  el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
  s.raf = requestAnimationFrame(() => frame(s, el));
}

interface Motion {
  x: number;
  y: number;
  tx: number;
  ty: number;
  px: number;
  py: number;
  raf: number;
  scrollRaf: number;
  slug: string | null;
  placed: boolean;
  inside: boolean;
  /** The row holding keyboard focus, while the card follows it. */
  focusRow: HTMLElement | null;
}

export default function WorkIndex({ items, children }: { items: readonly PreviewItem[]; children: ReactNode }) {
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
  const m = useRef<Motion>({ x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, raf: 0, scrollRaf: 0, slug: null, placed: false, inside: false, focusRow: null });

  /** Show one row's screenshot (or hide with null). The last layer stays active so it fades out in place. */
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
  const aimAt = useCallback(
    (x: number, y: number) => {
      const s = m.current;
      s.tx = clamp(x, EDGE, window.innerWidth - CARD_W - EDGE);
      s.ty = clamp(y, TOP_CLEAR, window.innerHeight - CARD_H - EDGE);
      if (!s.placed) {
        s.x = s.tx;
        s.y = s.ty;
        s.placed = true;
      }
      if (!s.raf) {
        const el = floatRef.current;
        s.raf = requestAnimationFrame(() => frame(s, el));
      }
    },
    [],
  );

  const aimAtPointer = useCallback(
    (clientX: number, clientY: number) => {
      const right = clientX + GAP;
      const x = right + CARD_W > window.innerWidth - EDGE ? clientX - GAP - CARD_W : right;
      aimAt(x, clientY - CARD_H / 2);
    },
    [aimAt],
  );

  // The card mounts one render after the first visit: give it the current row and position.
  const attachFloat = useCallback(
    (node: HTMLDivElement | null) => {
      floatRef.current = node;
      if (!node) return;
      const s = m.current;
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
      const r = row.getBoundingClientRect();
      const fitsBelow = r.bottom + 16 + CARD_H <= window.innerHeight - EDGE;
      const fitsAbove = r.top - 16 - CARD_H >= TOP_CLEAR;
      const y = fitsBelow || !fitsAbove ? r.bottom + 16 : r.top - CARD_H - 16;
      aimAt(r.right - CARD_W, y);
    },
    [aimAt],
  );

  const onFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const target = e.target;
    if (!(target instanceof HTMLElement) || !target.matches(':focus-visible')) return;
    const row = target.closest<HTMLElement>(ROW);
    if (!row) return;
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

  // Scrolling moves rows under a still pointer: re-read the row beneath it once per frame.
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
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
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {children}

      {enabled && armed ? (
        <div ref={attachFloat} className={styles.float} data-visible="false" aria-hidden="true">
          <span className={styles.frame} />
          <div className={styles.card}>
            {items.map((item) => (
              <div key={item.slug} className={styles.layer} data-layer={item.slug} data-active="false">
                {item.src && wanted.has(item.slug) ? (
                  <Image
                    src={item.src}
                    alt=""
                    width={1800}
                    height={1125}
                    sizes={`${CARD_W}px`}
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
