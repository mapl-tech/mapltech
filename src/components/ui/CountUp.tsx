'use client';

import { useEffect, useRef } from 'react';

const DURATION = 1100;

/**
 * A published number that counts up once, the first time it scrolls into
 * view. The final value is server-rendered and is what crawlers, screen
 * readers and no-JS visitors get; under reduced motion, or when the number is
 * already on screen at load, it never moves. Digits are tabular, and while it
 * counts the box holds the final number's measured width (right-aligned), so
 * nothing beside it shifts; at rest it is its natural width, flush with the
 * text it sits over.
 */
export default function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only numbers that start below the fold count; one already in view stays put.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    let frame = 0;
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
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
          else el.style.minWidth = '';
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
      el.style.minWidth = '';
    };
  }, [value]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-block', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </span>
  );
}
