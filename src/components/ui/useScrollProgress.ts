'use client';

import { useEffect, type RefObject } from 'react';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Writes scroll progress (0 to 1) to `--p` on an element, with no React
 * render per frame: one passive listener, rAF-throttled, active only while
 * the element is near the viewport.
 *
 * - `through`: 0 as the element's top enters the bottom of the viewport,
 *   1 as its bottom leaves the top (parallax, reveals).
 * - `pinned`: 0 when the element's top reaches the viewport top, 1 when its
 *   bottom reaches the viewport bottom (a tall section with a sticky child).
 *
 * Under reduced motion it writes `rest` once and stops.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { mode = 'through', rest = 0, enabled = true }: { mode?: 'through' | 'pinned'; rest?: number; enabled?: boolean } = {},
) {
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (reduceMotion) {
      el.style.setProperty('--p', String(rest));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p =
        mode === 'pinned'
          ? -rect.top / Math.max(1, rect.height - vh)
          : (vh - rect.top) / Math.max(1, rect.height + vh);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', schedule, { passive: true });
          schedule();
        } else {
          window.removeEventListener('scroll', schedule);
          update();
        }
      },
      { rootMargin: '25% 0px 25% 0px' },
    );
    io.observe(el);
    window.addEventListener('resize', schedule, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, mode, rest, enabled, reduceMotion]);

  return reduceMotion;
}
