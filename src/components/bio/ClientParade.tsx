'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import type { ClientLogo } from '@/components/flagship/HeroClients';
import { useMotionPaused } from '@/components/ui/motionPause';
import { COPIES, GAP_MIN, MARK_MAX, MARK_MIN } from './parade';
import styles from './ClientParade.module.scss';

/** The mark and gap sizes, handed to the stylesheet (parade.ts; parade.spec.ts checks the seam). */
const SIZES = { '--mark-min': `${MARK_MIN}px`, '--mark-max': `${MARK_MAX}px`, '--gap-min': `${GAP_MIN}px` } as CSSProperties;

/**
 * The clients shown on mapltech.com's homepage, at the foot of the VSL page's
 * hero, as an endless parade, right to left (Leshan, Nov 19, 2026: "add a
 * infinite scroll logo parade to the vsl page"). CSS runs it: each copy
 * slides by its own width, and the copies after the first always span the
 * row (parade.spec.ts), so the seam never shows. The Pause button stops it
 * (WCAG 2.2.2: it moves on its own for longer than five seconds), and it
 * starts paused for a visitor who chose "Pause motion" on mapltech.com
 * (motionPause). It rests while off screen, and hover holds it on desktop.
 * Under reduced motion it is one still row with no copies and no button.
 * Screen readers get the first list once, by name; the copies are hidden.
 */
export default function ClientParade({ label, logos }: { label: string; logos: readonly ClientLogo[] }) {
  const sitePaused = useMotionPaused();
  // The visitor's own choice here, once they make one; until then, the site's.
  const [choice, setChoice] = useState<boolean | null>(null);
  const paused = choice ?? sitePaused;
  const loopRef = useRef<HTMLDivElement>(null);
  const [offScreen, setOffScreen] = useState(false);

  useEffect(() => {
    const loop = loopRef.current;
    if (!loop) return;
    const io = new IntersectionObserver(([entry]) => setOffScreen(!entry.isIntersecting));
    io.observe(loop);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.clients} style={SIZES}>
      <div className={styles.head}>
        <p id="bio-clients-label" className={styles.label}>
          {label}
        </p>
        <button type="button" className={styles.toggle} onClick={() => setChoice(!paused)}>
          <svg className={styles.toggleIcon} viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
            {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
          </svg>
          {paused ? 'Play' : 'Pause'}
          <span className="visually-hidden"> the client logos</span>
        </button>
      </div>

      <div
        ref={loopRef}
        className={styles.loop}
        data-paused={paused ? '' : undefined}
        data-idle={offScreen ? '' : undefined}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <ul
            key={copy}
            className={styles.list}
            aria-labelledby={copy === 0 ? 'bio-clients-label' : undefined}
            aria-hidden={copy > 0 ? true : undefined}
          >
            {logos.map((logo) => {
              // Requested at the largest size shown; the CSS sizes it from --mark.
              const height = Math.round(MARK_MAX * logo.scale);
              return (
                <li key={logo.name} className={styles.logo} style={{ '--scale': logo.scale } as CSSProperties}>
                  {/* Below the first screen, so low priority; the copies share the first list's six files. */}
                  <Image
                    src={logo.src}
                    alt={copy === 0 ? logo.name : ''}
                    width={Math.round((height * logo.width) / logo.height)}
                    height={height}
                    loading="eager"
                    fetchPriority="low"
                  />
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
