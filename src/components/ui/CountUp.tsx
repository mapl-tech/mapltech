'use client';

import { useEffect, useRef } from 'react';
import styles from './CountUp.module.scss';

const DURATION = 1100;

/**
 * A published number that counts up once, the first time it scrolls into
 * view. The real number is always the element's text: server-rendered, never
 * changed, and what crawlers, screen readers, find-in-page, copy and no-JS
 * visitors get at every moment (it never reads "0"). While it counts, that
 * text is only unpainted (opacity 0), so it keeps the box at the final
 * number's width and the digits never shift anything beside them; the count
 * is drawn over it, right-aligned in tabular digits, as generated content of
 * an empty aria-hidden box, so it is never page text or in the accessibility
 * tree. Under reduced motion, or when the number is already on screen at
 * load, nothing moves.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    const count = countRef.current;
    if (!root || !count || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only numbers that start below the fold count; one already in view stays put.
    if (root.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    const settle = () => {
      delete root.dataset.counting;
      delete count.dataset.count;
    };
    count.dataset.count = '0';
    root.dataset.counting = '';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          count.dataset.count = String(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
          else settle();
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      settle();
    };
  }, [value]);

  return (
    <span ref={ref} className={className ? `${styles.root} ${className}` : styles.root}>
      <span className={styles.value}>{value}</span>
      <span ref={countRef} className={styles.count} aria-hidden="true" />
    </span>
  );
}
