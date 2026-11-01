'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Toc.module.scss';

export interface TocItem {
  id: string;
  text: string;
}

interface ArticleTocProps {
  items: readonly TocItem[];
  /** The element whose reading progress the rail and the phone bar show. */
  bodyId: string;
  label?: string;
  /** Prefix entries with their number (legal documents cite sections by number). */
  numbered?: boolean;
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The sticky contents rail beside long-form text (posts and legal pages).
 *
 * - Every entry is a real in-page link, so the list doubles as navigation.
 * - The section you are reading is marked `aria-current="location"`: the last
 *   heading that has crossed 35% of the viewport.
 * - A hairline structure line beside the list fills in red as the body passes
 *   (the share of the text that has been on screen); phones get the same
 *   reading as a 2px bar at the top of the viewport. Both are written straight
 *   to `transform` from one rAF-throttled scroll handler, never through React
 *   state, and both are hidden under reduced motion (the current-section
 *   marker carries the position instead).
 */
export default function ArticleToc({ items, bodyId, label = 'In this article', numbered = false }: ArticleTocProps) {
  const [active, setActive] = useState<string | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.getElementById(bodyId);
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (body) {
        const rect = body.getBoundingClientRect();
        const read = clamp((vh - rect.top) / Math.max(rect.height, 1));
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${read})`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${read})`;
      }
      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= vh * 0.35) current = heading.id;
        else break;
      }
      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bodyId, items]);

  return (
    <>
      <div ref={barRef} className={styles.bar} aria-hidden="true" />
      <nav className={styles.rail} aria-label={label}>
        <p className={styles.railLabel}>{label}</p>
        <div className={styles.railTrack}>
          <span className={styles.railLine} aria-hidden="true">
            <span ref={fillRef} className={styles.railFill} />
          </span>
          <ol className={styles.railList} role="list">
            {items.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.railLink}
                  aria-current={active === item.id ? 'location' : undefined}
                >
                  {numbered ? (
                    <span className={styles.railIndex} aria-hidden="true">
                      {index + 1}
                    </span>
                  ) : null}
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
