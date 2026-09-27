'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';

/**
 * Counts up once when scrolled into view. The final value is in the SSR HTML
 * (and in a visually hidden copy for assistive tech); the animated digits are
 * written straight to the DOM, so no React state changes per frame.
 * Reduced motion: the number stays static.
 */
export interface CountUpProps {
  value: number;
  className?: string;
  /** Seconds. */
  duration?: number;
}

const format = (n: number) => Math.round(n).toLocaleString('en-CA');

export default function CountUp({ value, className, duration = 1.4 }: CountUpProps) {
  const digits = useRef<HTMLSpanElement>(null);
  const inView = useInView(digits, { once: true, margin: '0px 0px -15% 0px' });
  const reduceMotion = usePrefersReducedMotion();
  // Captured once so React never rewrites the animated span after mount.
  const [initialText] = useState(() => format(value));

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const el = digits.current;
    if (!el) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  return (
    <span className={className}>
      <span ref={digits} aria-hidden="true">
        {initialText}
      </span>
      <span className="visually-hidden">{format(value)}</span>
    </span>
  );
}
