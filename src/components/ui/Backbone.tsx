'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from './useMediaQuery';
import styles from './Backbone.module.scss';

/**
 * Interaction #1: the Backbone, the homepage signature.
 *
 * A fixed 2px spine in the left gutter draws with scroll progress (SVG
 * pathLength bound to useScroll -> useSpring). One node per section; the
 * active node fills red and its label fades in. Highlighting toggles a
 * `data-active` attribute from a MotionValue event, never per-frame React state.
 *
 * Mount it inside a wrapper with no CSS transform (position: fixed). The spine
 * is decorative (`aria-hidden`); a visually hidden <nav aria-label="Page
 * sections"> mirrors it for assistive tech and becomes visible on focus.
 *
 * Mobile: a 3px progress rail with dots only. Reduced motion: fully drawn,
 * nodes highlighted by IntersectionObserver.
 */

export interface BackboneSection {
  /** id of the target <section id="..."> */
  id: string;
  label: string;
  /** Displayed as a two-digit index ("01"). */
  index: number | string;
}

export interface BackboneProps {
  sections: BackboneSection[];
  className?: string;
  /** Fraction of the viewport height a section top must cross to become active. */
  activationLine?: number;
}

const formatIndex = (index: number | string) =>
  typeof index === 'number' ? String(index).padStart(2, '0') : index;

export default function Backbone({ sections, className = '', activationLine = 0.4 }: BackboneProps) {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.6, restDelta: 0.001 });

  const listRef = useRef<HTMLOListElement>(null);
  const activeIndex = useRef(-1);
  const sectionTops = useRef<number[]>([]);

  const setActive = useCallback((index: number) => {
    if (index === activeIndex.current || !listRef.current) return;
    activeIndex.current = index;
    const nodes = listRef.current.querySelectorAll<HTMLElement>('[data-node]');
    nodes.forEach((node, i) => {
      if (i === index) node.dataset.active = 'true';
      else delete node.dataset.active;
    });
  }, []);

  // Scroll-driven path: measure section tops, then pick the last section whose
  // top has crossed the activation line on every scroll change.
  useEffect(() => {
    if (reduceMotion) return;
    const measure = () => {
      sectionTops.current = sections.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
      });
    };
    const update = () => {
      const line = window.scrollY + window.innerHeight * activationLine;
      let index = 0;
      const tops = sectionTops.current;
      for (let i = 0; i < tops.length; i++) if (tops[i] <= line) index = i;
      setActive(index);
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [sections, reduceMotion, activationLine, setActive]);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (reduceMotion) return;
    const line = y + window.innerHeight * activationLine;
    let index = 0;
    const tops = sectionTops.current;
    for (let i = 0; i < tops.length; i++) if (tops[i] <= line) index = i;
    setActive(index);
  });

  // Reduced-motion path: a thin observer band at the activation line.
  useEffect(() => {
    if (!reduceMotion) return;
    const top = Math.round(activationLine * 100);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sections.findIndex((s) => s.id === entry.target.id);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: `-${top}% 0px -${Math.max(0, 99 - top)}% 0px`, threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections, reduceMotion, activationLine, setActive]);

  return (
    <>
      <div className={`${styles.root} ${className}`.trim()} aria-hidden="true">
        <svg className={styles.spine} viewBox="0 0 2 100" preserveAspectRatio="none" focusable="false">
          <path d="M1 0 V100" className={styles.track} vectorEffect="non-scaling-stroke" />
          <motion.path
            d="M1 0 V100"
            className={styles.progress}
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: reduceMotion ? 1 : drawn }}
          />
        </svg>
        <ol ref={listRef} className={styles.nodes}>
          {sections.map((s) => (
            <li key={s.id} className={styles.node}>
              <a href={`#${s.id}`} data-node="" tabIndex={-1} className={styles.link}>
                <span className={styles.dot} />
                <span className={styles.label}>
                  <span className={styles.index}>{formatIndex(s.index)}</span>
                  {s.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <nav aria-label="Page sections" className={styles.srNav}>
        <ol>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                {formatIndex(s.index)} {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
