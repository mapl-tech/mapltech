'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { setMotionPaused, useMotionPaused } from '@/components/ui/motionPause';
import styles from './Proof.module.scss';

/** A square mark's height on wide screens: the cap of --mark in Proof.module.scss. */
const MARK_MAX = 56;
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
 * Selected clients as a slow loop, right to left. CSS runs it (each copy
 * slides by its own width, so the seam never shows); this component only adds
 * the page-wide "Pause motion" control (WCAG 2.2.2) and rests the loop while
 * it is off screen. Hover pauses it on desktop. Under reduced motion it is one
 * still row with no copies and no control.
 */
export default function ClientsMarquee({ label, logos }: { label: string; logos: readonly ClientLogo[] }) {
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
      <div className={styles.clientsHead}>
        <p id="clients-label" className={styles.clientsLabel}>
          {label}
        </p>
        <button type="button" className={styles.loopToggle} onClick={() => setMotionPaused(!paused)}>
          <span className={styles.loopIcon} data-paused={paused ? '' : undefined} aria-hidden="true" />
          <span className="visually-hidden">{paused ? 'Play motion' : 'Pause motion'}</span>
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
            className={styles.logos}
            aria-labelledby={copy === 0 ? 'clients-label' : undefined}
            aria-hidden={copy > 0 ? true : undefined}
          >
            {logos.map((logo) => {
              // Requested at the largest size shown; the CSS sizes it from --mark.
              const height = Math.round(MARK_MAX * logo.scale);
              return (
                <li key={logo.name} className={styles.logo} style={{ '--scale': logo.scale } as CSSProperties}>
                  {/* Eager: copies slide in from outside the clipped row, where lazy images may never start loading. */}
                  <Image
                    src={logo.src}
                    alt={copy === 0 ? logo.name : ''}
                    width={Math.round((height * logo.width) / logo.height)}
                    height={height}
                    loading="eager"
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
