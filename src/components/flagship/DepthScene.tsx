'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';

/**
 * Publishes two things as CSS custom properties on its root, so the layers
 * inside can move in pure CSS with no React render per frame:
 *
 * - `--p`: how far the root has scrolled out of the viewport, 0 (top of the
 *   root at the top of the viewport) to 1 (bottom of the root at the top).
 * - `--mx` / `--my`: the pointer position over the root, -1..1, eased.
 *
 * Pointer depth runs only for fine pointers with motion allowed; scroll depth
 * runs everywhere motion is allowed. Under reduced motion neither is written,
 * so the CSS falls back to its resting values (both 0).
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
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    let frame = 0;
    let visible = true;
    let tx = 0;
    let ty = 0;
    let mx = 0;
    let my = 0;

    const writeScroll = () => {
      const rect = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      el.style.setProperty('--p', p.toFixed(4));
    };

    const tick = () => {
      frame = 0;
      writeScroll();
      // Ease the pointer toward its target; keep ticking until it settles.
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      el.style.setProperty('--mx', mx.toFixed(4));
      el.style.setProperty('--my', my.toFixed(4));
      if (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001) schedule();
    };

    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    observer.observe(el);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    if (finePointer) el.addEventListener('pointermove', onPointer, { passive: true });
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      el.removeEventListener('pointermove', onPointer);
      if (frame) cancelAnimationFrame(frame);
      el.style.removeProperty('--p');
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    };
  }, [finePointer, reduceMotion]);

  return (
    <Tag ref={ref as never} className={className} {...rest}>
      {children}
    </Tag>
  );
}
