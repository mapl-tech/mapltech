'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './useMediaQuery';
import styles from './ScrollLit.module.scss';

export interface LitRun {
  text: string;
  accent?: boolean;
}

/**
 * Text that lights up word by word as it scrolls through the viewport.
 *
 * One passive scroll listener writes `--p` (0 to 1) on the root; each word's
 * opacity is pure CSS from its index, so there is no React render per frame.
 * Unlit words never drop below 0.4 opacity, which keeps large text above
 * 3:1 contrast even before it lights (and for anything that reads the page
 * without scrolling). Reduced motion: everything is lit from the start.
 */
export default function ScrollLit({
  runs,
  as: Tag = 'p',
  className,
  id,
}: {
  runs: readonly LitRun[];
  as?: 'p' | 'h2' | 'div';
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.style.setProperty('--p', '1');
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Starts as the block's top passes 85% of the viewport, done as its bottom passes 55%.
      const start = vh * 0.85;
      const span = rect.height + vh * 0.3;
      const p = Math.min(1, Math.max(0, (start - rect.top) / span));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  let index = 0;
  const words = runs.flatMap((run) =>
    run.text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((part) => ({ part, accent: run.accent, space: /^\s+$/.test(part) })),
  );
  const total = words.filter((w) => !w.space).length;

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={[styles.lit, className].filter(Boolean).join(' ')}
      style={{ ['--n' as string]: total }}
    >
      {words.map((word, key) =>
        word.space ? (
          ' '
        ) : (
          <span
            key={key}
            className={word.accent ? `${styles.word} ${styles.accent}` : styles.word}
            style={{ ['--i' as string]: index++ }}
          >
            {word.part}
          </span>
        ),
      )}
    </Tag>
  );
}
