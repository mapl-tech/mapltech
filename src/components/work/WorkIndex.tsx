'use client';

import { useCallback, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGroup, motion, useMotionValue, useSpring } from 'framer-motion';
import { useFinePointer, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { isWorkFilterKey, type WorkEntry, type WorkFilter, type WorkFilterKey } from './work-types';
import styles from './WorkIndex.module.scss';

/**
 * /our-work PEAK (interaction #4): editorial rows + one shared hover preview
 * that trails the pointer + View Transition names on every thumbnail.
 *
 * - All ten rows are in the SSR HTML; filtering toggles the `hidden`
 *   attribute, nothing mounts or unmounts. Counts come from the props.
 * - Filter state lives in the URL (`?type=web`), read through
 *   useSyncExternalStore and written with history.replaceState (shallow).
 * - Layout (rows / 2-col grid) persists in localStorage, read after hydration;
 *   the server always renders rows.
 * - The preview is a fixed 360px card moved by two springs (260/28) from
 *   pointer coordinates. It mounts only on fine-pointer devices without
 *   reduced motion, on first pointer entry, so it adds no server HTML.
 *   Under reduced motion or on touch, CSS shows the inline thumbnail instead.
 */

export interface WorkIndexProps {
  entries: WorkEntry[];
  filters: WorkFilter[];
  /** Estimator link for the empty state ("No cloud project yet"). */
  cloudPricingHref: string;
}

type Layout = 'rows' | 'grid';

const PREVIEW_W = 360;
const PREVIEW_H = 240;
const PREVIEW_SPRING = { stiffness: 260, damping: 28 };
const LAYOUT_KEY = 'mapl:work-layout';

/* --------------------------- URL-synced filter --------------------------- */

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
  // Shallow: Next's router syncs its own state from native replaceState.
  window.history.replaceState(null, '', url);
  urlListeners.forEach((listener) => listener());
}

/* -------------------------- persisted layout mode ------------------------ */

const layoutListeners = new Set<() => void>();
let layoutMemory: Layout | null = null;

function subscribeLayout(onChange: () => void) {
  layoutListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    layoutListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readLayout(): Layout {
  if (layoutMemory) return layoutMemory;
  try {
    return window.localStorage.getItem(LAYOUT_KEY) === 'grid' ? 'grid' : 'rows';
  } catch {
    return 'rows';
  }
}

function writeLayout(layout: Layout) {
  layoutMemory = layout;
  try {
    window.localStorage.setItem(LAYOUT_KEY, layout);
  } catch {
    // Private mode / blocked storage: the in-memory value still drives the UI.
  }
  layoutListeners.forEach((listener) => listener());
}

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function WorkIndex({ entries, filters, cloudPricingHref }: WorkIndexProps) {
  const active = useSyncExternalStore(subscribeUrl, readTypeParam, () => 'all' as WorkFilterKey);
  const layout = useSyncExternalStore(subscribeLayout, readLayout, () => 'rows' as Layout);

  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  // Rows only: in grid mode the card already shows the image.
  const showPreview = finePointer && !reduceMotion && layout === 'rows';

  // The preview stack mounts on the first pointer entry (desktop only).
  const [armed, setArmed] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const activeSlug = useRef<string | null>(null);

  // Position trails the pointer through two springs (260/28). Visibility is a
  // data attribute + CSS transition (opacity/scale), written straight to the DOM.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, PREVIEW_SPRING);
  const springY = useSpring(y, PREVIEW_SPRING);

  const applyActive = (stack: HTMLElement | null, slug: string | null) => {
    if (!stack) return;
    stack.dataset.visible = slug ? 'true' : 'false';
    stack.querySelectorAll<HTMLElement>('[data-thumb]').forEach((thumb) => {
      thumb.dataset.active = thumb.dataset.thumb === slug ? 'true' : 'false';
    });
  };

  const setActive = useCallback((slug: string | null) => {
    if (slug === activeSlug.current) return;
    activeSlug.current = slug;
    applyActive(previewRef.current, slug);
  }, []);

  // The stack mounts one render after the first pointerover, so it picks up
  // the row already under the pointer when it attaches.
  const attachPreview = useCallback((node: HTMLDivElement | null) => {
    previewRef.current = node;
    if (node) applyActive(node, activeSlug.current);
  }, []);

  const onPointerEnter = () => {
    if (showPreview && !armed) setArmed(true);
  };

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLUListElement>) => {
      if (!showPreview) return;
      x.set(clamp(e.clientX + 28, 16, window.innerWidth - PREVIEW_W - 16));
      y.set(clamp(e.clientY - PREVIEW_H / 2, 16, window.innerHeight - PREVIEW_H - 16));
    },
    [showPreview, x, y],
  );

  const onPointerOver = useCallback(
    (e: ReactPointerEvent<HTMLUListElement>) => {
      if (!showPreview) return;
      const row = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-slug]') : null;
      setActive(row?.dataset.slug ?? null);
    },
    [showPreview, setActive],
  );

  const onPointerLeave = useCallback(() => {
    setActive(null);
  }, [setActive]);

  const matches = (entry: WorkEntry) => active === 'all' || entry.service === active;
  const visibleCount = entries.filter(matches).length;
  const animateLayout = !reduceMotion;

  return (
    <div className={styles.index} data-layout={layout}>
      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="Filter projects by service line">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={styles.chip}
              aria-pressed={active === filter.key}
              disabled={filter.count === 0}
              onClick={() => writeTypeParam(filter.key)}
            >
              <span>{filter.label}</span>
              <span className={styles.count}>{filter.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.layoutToggle} role="group" aria-label="Layout">
          <button type="button" aria-pressed={layout === 'rows'} onClick={() => writeLayout('rows')}>
            Rows
          </button>
          <button type="button" aria-pressed={layout === 'grid'} onClick={() => writeLayout('grid')}>
            Grid
          </button>
        </div>
      </div>

      <p className={styles.showing} role="status">
        Showing {visibleCount} of {entries.length}
      </p>

      <div className={styles.head} aria-hidden="true">
        <span>No.</span>
        <span>Client</span>
        <span>Service</span>
        <span>Year</span>
        <span>Outcome</span>
        <span className={styles.headOpen}>Open</span>
      </div>

      <LayoutGroup>
        <ul
          className={styles.list}
          onPointerEnter={onPointerEnter}
          onPointerMove={onPointerMove}
          onPointerOver={onPointerOver}
          onPointerLeave={onPointerLeave}
        >
          {entries.map((entry) => (
            <motion.li
              key={entry.slug}
              layout={animateLayout ? 'position' : false}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={styles.row}
              data-slug={entry.slug}
              hidden={!matches(entry)}
            >
              <Link
                href={entry.path}
                className={styles.rowLink}
                data-cursor="view"
                data-cta-placement="work_row"
              >
                <span className={styles.meta}>
                  <span className={styles.no} aria-hidden="true">
                    {pad(entry.index)}
                  </span>
                  <span className={styles.service}>{entry.serviceLabel}</span>
                  <span className={styles.year}>
                    {entry.year ?? (
                      <span aria-hidden="true" className={styles.dash}>
                        —
                      </span>
                    )}
                  </span>
                </span>

                <div className={styles.client}>
                  <h3 className={styles.title}>{entry.title}</h3>
                  {entry.isLab ? <span className={styles.lab}>MAPL Labs</span> : null}
                </div>

                <p className={styles.outcome}>{entry.description}</p>

                <span className={styles.thumb} style={{ viewTransitionName: `work-${entry.slug}` }}>
                  <Image
                    src={entry.image}
                    alt=""
                    width={480}
                    height={320}
                    sizes="(max-width: 767px) 40vw, 480px"
                  />
                </span>

                <span className={styles.chip} aria-hidden="true">
                  View
                </span>
              </Link>

              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.live}
                  data-cursor="external"
                  data-cta-placement="work_row_live"
                >
                  View live site
                  <span className="visually-hidden">, {entry.host} (opens in a new tab)</span>
                </a>
              ) : (
                <span className={`${styles.live} ${styles.liveMuted}`} aria-hidden="true">
                  Case study
                </span>
              )}
            </motion.li>
          ))}
        </ul>
      </LayoutGroup>

      <p className={styles.empty} hidden={visibleCount > 0}>
        No published cloud project yet.{' '}
        <Link href={cloudPricingHref} data-cta-placement="work_empty_cloud">
          See Cloud Engineering pricing
        </Link>
        .
      </p>

      {showPreview && armed ? (
        <motion.div
          ref={attachPreview}
          className={styles.preview}
          aria-hidden="true"
          data-visible="false"
          style={{ x: springX, y: springY, width: PREVIEW_W }}
        >
          <div className={styles.previewStack} style={{ height: PREVIEW_H }}>
            {entries.map((entry) => (
              <div key={entry.slug} className={styles.previewThumb} data-thumb={entry.slug} data-active="false">
                <Image src={entry.image} alt="" width={PREVIEW_W} height={PREVIEW_H} sizes={`${PREVIEW_W}px`} loading="eager" />
                <span className={styles.previewCaption}>
                  <span>
                    {pad(entry.index)} · {entry.title}
                  </span>
                  <span>{entry.serviceLabel}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
