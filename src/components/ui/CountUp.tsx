'use client';

import { useEffect, useRef } from 'react';

const DURATION = 1100;

/**
 * A published number that counts up once, the first time it scrolls into
 * view. The final value is server-rendered and is what crawlers, screen
 * readers and no-JS visitors get; under reduced motion, or when the number is
 * already on screen at load, it never moves. Digits are tabular and the box
 * keeps the final width, so nothing beside it shifts while it counts.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only numbers that start below the fold count; one already in view stays put.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    el.textContent = '0';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          el.textContent = String(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = String(value);
    };
  }, [value]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', minWidth: `${String(value).length}ch`, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </span>
  );
}
