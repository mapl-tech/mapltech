'use client';

import { Children, isValidElement, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';
import styles from './SnapRow.module.scss';

/**
 * Interaction #8: snap row / drag track.
 *
 * Fine pointer: a draggable motion.ul (constraints, dragElastic 0.08) with
 * prev/next buttons, `data-cursor="drag"` and `data-lenis-prevent`.
 * Coarse pointer (and SSR): native overflow-x scroll with mandatory snap,
 * contained overscroll and 85vw cards. Children are plain DOM in source order;
 * each child becomes one <li>.
 *
 * Reduced motion: no drag momentum; buttons jump instead of animating.
 */

export interface SnapRowProps {
  children: ReactNode;
  /** Accessible name of the carousel region, e.g. "Client testimonials". */
  label: string;
  className?: string;
  itemClassName?: string;
  /** Prev/next buttons. Default true. */
  controls?: boolean;
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d={direction === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SnapRow({ children, label, className = '', itemClassName = '', controls = true }: SnapRowProps) {
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  const listId = `snaprow-${useId()}`;

  const regionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const dragging = useRef(false);
  const x = useMotionValue(0);

  const maxOffset = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    return viewport && track ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
  };

  // Edge state for dimming the buttons, written to a data attribute (no state).
  useMotionValueEvent(x, 'change', (value) => {
    const region = regionRef.current;
    if (!region) return;
    const atStart = value >= -1;
    const atEnd = value <= -maxOffset() + 1;
    region.dataset.edge = atStart && atEnd ? 'both' : atStart ? 'start' : atEnd ? 'end' : 'none';
  });

  const step = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const delta = viewport.clientWidth * 0.85 * direction;
    if (finePointer) {
      const target = Math.max(-maxOffset(), Math.min(0, x.get() - delta));
      animate(x, target, reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30 });
    } else {
      trackRef.current?.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  // Swallow the click that ends a drag so links inside cards do not fire.
  const onClickCapture = (e: MouseEvent) => {
    if (dragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const items = Children.toArray(children).map((child, i) => (
    <li key={isValidElement(child) && child.key != null ? child.key : i} className={`${styles.item} ${itemClassName}`.trim()}>
      {child}
    </li>
  ));

  return (
    <section
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`${styles.region} ${className}`.trim()}
      data-mode={finePointer ? 'drag' : 'scroll'}
      data-edge="start"
      data-cursor={finePointer ? 'drag' : undefined}
      data-lenis-prevent=""
    >
      <div ref={viewportRef} className={styles.viewport}>
        {finePointer ? (
          <motion.ul
            id={listId}
            ref={trackRef}
            className={styles.track}
            style={{ x }}
            drag="x"
            dragConstraints={viewportRef}
            dragElastic={0.08}
            dragMomentum={!reduceMotion}
            dragTransition={{ power: 0.35, timeConstant: 220 }}
            onDragStart={() => {
              dragging.current = true;
            }}
            onDragEnd={() => {
              window.setTimeout(() => {
                dragging.current = false;
              }, 0);
            }}
            onClickCapture={onClickCapture}
          >
            {items}
          </motion.ul>
        ) : (
          <ul id={listId} ref={trackRef} className={styles.track}>
            {items}
          </ul>
        )}
      </div>

      {controls ? (
        <div className={styles.controls}>
          <button type="button" className={styles.control} onClick={() => step(-1)} aria-controls={listId} aria-label="Previous">
            <Chevron direction="left" />
          </button>
          <button type="button" className={styles.control} onClick={() => step(1)} aria-controls={listId} aria-label="Next">
            <Chevron direction="right" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
