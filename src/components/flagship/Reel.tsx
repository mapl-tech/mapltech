'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { REEL } from './content';
import styles from './Reel.module.scss';

const SIZE = { desktop: { width: 1800, height: 1125 }, mobile: { width: 780, height: 1688 } } as const;

/**
 * A tilted wall of real captures (shipped client work), each column sliding
 * at its own speed as the section scrolls past. Movement is tied to scroll,
 * never to a clock, so nothing moves on its own (WCAG 2.2.2). One passive
 * listener writes `--p`; the columns are CSS transforms.
 */
export default function Reel() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener('scroll', schedule);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div ref={ref} className={styles.reel} aria-hidden="true">
      <div className={styles.plane}>
        {REEL.map((column, c) => (
          <div key={c} className={styles.column} style={{ ['--speed' as string]: c % 2 ? -1 : 1 }}>
            {column.map((name, i) => {
              const kind = name.endsWith('mobile') ? 'mobile' : 'desktop';
              return (
                <div key={`${name}-${i}`} className={styles.tile} data-kind={kind}>
                  <Image
                    src={`/images/cases/${name}.jpg`}
                    alt=""
                    width={SIZE[kind].width}
                    height={SIZE[kind].height}
                    sizes="(min-width: 1024px) 22vw, 40vw"
                    className={styles.shot}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
