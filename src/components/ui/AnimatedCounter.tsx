'use client';

import { useRef, useEffect, useState } from 'react';
import { useInView, motion } from 'framer-motion';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
  delay = 0,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const delayMs = delay * 1000;
    const durationMs = duration * 1000;

    const timeout = setTimeout(() => {
      const startTime = performance.now();
      let rafId: number;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };

      rafId = requestAnimationFrame(step);

      return () => cancelAnimationFrame(rafId);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [isInView, target, duration, delay]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 0.5, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}
