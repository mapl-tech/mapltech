'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';

/**
 * Publishes `--p` on its root as a CSS custom property, so the layers inside
 * can move in pure CSS with no React render per frame: how far the root has
 * scrolled out of the viewport, 0 (top of the root at the top of the viewport)
 * to 1 (bottom of the root at the top).
 *
 * Scroll only, on purpose: in the hero the pointer already drives one layer
 * (the light field's bloom), and two pointer-driven layers was more motion
 * than the page needs. Under reduced motion nothing is written, so the CSS
 * falls back to its resting value (0).
 */
export default function DepthScene({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: {
  as?: 'div' | 'section';
  className?: string;
  children: ReactNode;
  'aria-labelledby'?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    let frame = 0;
    let visible = true;

    const tick = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      el.style.setProperty('--p', p.toFixed(4));
    };

    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    observer.observe(el);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      el.style.removeProperty('--p');
    };
  }, [reduceMotion]);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  );
}
