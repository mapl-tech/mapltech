'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { useMotionPaused } from '@/components/ui/motionPause';
import styles from './HeroClients.module.scss';

/** A square mark's height at its largest (HeroClients.module.scss caps --mark here); each logo scales from it. */
const MARK_MAX = 40;
/** One list for assistive tech plus two copies, so the loop never shows a gap at any width. */
const COPIES = 3;

export interface ClientLogo {
  name: string;
  src: string;
  /** The file's pixels. */
  width: number;
  height: number;
  /** Optical balance against a square mark. */
  scale: number;
}

/**
 * Selected clients in the hero's foot row, as an endless parade, right to
 * left (Leshan, Nov 5, 2026: "make the logo parade infinite scroll"). CSS
 * runs it: each copy slides by its own width, so the seam never shows. It
 * follows the page-wide "Pause motion" (the hero's toggle, WCAG 2.2.2) and
 * rests while off screen; hover holds it on desktop. Under reduced motion it
 * is one still row with no copies. The marks are small, so the H1 stays the
 * largest paint.
 */
export default function HeroClients({ label, logos }: { label: string; logos: readonly ClientLogo[] }) {
  const paused = useMotionPaused();
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
    <div className={styles.clients}>
      <p id="hero-clients-label" className={styles.clientsLabel}>
        {label}
      </p>
      <div
        ref={loopRef}
        className={styles.clientLoop}
        data-paused={paused ? '' : undefined}
        data-idle={offScreen ? '' : undefined}
      >
        {Array.from({ length: COPIES }, (_, copy) => (
          <ul
            key={copy}
            className={styles.clientLogos}
            aria-labelledby={copy === 0 ? 'hero-clients-label' : undefined}
            aria-hidden={copy > 0 ? true : undefined}
          >
            {logos.map((logo) => {
              // Requested at the largest size shown; the CSS sizes it from --mark.
              const height = Math.round(MARK_MAX * logo.scale);
              return (
                <li key={logo.name} className={styles.clientLogo} style={{ '--scale': logo.scale } as CSSProperties}>
                  {/* Eager (the row is in the first screen) but low priority, after the H1 and the scene;
                      the copies share the first list's files, so this is six small requests. */}
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
